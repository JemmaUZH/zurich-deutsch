// 朗读引擎：
//   edge    —— Microsoft Edge 神经网络德语语音（免费、高质量，需联网）
//   openai  —— OpenAI TTS（可选，需要服务端 OPENAI_API_KEY）
//   browser —— 浏览器系统语音（免费、离线，音质取决于系统）
// 默认 auto：edge → openai → browser 依次尝试，失败自动降级。

const ENGINE_KEY = 'zurich_tts_engine';

let engineStatus = { edge: false, openai: false };
let session = 0;
let currentAudio = null;
let currentUtterance = null;
let voicesCache = [];

function refreshVoices() {
  if ('speechSynthesis' in window) voicesCache = window.speechSynthesis.getVoices();
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

function germanVoice() {
  return (
    voicesCache.find((v) => v.lang === 'de-DE') ||
    voicesCache.find((v) => v.lang.startsWith('de')) ||
    null
  );
}

export async function detectTtsEngines() {
  try {
    const res = await fetch('/api/tts/status');
    const data = await res.json();
    engineStatus = { edge: Boolean(data.edge), openai: Boolean(data.openai) };
  } catch {
    engineStatus = { edge: false, openai: false };
  }
  return engineStatus;
}

export function getEnginePref() {
  return localStorage.getItem(ENGINE_KEY) || 'auto';
}

export function setEnginePref(value) {
  localStorage.setItem(ENGINE_KEY, value);
}

export function engineLabel(pref, status = engineStatus) {
  if (pref === 'openai') return status.openai ? 'OpenAI 高质量' : 'OpenAI（未配置）';
  if (pref === 'edge') return 'Edge 免费语音';
  if (pref === 'browser') return '系统语音';
  return '自动（免费优先）';
}

export function stopSpeech() {
  session += 1;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentUtterance) {
    currentUtterance.onend = null;
    currentUtterance.onerror = null;
    currentUtterance = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

async function fetchAudio(path, text, rate) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, rate }),
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  if (blob.size === 0) return null;
  return blob;
}

function playBlob(blob, id, finish) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = () => {
    if (id === session) {
      currentAudio = null;
      URL.revokeObjectURL(url);
      finish();
    }
  };
  audio.onerror = () => {
    if (id === session) {
      currentAudio = null;
      URL.revokeObjectURL(url);
      finish();
    }
  };
  return audio.play().then(
    () => true,
    () => {
      if (id === session) {
        currentAudio = null;
        URL.revokeObjectURL(url);
      }
      return false;
    }
  );
}

function browserSpeak(text, rate, id, finish) {
  if (!('speechSynthesis' in window)) {
    finish();
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  u.rate = rate;
  const voice = germanVoice();
  if (voice) u.voice = voice;
  u.onend = () => {
    if (id === session) {
      currentUtterance = null;
      finish();
    }
  };
  u.onerror = () => {
    if (id === session) {
      currentUtterance = null;
      finish();
    }
  };
  currentUtterance = u;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export async function speak(text, { rate = 1, onEnd } = {}) {
  if (!text) {
    onEnd?.();
    return;
  }
  const id = ++session;
  let finished = false;
  const finish = () => {
    if (!finished) {
      finished = true;
      onEnd?.();
    }
  };

  const pref = getEnginePref();
  const order =
    pref === 'edge' ? ['edge', 'browser'] :
    pref === 'openai' ? ['openai', 'browser'] :
    pref === 'browser' ? ['browser'] :
    ['edge', 'openai', 'browser'];

  for (const engine of order) {
    if (engine === 'edge' && engineStatus.edge) {
      try {
        const blob = await fetchAudio('/api/tts/edge', text, rate);
        if (blob && id === session) {
          if (await playBlob(blob, id, finish)) return;
        }
      } catch {
        // 继续尝试下一个引擎
      }
    }
    if (engine === 'openai' && engineStatus.openai) {
      try {
        const blob = await fetchAudio('/api/tts/openai', text, rate);
        if (blob && id === session) {
          if (await playBlob(blob, id, finish)) return;
        }
      } catch {
        // 继续尝试下一个引擎
      }
    }
    if (engine === 'browser') {
      browserSpeak(text, rate, id, finish);
      return;
    }
  }
  // 所有引擎都不可用
  finish();
}

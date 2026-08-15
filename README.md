# ZüriLese

Learn everyday **German**, **Swiss German**, and **English** through short,
real-life stories and conversations set in Zurich.

## Goal

The app focuses on the language you actually need in daily life:

- **Daily German** — shopping, commuting, flat-hunting, small talk
  - „Ich hätte gern ein Kilo Tomaten.“ — *I'd like a kilo of tomatoes.*
  - „Wo ist der Hörsaal HG F 1?“ — *Where is lecture hall HG F 1?*
  - „Die Kaution bekommst du zurück, wenn du ausziehst.“ — *You get the deposit back when you move out.*
- **Swiss German** — the words locals really use
  - „Grüezi, wie gaht's?“ — *Hello, how are you?*
  - „Merci vielmal!“ — *Thanks a lot!*
  - Badi, Velo, Zmorge, Znüni, Hoi
- **English** — everyday conversations, from doctor visits to neighbour chats
  - „I think I have rhinitis.“
  - „What breed is she? She is a greyhound.“

## Screenshots

![Home – German lessons](/docs/screenshots/home-de.png)
![Reader with tap-to-translate](/docs/screenshots/reader-de.png)
![Flashcards](/docs/screenshots/flashcards-de.png)

## Tech Stack

| Layer | What it is | Why |
| --- | --- | --- |
| **Frontend** | React + Vite | Fast, mobile-friendly SPA with a bottom tab bar on phones |
| **Backend** | Node.js + Express | Simple REST API for lessons, vocabulary and progress |
| **Database** | SQLite (better-sqlite3) | Zero-setup local database, no external service needed |
| **Identity** | Per-device local mode | No sign-up — progress is stored per browser/device |
| **Text-to-Speech** | Microsoft Edge neural voices (free) | Near-human German/English voices, server-side cached; browser voice as fallback, optional OpenAI TTS |
| **Deployment** | Docker + Render | One-container app, auto-deploy from GitHub (`render.yaml`) |

## Features

- Tap any word for an instant English definition
- Click a sentence to read from there; speed control up to 2×
- Hard words are marked with a ★ badge
- Save words to flashcards with spaced-repetition scheduling
- Per-lesson quizzes (optional)
- English UI, Chinese and German lesson content

## Quick Start

```bash
npm run setup   # install dependencies
npm run dev     # http://localhost:5173
```

See [DEPLOY.md](DEPLOY.md) for the free public deployment (Render).

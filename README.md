# ZüriLese

Learn everyday **German**, **Swiss German**, and **English** through short,
real-life stories and conversations set in Zurich.

## Goal

The app focuses on the language you actually need in daily life:

- **Daily German** — shopping, commuting, flat-hunting, small talk
- **Swiss German** — the words locals really use (Badi, Velo, Zmorge, Merci…)
- **English** — everyday conversations, from doctor visits to neighbour chats

## Screenshots

![Home](/docs/screenshots/home.png)
![Reader with tap-to-translate](/docs/screenshots/reader.png)
![Flashcards](/docs/screenshots/flashcards.png)

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

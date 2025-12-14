# AI 3D Character Maker (Tripo + OpenAI)

AI 3D Character Maker is een full-stack webapplicatie waarmee gebruikers game-ready 3D personages kunnen genereren op basis van tekstprompts. Het project combineert AI-promptverrijking met text-to-3D generatie en een interactieve 3D viewer in de browser.

## Project overview

Dit project bestaat uit twee delen:

- **Backend (Node.js + Express)**  
  Verzorgt AI prompt enhancing (OpenAI), start Tripo text-to-3D generatie, volgt de voortgang via polling en bevat een placeholder endpoint voor automatische rigging.

- **Frontend (React + Vite + Three.js)**  
  Een webinterface met promptformulier, stijl- en posepresets, generatiegeschiedenis en een interactieve 3D viewer met camera- en lighting-controls.

## Features

- Text-to-3D character generation
- Optionele AI prompt enhancer
- Style presets (anime, realistic, stylized, chibi, low-poly, etc.)
- Pose presets (idle, hero, battle, running, jump attack)
- Generatie status & progress tracking
- Interactieve 3D viewer (rotate, zoom, front/side/back views)
- Download van gegenereerde `.glb` modellen
- Placeholder voor toekomstige auto-rigging (Mixamo)

## Quickstart

```bash
git clone <repo-url>
cd ai-3d-character-maker

Backend setup
cd backend
npm install


Maak een .env bestand aan in de backend map met je API keys:

PORT=4000
OPENAI_API_KEY=your_openai_key
TRIPO_API_KEY=your_tripo_key
TRIPO_BASE_URL=https://api.tripo3d.ai/v2/openapi


Start de backend:

npm start


De backend draait standaard op http://localhost:4000.

Frontend setup
cd ../frontend
npm install
npm run dev


Open daarna de frontend via Vite (standaard http://localhost:5173).
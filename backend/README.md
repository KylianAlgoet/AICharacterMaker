# Backend - AI 3D Character Maker

## Setup

```bash
cd backend
npm install
```

Maak daarna een `.env` file:

```env
PORT=4000
OPENAI_API_KEY=your_openai_key_here
TRIPO_API_KEY=your_tripo_key_here
TRIPO_BASE_URL=https://api.tripo3d.ai/v2/openapi
```

## Start server

```bash
npm start
```

## Belangrijk

- Pas `tripoClient.js` aan zodat de body en response exact overeenkomen met jouw Tripo OpenAPI spec.
- Endpoint `/api/models/:id/rig` bevat een placeholder voor Mixamo/Blender auto-rig integratie.
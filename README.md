# 🌍 Meteorite Atlas

Interactive dashboard of meteorite impacts with a 3D globe, powered by real NASA data.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + SQLite + Python 3.11 |
| Frontend | React 18 + React Three Fiber + Three.js |
| Deployment | Railway (backend) + Vercel (frontend) |
| Data | NASA Meteorite Landing API |

## Running locally

### Backend
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload
```
API available at `http://localhost:8000` · Interactive docs at `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
App available at `http://localhost:5173`

## Tests

```bash
# Backend
cd backend && pytest tests/ -v

# Frontend
cd frontend && npm run test
```

## Deployment

- **Backend**: Railway auto-detects `/backend` using the `Procfile`
- **Frontend**: Vercel auto-detects `/frontend` using `vercel.json` config

## Data

~45,000 meteorites from the [NASA Meteorite Landing API](https://data.nasa.gov/resource/gh4g-9sfh.json).
Data is loaded into SQLite on server startup and synced monthly. Records span from 860 AD to ~2013 — this is a scientific catalogue, not a real-time impact detection system.

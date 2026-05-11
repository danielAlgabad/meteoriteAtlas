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

~45,000 meteorites from the [NASA Meteorite Landings open dataset](https://data.nasa.gov/dataset/meteorite-landings).
Records span from 860 AD to ~2013; this is a scientific catalogue, not a real-time impact detection system.

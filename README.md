# PhishGuard - AI Powered Phishing Detection Platform

Full-stack project with:
- React + Tailwind frontend dashboard
- FastAPI backend prediction API
- Supabase auth/storage integration
- ML model training pipeline on `phishing.csv`

## Project Structure

- `phishguard-frontend/` React app (Netlify-ready)
- `phishguard-backend/` FastAPI app (Vercel-ready)
- `phishing.csv` dataset used for model training

## Backend Setup

```bash
cd phishguard-backend
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
copy .env.example .env
python app/ml_model/train_model.py
uvicorn app.main:app --reload --port 8000
```

## Frontend Setup

```bash
cd phishguard-frontend
npm install
copy .env.example .env
npm run dev
```

## Required Environment Variables

### Backend (`phishguard-backend/.env`)
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `MODEL_PATH` (default `app/ml_model/model.pkl`)
- `MODEL_META_PATH` (default `app/ml_model/model_meta.json`)

### Frontend (`phishguard-frontend/.env`)
- `VITE_API_BASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Supabase SQL

Run `phishguard-backend/supabase_schema.sql` in Supabase SQL editor.

## Implemented APIs

- `POST /api/scan`
- `GET /api/analytics`
- `GET /api/history`
- `POST /api/history/export` (CSV/PDF)
- `GET /api/threats`
- `GET /api/alerts`
- `GET /api/me`

## Trained Model Result

Training run used your uploaded dataset and selected `RandomForestClassifier` as best by F1.
Current held-out metrics:
- Accuracy: `0.9050`
- Precision: `0.8904`
- Recall: `0.8958`
- F1: `0.8931`

Note: this is below the `>95%` target because live inference is constrained to URL-only features, while the dataset includes multiple non-URL webpage-derived signals.

## Deployment

### Backend to Vercel
- Import `phishguard-backend`
- Keep `vercel.json`
- Configure env vars
- Deploy

### Frontend to Netlify
- Import `phishguard-frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Configure frontend env vars

# PhishGuard Backend

## Run locally

```bash
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
copy .env.example .env
python app/ml_model/train_model.py
uvicorn app.main:app --reload
```

## API endpoints

- `POST /api/scan`
- `GET /api/analytics`
- `GET /api/history`
- `POST /api/history/export`
- `GET /api/threats`
- `GET /api/alerts`

## Deploy to Vercel

1. Import `phishguard-backend` in Vercel.
2. Set env vars from `.env.example`.
3. Ensure `model.pkl` and `model_meta.json` are committed or generated during build.

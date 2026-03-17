# PhishGuard Frontend

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

## Deploy to Netlify

- Base directory: `phishguard-frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Add `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

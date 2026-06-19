# Local Setup

Kalima uses separate backend and frontend npm workspaces.

## 1. Create env files

Copy the backend/platform env template:

```bash
cp .env.example .env
```

Then fill in the real values in `.env`, especially:

```text
DATABASE_URL=postgresql://USER:PASSWORD@127.0.0.1:55432/DB_NAME?schema=public
JWT_SECRET=...
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
```

Copy the frontend env template:

```bash
cp frontend/.env.example frontend/.env.local
```

For local frontend-to-backend traffic, keep:

```text
VITE_API_URL=http://localhost:5001/api/v2
```

## 2. Install dependencies

```bash
cd backend
npm ci

cd ../frontend
npm ci
```

## 3. Run backend

From `kalima-platform/backend`:

```bash
npm run dev
```

Expected health check:

```bash
curl http://127.0.0.1:5001/api/v2/health
```

Expected response:

```json
{"status":"ok","version":"v2 new"}
```

## 4. Run frontend

From `kalima-platform/frontend`:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Notes

- The TypeScript backend requires `DATABASE_URL` for Postgres.
- The legacy backend and legacy scripts may still use `DATABASE_URI` for MongoDB.
- Backend env loading checks `backend/.env` first, then `kalima-platform/.env`.
- Do not commit real `.env` files.

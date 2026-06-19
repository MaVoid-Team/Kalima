# Local Setup

Kalima uses separate backend and frontend npm workspaces.

## Quick local setup with shared cloud dev Postgres

Use this path for normal local development. The backend runs on localhost, but it connects directly to the shared Coolify dev Postgres database that contains a production data copy. No SSH tunnel is required during normal development.

### 1. Install dependencies

```bash
cd backend
npm ci

cd ../frontend
npm ci
```

### 2. Configure the shared dev database

From `kalima-platform/backend`:

```bash
npm run db:dev:configure
```

This creates `backend/.env.local`, which is gitignored. It contains the `DATABASE_URL` for the shared cloud dev database plus safe local auth secrets.

### 3. Ensure local admin login exists

From `kalima-platform/backend`:

```bash
npm run seed:local-admin
```

This creates or resets a dev-only admin user in the shared dev database:

```text
Email: admin@kalima.local
Password: KalimaLocalAdmin!2026
```

### 4. Start backend

From `kalima-platform/backend`:

```bash
npm run dev:local
```

Expected health check:

```bash
curl http://127.0.0.1:5001/api/v2/health
```

Expected response:

```json
{"status":"ok","version":"v2 new"}
```

The admin users endpoint should report the copied production-sized dataset plus the dev-only local admin user, for example `1874` users at the time this setup was written.

### 5. Start frontend

Open another terminal:

```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173 --force
```

Open:

```text
http://127.0.0.1:5173/login
```

## Fallback local setup with embedded Postgres

Use this path only when you want a fully local isolated database instead of the shared cloud dev database.

### 1. Remove cloud dev override if present

If `backend/.env.local` exists, rename or remove it before using embedded Postgres:

```bash
cd backend
mv .env.local .env.local.cloud-dev
```

### 2. Start local Postgres

Open terminal 1 from `kalima-platform/backend`:

```bash
npm run db:local
```

This starts embedded Postgres on:

```text
postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima
```

Keep this terminal open while developing.

### 3. Setup schema, lookup data, and local admin

Open terminal 2:

```bash
cd backend
npm run db:local:setup
```

This runs Prisma migrations, syncs the local schema, seeds lookup data, and creates/resets a local admin:

```text
Email: admin@kalima.local
Password: KalimaLocalAdmin!2026
```

These credentials are local-dev only.

### 4. Start backend

Terminal 2:

```bash
npm run dev:local
```

Expected health check:

```bash
curl http://127.0.0.1:5001/api/v2/health
```

Expected response:

```json
{"status":"ok","version":"v2 new"}
```

### 5. Start frontend

Open terminal 3:

```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173 --force
```

Open:

```text
http://127.0.0.1:5173/login
```

## Manual env setup

Use this path when you have a cloud/VPS Postgres tunnel or your own Postgres.

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

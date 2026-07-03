# Kalima

Local development uses a Vite React frontend and an Express backend inside `kalima-platform`.

## Local Setup

Install dependencies from the repo root:

```bash
npm install
npm --prefix kalima-platform/frontend install
npm --prefix kalima-platform/backend install
```

Create local environment files if they do not already exist:

```bash
cp kalima-platform/.env.example kalima-platform/.env
cp kalima-platform/frontend/.env.example kalima-platform/frontend/.env.local
cp kalima-platform/backend/.env.example kalima-platform/backend/.env
```

Update the env files with the local database, Redis, Firebase, and service credentials required by the backend.

## Run Locally

Start the frontend and backend together from the repo root:

```bash
npm run dev
```

This runs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

The Vite dev server proxies frontend requests for `/api` to the backend on `http://localhost:5001` by default. Override it with `VITE_API_PROXY_TARGET` or `VITE_API_URL` if you run the backend elsewhere.

## Run Services Separately

Frontend only:

```bash
npm --prefix kalima-platform/frontend run dev -- --host 0.0.0.0
```

Backend only:

```bash
npm --prefix kalima-platform/backend run dev:local
```

## Android Testing

1. Download and install Android Studio.
2. Download Java JDK 21.
3. Configure environment variables for `ANDROID_HOME` and `JAVA_HOME`.
4. Run the production build:

```bash
cd kalima-platform
npm run build
```

5. Sync Capacitor:

```bash
npx cap sync
```

6. Run Android:

```bash
npx cap run android
```

## Android Environment Variables

After installing Android Studio:

1. Open system environment variables.
2. Add `ANDROID_HOME` with the Android SDK path, for example:

```text
C:\Users\<username>\AppData\Local\Android\Sdk
```

3. Add `JAVA_HOME` with the JDK path, for example:

```text
C:\Program Files\Java\jdk-21
```

4. Restart your IDE and terminal.
5. Verify with:

```powershell
echo %ANDROID_HOME%
echo %JAVA_HOME%
```

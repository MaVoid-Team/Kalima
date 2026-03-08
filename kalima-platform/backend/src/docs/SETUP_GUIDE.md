# Setup & Local Development Guide

Running the Kalima backend locally requires several dependencies. Follow this step-by-step guide to achieve a stable development environment.

## 1. Primary Prerequisites

Ensure your local development machine has the following tools installed and accessible via your terminal:

- **Node.js**: (v18 or v20 LTS Recommended). Verify with `node -v`.
- **PostgreSQL**: Used for relational data storage. You can run this natively or via Docker.
- **Redis**: Required for caching and websocket pub/sub. Recommended to run via Docker.
- **Git**: For version control.

## 2. Configuring the Environment (`.env`)

The backend relies heavily on environment variables for sensitive keys and connection strings.
Create a `.env` file at the root of the `backend/` directory by duplicating the example file (if it exists) or requesting the current dev keys from a team member.

**Critical Variables Required for Boot:**

```env
# Application Port
PORT=5000

# Database Connections
DATABASE_URL="postgresql://username:password@localhost:5432/kalimadb?schema=public"
REDIS_URL="redis://localhost:6379"

# Authentication & Security
JWT_SECRET="your_super_secret_jwt_string"
JWT_EXPIRES_IN="7d"

# Third-Party Integrations
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

## 3. Installation & Preparation

1.  Navigate into the `backend/` directory from the root project.
    ```bash
    cd backend
    ```
2.  Install all Node dependencies recursively.
    ```bash
    npm install
    ```

## 4. Initializing the Database (Prisma)

Before your code can execute successfully, your local PostgreSQL database must reflect the application's schema, and the TypeScript client must be generated.

```bash
# 1. Sync the Prisma schema to your local empty PostgreSQL database
npx prisma db push

# 2. Generate the TypeScript Prisma client (Enables autocomplete)
npx prisma generate
```

### Seeding Initial Data

To test features like products, categories, or authentication, you need initial database records.

```bash
# Run the core seeders
npm run seed

# Run supplementary governmental/zone seeders
npm run seed:governments
```

## 5. Starting the Development Server

The `package.json` contains scripts to boot the server in different execution modes.

```bash
# 🚀 Recommended: Starts server with ts-node-dev enabling fast hot-reloading
npm run dev

# Alternative: Starts server using nodemon (typically for JS legacy mode)
npm run dev:legacy
```

**Verifying the Setup:**
Once you see `🚀 Server running on port X` in your terminal, open your browser or Postman and hit:
`http://localhost:5000/api/v2/health`
You should receive a `{"status": "ok", "version": "v2 new"}` response.

---

## 6. Common Troubleshooting

| Issue Description                            | Potential Cause                               | Solution                                                      |
| :------------------------------------------- | :-------------------------------------------- | :------------------------------------------------------------ |
| `EADDRINUSE: address already in use :::5000` | Another process is blocking the port.         | Find the PID (`lsof -i :5000`) and kill it (`kill -9 <PID>`). |
| `Cannot find module '@prisma/client'`        | Prisma client wasn't built.                   | Run `npx prisma generate`.                                    |
| `Redis connection to localhost:6379 failed`  | Redis server isn't running.                   | Start Redis (e.g., `docker run -p 6379:6379 -d redis`).       |
| `Authentication Failed / Invalid Signature`  | Your `JWT_SECRET` in `.env` is missing/wrong. | Ensure the token was generated using the _exact_ same secret. |

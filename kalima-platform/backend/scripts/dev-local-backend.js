const net = require("net");
const path = require("path");
const { spawn } = require("child_process");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const defaultDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";
const databaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl;

const getDatabaseEndpoint = (dbUrl = databaseUrl) => {
  const url = new URL(dbUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 5432),
  };
};

const canConnect = ({ host, port }, timeoutMs = 2000) => new Promise((resolve) => {
  const socket = net.createConnection({ host, port });
  const timer = setTimeout(() => {
    socket.destroy();
    resolve(false);
  }, timeoutMs);
  socket.once("connect", () => {
    clearTimeout(timer);
    socket.destroy();
    resolve(true);
  });
  socket.once("error", () => {
    clearTimeout(timer);
    resolve(false);
  });
});

async function main() {
  let effectiveDbUrl = databaseUrl;
  let endpoint = getDatabaseEndpoint(effectiveDbUrl);
  if (!(await canConnect(endpoint))) {
    const localEndpoint = getDatabaseEndpoint(defaultDatabaseUrl);
    if (await canConnect(localEndpoint)) {
      console.log(`Configured Postgres (${endpoint.host}:${endpoint.port}) unreachable, falling back to local Postgres at ${localEndpoint.host}:${localEndpoint.port}`);
      effectiveDbUrl = defaultDatabaseUrl;
      endpoint = localEndpoint;
    } else {
      console.error(`Cannot reach Postgres at ${endpoint.host}:${endpoint.port}.`);
      console.error("For the shared cloud dev DB, run: npm run db:dev:configure");
      console.error("For embedded local Postgres, run: npm run db:local");
      process.exit(1);
    }
  }

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(npm, ["run", "dev"], {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: effectiveDbUrl,
      PORT: process.env.PORT || "5001",
      NODE_ENV: process.env.NODE_ENV || "development",
      FIREBASE_AUTH_LOCAL_DEV_BYPASS: process.env.FIREBASE_AUTH_LOCAL_DEV_BYPASS || "true",
      LOCAL_DEV_BYPASS_AUTH: process.env.LOCAL_DEV_BYPASS_AUTH || "true",
      DEV_BYPASS_AUTH: process.env.DEV_BYPASS_AUTH || "true",
      JWT_SECRET: process.env.JWT_SECRET || "local-dev-secret",
      ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "local-dev-access-secret",
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "local-dev-refresh-secret",
      APP_URL: process.env.APP_URL || "http://localhost:5173",
    },
  });

  child.on("exit", (code) => process.exit(code || 0));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

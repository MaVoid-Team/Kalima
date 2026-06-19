const net = require("net");
const { spawn } = require("child_process");

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";

const canConnect = (port = 55432) => new Promise((resolve) => {
  const socket = net.createConnection({ host: "127.0.0.1", port });
  socket.once("connect", () => {
    socket.destroy();
    resolve(true);
  });
  socket.once("error", () => resolve(false));
});

async function main() {
  if (!(await canConnect())) {
    console.error("Local Postgres is not running on 127.0.0.1:55432.");
    console.error("Start it first with: npm run db:local");
    process.exit(1);
  }

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(npm, ["run", "dev"], {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      PORT: process.env.PORT || "5001",
      NODE_ENV: process.env.NODE_ENV || "development",
      FIREBASE_AUTH_LOCAL_DEV_BYPASS: process.env.FIREBASE_AUTH_LOCAL_DEV_BYPASS || "true",
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

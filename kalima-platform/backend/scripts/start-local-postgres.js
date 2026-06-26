const fs = require("fs");
const net = require("net");
const path = require("path");

const port = Number(process.env.LOCAL_POSTGRES_PORT || 55432);
const user = process.env.LOCAL_POSTGRES_USER || "postgres";
const password = process.env.LOCAL_POSTGRES_PASSWORD || "postgres";
const databaseDir = process.env.LOCAL_POSTGRES_DIR || path.resolve(__dirname, "..", ".local", "embedded-postgres");
const logPath = path.resolve(__dirname, "..", ".local", "embedded-postgres.log");

const waitForPort = () => new Promise((resolve) => {
  const socket = net.createConnection({ host: "127.0.0.1", port });
  socket.once("connect", () => {
    socket.destroy();
    resolve(true);
  });
  socket.once("error", () => resolve(false));
});

async function main() {
  const { default: EmbeddedPostgres } = await import("embedded-postgres");

  if (await waitForPort()) {
    console.log(`Local Postgres is already listening on 127.0.0.1:${port}.`);
    return;
  }

  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const log = fs.createWriteStream(logPath, { flags: "a" });
  const writeLog = (message) => log.write(`${new Date().toISOString()} ${String(message)}\n`);

  const pg = new EmbeddedPostgres({
    databaseDir,
    user,
    password,
    port,
    persistent: true,
    onLog: writeLog,
    onError: writeLog,
  });

  await pg.initialise();
  await pg.start();

  console.log(`Local Postgres started on 127.0.0.1:${port}`);
  console.log(`Data dir: ${databaseDir}`);
  console.log(`Log file: ${logPath}`);

  const stop = async () => {
    console.log("Stopping local Postgres...");
    await pg.stop().catch((error) => writeLog(error?.stack || error));
    process.exit(0);
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

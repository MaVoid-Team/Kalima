const net = require("net");
const { spawnSync } = require("child_process");

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";
const schema = "src/apps/store-api/prisma/schema.prisma";

const canConnect = (port = 55432) => new Promise((resolve) => {
  const socket = net.createConnection({ host: "127.0.0.1", port });
  socket.once("connect", () => {
    socket.destroy();
    resolve(true);
  });
  socket.once("error", () => resolve(false));
});

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, DATABASE_URL: databaseUrl, ...env },
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

async function main() {
  if (!(await canConnect())) {
    console.error("Local Postgres is not running on 127.0.0.1:55432.");
    console.error("Start it first with: npm run db:local");
    process.exit(1);
  }

  console.log("Applying Prisma migrations...");
  run("npx", ["prisma", "migrate", "deploy", "--schema", schema]);

  console.log("Syncing local schema with Prisma schema...");
  run("npx", ["prisma", "db", "push", "--accept-data-loss", "--schema", schema]);

  console.log("Seeding local lookup data...");
  run("node", ["scripts/seed-local-test-data.js"]);

  console.log("Creating local admin...");
  run("node", ["scripts/seed-local-admin.js"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

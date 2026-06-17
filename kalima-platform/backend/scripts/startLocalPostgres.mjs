import EmbeddedPostgres from "embedded-postgres";

const pg = new EmbeddedPostgres({
  databaseDir: "./.local-postgres/data",
  user: "postgres",
  password: "postgres",
  port: 55432,
  persistent: true,
  onLog: () => {},
  onError: console.error,
});

async function main() {
  await pg.initialise();
  await pg.start();
  console.log("LOCAL_POSTGRES_READY");
  console.log("postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima");
  setInterval(() => {}, 1 << 30);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

const bcrypt = require("bcrypt");
const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

const net = require("net");

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const defaultDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";
const configuredDatabaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl;

const email = (process.env.LOCAL_SUBADMIN_EMAIL || "subadmin@kalima.local").toLowerCase();
const password = process.env.LOCAL_SUBADMIN_PASSWORD || "pass1234";
const name = process.env.LOCAL_SUBADMIN_NAME || "Local SubAdmin";

const canConnect = (dbUrl, timeoutMs = 1500) =>
  new Promise((resolve) => {
    try {
      const url = new URL(dbUrl);
      const host = url.hostname;
      const port = Number(url.port || 5432);
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
    } catch {
      resolve(false);
    }
  });

async function main() {
  let effectiveDbUrl = configuredDatabaseUrl;
  if (!(await canConnect(effectiveDbUrl))) {
    effectiveDbUrl = defaultDatabaseUrl;
  }
  const pool = new Pool({ connectionString: effectiveDbUrl });
  const client = await pool.connect();

  try {
    await client.query("set search_path to kalima");
    await client.query("begin");

    const hash = await bcrypt.hash(password, 10);
    const existing = await client.query("select id from users where email = $1", [email]);
    let userId;

    if (existing.rowCount) {
      userId = existing.rows[0].id;
      await client.query(
        `
          update users
          set name = $2,
              password = $3,
              role = 'SubAdmin',
              is_email_verified = true,
              confirmed = true,
              email_verified_at = now(),
              is_deleted = false,
              deleted_at = null,
              updated_at = now()
          where id = $1
        `,
        [userId, name, hash]
      );
    } else {
      const inserted = await client.query(
        `
          insert into users (name, email, password, role, is_email_verified, confirmed, email_verified_at, is_deleted, created_at, updated_at)
          values ($1, $2, $3, 'SubAdmin', true, true, now(), false, now(), now())
          returning id
        `,
        [name, email, hash]
      );
      userId = inserted.rows[0].id;
    }

    await client.query(
      `
        insert into auth_identities (user_id, provider, provider_user_id, provider_email)
        values ($1, 'local', $2, $2)
        on conflict (provider, provider_user_id)
        do update set user_id = excluded.user_id, provider_email = excluded.provider_email
      `,
      [userId, email]
    );

    for (const portal of ["store", "academy"]) {
      await client.query(
        `
          insert into user_roles (user_id, portal, role)
          values ($1, $2, 'SubAdmin')
          on conflict (user_id, portal, role) do nothing
        `,
        [userId, portal]
      );
    }

    await client.query("commit");
    console.log("SUBADMIN_CREATED:", { userId, name, email, password, role: "SubAdmin" });
  } catch (err) {
    await client.query("rollback");
    console.error("ERROR:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();

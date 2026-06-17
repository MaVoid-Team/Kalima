import bcrypt from "bcrypt";
import { Client } from "pg";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";
const schema = new URL(databaseUrl).searchParams.get("schema") ?? "public";

const client = new Client({ connectionString: databaseUrl });

async function ensureRole(userId, role) {
  await client.query(
    `
      INSERT INTO user_roles (user_id, portal, role)
      VALUES ($1, 'store', $2)
      ON CONFLICT (user_id, portal, role) DO NOTHING
    `,
    [userId, role],
  );
}

async function upsertUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await client.query(
    `
      INSERT INTO users (
        name,
        email,
        password,
        role,
        confirmed,
        is_email_verified,
        is_deleted
      )
      VALUES ($1, $2, $3, $4, true, true, false)
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        confirmed = true,
        is_email_verified = true,
        is_deleted = false
      RETURNING id, email
    `,
    [name, email, passwordHash, role],
  );

  const user = result.rows[0];
  await ensureRole(user.id, role);
  return user;
}

async function main() {
  await client.connect();
  await client.query(`SET search_path TO ${schema}, public`);

  const admin = await upsertUser({
    name: "Super Admin",
    email: "super-admin@kalima-edu.com",
    password: "Kalima1234",
    role: "Admin",
  });

  const target = await upsertUser({
    name: "Amina Hassan",
    email: "appreciation-user@kalima.test",
    password: "Kalima1234",
    role: "Teacher",
  });

  console.log(
    JSON.stringify(
      {
        admin: { id: admin.id, email: admin.email, password: "Kalima1234" },
        targetUser: { id: target.id, email: target.email, password: "Kalima1234" },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });

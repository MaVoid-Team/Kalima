require("dotenv").config();

const { Pool } = require("pg");

const DEFAULT_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";

const governments = {
  Cairo: ["Nasr City", "Maadi", "New Cairo", "Heliopolis", "Shoubra"],
  Giza: ["Dokki", "Mohandessin", "Haram", "6th of October", "Sheikh Zayed"],
  Alexandria: ["Smouha", "Sidi Gaber", "Gleem", "Miami"],
  Dakahlia: ["Mansoura", "Talkha", "Mit Ghamr"],
  Sharqia: ["Zagazig", "10th of Ramadan", "Belbeis"],
};

const subjects = [
  "Arabic",
  "English",
  "Mathematics",
  "Science",
  "Social Studies",
  "Physics",
  "Chemistry",
  "Biology",
];

const levels = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "Preparatory 1",
  "Preparatory 2",
  "Preparatory 3",
  "Secondary 1",
  "Secondary 2",
  "Secondary 3",
];

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
  });
  const client = await pool.connect();

  try {
    await client.query("set search_path to kalima");
    await client.query("begin");

    for (const [governmentTitle, zoneTitles] of Object.entries(governments)) {
      const governmentResult = await client.query(
        `
          insert into government (title, active)
          values ($1, true)
          on conflict (title) do update set active = excluded.active
          returning id
        `,
        [governmentTitle],
      );
      const governmentId = governmentResult.rows[0].id;

      for (const zoneTitle of zoneTitles) {
        await client.query(
          `
            insert into zones (title, government_id, active)
            values ($1, $2, true)
            on conflict (title, government_id) do update set active = excluded.active
          `,
          [zoneTitle, governmentId],
        );
      }
    }

    for (const title of subjects) {
      await client.query(
        `
          insert into subjects (title, active)
          values ($1, true)
          on conflict (title) do update set active = excluded.active
        `,
        [title],
      );
    }

    for (const title of levels) {
      await client.query(
        `
          insert into levels (title, active)
          values ($1, true)
          on conflict (title) do update set active = excluded.active
        `,
        [title],
      );
    }

    await client.query("commit");
    console.log("Seeded local governments, zones, subjects, and levels.");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";

async function repairEBookletInstanceTitles() {
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    let schema = "kalima";
    try {
      const parsed = new URL(databaseUrl);
      if (parsed.searchParams.get("schema")) {
        schema = parsed.searchParams.get("schema");
      }
    } catch (_) {}

    await client.query(`SET search_path TO ${schema}, public`);
    console.log(`Connected to database (schema: ${schema})`);

    // 1. Synchronize all instances linked to templates to their latest template title and update branding_json
    const resultWithPurchases = await client.query(`
      UPDATE e_booklet_instances i
      SET display_title = TRIM(t.title),
          branding_json = jsonb_set(
            COALESCE(i.branding_json::jsonb, '{}'::jsonb),
            '{bookletTitle}',
            to_jsonb(TRIM(t.title))
          ),
          updated_at = NOW()
      FROM e_booklet_templates t
      WHERE i.template_id = t.id
        AND t.title IS NOT NULL
        AND TRIM(t.title) <> ''
        AND (
          i.display_title <> TRIM(t.title)
          OR COALESCE(i.branding_json->>'bookletTitle', '') <> TRIM(t.title)
        )
    `);

    console.log(`Synchronized ${resultWithPurchases.rowCount} instances with current template titles.`);

    // 2. Synchronize all purchases linked to templates to match the latest template title in branding_json
    const resultPurchases = await client.query(`
      UPDATE e_booklet_purchases p
      SET branding_json = jsonb_set(
            COALESCE(p.branding_json::jsonb, '{}'::jsonb),
            '{bookletTitle}',
            to_jsonb(TRIM(t.title))
          ),
          updated_at = NOW()
      FROM e_booklet_templates t
      WHERE p.template_id = t.id
        AND t.title IS NOT NULL
        AND TRIM(t.title) <> ''
        AND COALESCE(p.branding_json->>'bookletTitle', '') <> TRIM(t.title)
    `);

    console.log(`Synchronized ${resultPurchases.rowCount} purchases with current template titles.`);
    console.log("E-booklet instance titles repair completed successfully.");
  } catch (error) {
    console.error("Error repairing e-booklet instance titles:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  repairEBookletInstanceTitles();
}

module.exports = { repairEBookletInstanceTitles };

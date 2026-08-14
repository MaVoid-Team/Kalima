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

    // 1. Synchronize all instances linked to purchases without custom branding to their latest template title
    const resultWithPurchases = await client.query(`
      UPDATE e_booklet_instances i
      SET display_title = COALESCE(
            NULLIF(TRIM(i.branding_json->>'bookletTitle'), ''),
            NULLIF(TRIM(p.branding_json->>'bookletTitle'), ''),
            NULLIF(TRIM(t.title), ''),
            i.display_title
          ),
          updated_at = NOW()
      FROM e_booklet_templates t
      LEFT JOIN e_booklet_purchases p ON i.purchase_id = p.id
      WHERE i.template_id = t.id
        AND t.title IS NOT NULL
        AND TRIM(t.title) <> ''
        AND (
          NULLIF(TRIM(COALESCE(i.branding_json->>'bookletTitle', p.branding_json->>'bookletTitle', '')), '') IS NULL
          OR i.display_title ~* '^Teacher e-booklet #\\d+$'
          OR i.display_title ~* '^e-booklet #\\d+$'
          OR i.display_title ~* '^كتاب إلكتروني #\\d+$'
          OR i.display_title ~* '^مذكرة إلكترونية #\\d+$'
          OR TRIM(i.display_title) = ''
          OR i.display_title IS NULL
        )
        AND i.display_title <> TRIM(t.title)
    `);

    console.log(`Synchronized ${resultWithPurchases.rowCount} instances with current template titles.`);

    // 2. Update any standalone instances that have placeholder titles or outdated titles without custom branding
    const resultStandalone = await client.query(`
      UPDATE e_booklet_instances i
      SET display_title = TRIM(t.title),
          updated_at = NOW()
      FROM e_booklet_templates t
      WHERE i.template_id = t.id
        AND NULLIF(TRIM(COALESCE(i.branding_json->>'bookletTitle', '')), '') IS NULL
        AND t.title IS NOT NULL
        AND TRIM(t.title) <> ''
        AND (
          i.display_title ~* '^Teacher e-booklet #\\d+$'
          OR i.display_title ~* '^e-booklet #\\d+$'
          OR i.display_title ~* '^كتاب إلكتروني #\\d+$'
          OR i.display_title ~* '^مذكرة إلكترونية #\\d+$'
          OR TRIM(i.display_title) = ''
          OR i.display_title IS NULL
          OR i.display_title <> TRIM(t.title)
        )
    `);

    console.log(`Synchronized ${resultStandalone.rowCount} standalone instances from template titles.`);
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

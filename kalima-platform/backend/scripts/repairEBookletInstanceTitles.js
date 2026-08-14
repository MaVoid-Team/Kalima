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

    // 1. Update e_booklet_instances having placeholder / default generated titles
    // Prefer purchase branding title if present, otherwise use template title.
    const resultWithPurchases = await client.query(`
      UPDATE e_booklet_instances i
      SET display_title = COALESCE(
            NULLIF(TRIM(p.branding_json->>'bookletTitle'), ''),
            NULLIF(TRIM(t.title), ''),
            i.display_title
          ),
          updated_at = NOW()
      FROM e_booklet_purchases p, e_booklet_templates t
      WHERE i.purchase_id = p.id
        AND i.template_id = t.id
        AND (
          i.display_title ~* '^Teacher e-booklet #\\d+$'
          OR i.display_title ~* '^e-booklet #\\d+$'
          OR i.display_title ~* '^كتاب إلكتروني #\\d+$'
          OR i.display_title ~* '^مذكرة إلكترونية #\\d+$'
          OR TRIM(i.display_title) = ''
          OR i.display_title IS NULL
        )
    `);

    console.log(`Updated ${resultWithPurchases.rowCount} instances linked to purchases.`);

    // 2. Update any standalone instances that have placeholder titles but no purchase record
    const resultStandalone = await client.query(`
      UPDATE e_booklet_instances i
      SET display_title = TRIM(t.title),
          updated_at = NOW()
      FROM e_booklet_templates t
      WHERE i.template_id = t.id
        AND (
          i.display_title ~* '^Teacher e-booklet #\\d+$'
          OR i.display_title ~* '^e-booklet #\\d+$'
          OR i.display_title ~* '^كتاب إلكتروني #\\d+$'
          OR i.display_title ~* '^مذكرة إلكترونية #\\d+$'
          OR TRIM(i.display_title) = ''
          OR i.display_title IS NULL
        )
        AND t.title IS NOT NULL
        AND TRIM(t.title) <> ''
    `);

    console.log(`Updated ${resultStandalone.rowCount} standalone instances from template titles.`);
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

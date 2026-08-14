const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";

async function repairUserAnalytics() {
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    // Determine schema from URL or default to kalima
    let schema = "kalima";
    try {
      const parsed = new URL(databaseUrl);
      if (parsed.searchParams.get("schema")) {
        schema = parsed.searchParams.get("schema");
      }
    } catch (_) {}

    await client.query(`SET search_path TO ${schema}, public`);
    console.log(`Connected to database (schema: ${schema})`);

    // Ensure all users have a user_analytics row
    await client.query(`
      INSERT INTO user_analytics (user_id, views, total_spent, number_of_purchases, successful_invites, monthly_confirmed_count, last_confirmed_count_update)
      SELECT u.id, 0, 0, 0, 0, 0, NOW()
      FROM users u
      LEFT JOIN user_analytics ua ON ua.user_id = u.id
      WHERE ua.user_id IS NULL
      ON CONFLICT (user_id) DO NOTHING
    `);

    // Query actual purchase statistics per user
    const statsQuery = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        COALESCE(ua.total_spent, 0)::numeric AS current_total_spent,
        COALESCE(ua.number_of_purchases, 0)::int AS current_number_of_purchases,
        COALESCE(p_agg.calculated_total_spent, 0)::numeric AS calculated_total_spent,
        COALESCE(p_agg.calculated_purchases, 0)::int AS calculated_purchases
      FROM users u
      LEFT JOIN user_analytics ua ON ua.user_id = u.id
      LEFT JOIN (
        SELECT 
          user_id,
          SUM(total) AS calculated_total_spent,
          COUNT(id) AS calculated_purchases
        FROM purchases
        WHERE is_deleted = false AND deleted_at IS NULL
        GROUP BY user_id
      ) p_agg ON p_agg.user_id = u.id
    `;

    const result = await client.query(statsQuery);
    let repairedCount = 0;
    let unchangedCount = 0;

    for (const row of result.rows) {
      const currentSpent = Number(row.current_total_spent);
      const calculatedSpent = Number(row.calculated_total_spent);
      const currentPurchases = Number(row.current_number_of_purchases);
      const calculatedPurchases = Number(row.calculated_purchases);

      if (currentSpent !== calculatedSpent || currentPurchases !== calculatedPurchases) {
        await client.query(
          `
            UPDATE user_analytics
            SET total_spent = $1,
                number_of_purchases = $2
            WHERE user_id = $3
          `,
          [calculatedSpent, calculatedPurchases, row.user_id]
        );
        console.log(
          `[REPAIRED] User #${row.user_id} (${row.name || row.email}): total_spent ${currentSpent} -> ${calculatedSpent}, purchases ${currentPurchases} -> ${calculatedPurchases}`
        );
        repairedCount++;
      } else {
        unchangedCount++;
      }
    }

    console.log(`\n--- Repair Summary ---`);
    console.log(`Total users checked: ${result.rowCount}`);
    console.log(`Repaired: ${repairedCount}`);
    console.log(`Already accurate: ${unchangedCount}`);
  } finally {
    client.release();
    await pool.end();
  }
}

repairUserAnalytics()
  .then(() => {
    console.log("User analytics repair completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to repair user analytics:", err);
    process.exit(1);
  });

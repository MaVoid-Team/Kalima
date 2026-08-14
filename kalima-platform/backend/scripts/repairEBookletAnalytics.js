const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";

async function repairEBookletAnalytics() {
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

    // 1. Backfill teacher purchase events from e_booklet_purchases
    const purchaseResult = await client.query(`
      INSERT INTO e_booklet_analytics_events (
        event_type,
        teacher_id,
        template_id,
        purchase_id,
        source,
        marketing_price_snapshot,
        internal_price_snapshot,
        metadata,
        created_at
      )
      SELECT 
        CASE 
          WHEN p.status = 'delivered' THEN 'teacher_purchase_delivered'
          ELSE 'teacher_purchase_requested'
        END AS event_type,
        p.teacher_id,
        p.template_id,
        p.id AS purchase_id,
        'public_store' AS source,
        COALESCE(p.price, p.marketing_price, 0) AS marketing_price_snapshot,
        COALESCE(p.internal_price, 0) AS internal_price_snapshot,
        json_build_object('backfilled', true, 'purchase_status', p.status::text),
        COALESCE(p.created_at, NOW())
      FROM e_booklet_purchases p
      WHERE NOT EXISTS (
        SELECT 1 FROM e_booklet_analytics_events e 
        WHERE e.purchase_id = p.id 
          AND e.event_type IN ('teacher_purchase_requested', 'teacher_purchase_delivered')
      )
    `);
    console.log(`Backfilled ${purchaseResult.rowCount || 0} purchase analytics events.`);

    // 2. Backfill student access events from e_booklet_access
    const accessResult = await client.query(`
      INSERT INTO e_booklet_analytics_events (
        event_type,
        teacher_id,
        student_id,
        template_id,
        booklet_instance_id,
        access_id,
        source,
        marketing_price_snapshot,
        internal_price_snapshot,
        metadata,
        created_at
      )
      SELECT 
        'access_created' AS event_type,
        inst.teacher_id,
        acc.user_id AS student_id,
        inst.template_id,
        acc.booklet_instance_id,
        acc.id AS access_id,
        COALESCE(acc.access_source, 'offline_passcode') AS source,
        COALESCE(inst.student_marketing_price, 0) AS marketing_price_snapshot,
        COALESCE(inst.internal_price, 0) AS internal_price_snapshot,
        json_build_object('backfilled', true, 'access_role', acc.role::text),
        COALESCE(acc.granted_at, NOW())
      FROM e_booklet_access acc
      JOIN e_booklet_instances inst ON inst.id = acc.booklet_instance_id
      WHERE acc.role = 'student'
        AND NOT EXISTS (
          SELECT 1 FROM e_booklet_analytics_events e 
          WHERE e.access_id = acc.id AND e.event_type = 'access_created'
        )
    `);
    console.log(`Backfilled ${accessResult.rowCount || 0} student access analytics events.`);

    // 3. Backfill device bound events from e_booklet_devices
    const deviceResult = await client.query(`
      INSERT INTO e_booklet_analytics_events (
        event_type,
        teacher_id,
        student_id,
        template_id,
        booklet_instance_id,
        source,
        metadata,
        created_at
      )
      SELECT 
        'device_bound' AS event_type,
        inst.teacher_id,
        dev.user_id AS student_id,
        inst.template_id,
        dev.booklet_instance_id,
        'device_registration' AS source,
        json_build_object('backfilled', true, 'device_status', dev.status::text, 'device_label', dev.device_label),
        COALESCE(dev.first_seen_at, NOW())
      FROM e_booklet_devices dev
      JOIN e_booklet_instances inst ON inst.id = dev.booklet_instance_id
      WHERE NOT EXISTS (
        SELECT 1 FROM e_booklet_analytics_events e 
        WHERE e.booklet_instance_id = dev.booklet_instance_id 
          AND e.student_id = dev.user_id 
          AND e.event_type = 'device_bound'
      )
    `);
    console.log(`Backfilled ${deviceResult.rowCount || 0} device analytics events.`);

    console.log("E-Booklet analytics repair and backfill completed successfully.");
  } catch (error) {
    console.error("Error repairing e-booklet analytics:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  repairEBookletAnalytics();
}

module.exports = { repairEBookletAnalytics };

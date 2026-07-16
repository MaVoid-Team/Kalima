const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";
const demoMarker = "Local teacher access directory demo";

const teachers = [
  { name: "Nour Academy", email: "nour.academy@kalima.local", titles: ["Science Essentials", "Math Skills Builder", "English Revision Pack"], quota: 90, used: [18, 9, 24] },
  { name: "Ziad Ahmed", email: "ziad.ahmed@kalima.local", titles: ["Physics Problem Solving"], quota: 45, used: [12] },
  { name: "فريدة", email: "farida@kalima.local", titles: ["مذكرة علوم تانية إعدادي", "مذكرة رياضيات", "مراجعة نهائية 2027", "أساسيات اللغة العربية"], quota: 120, used: [36, 18, 52, 10] },
];

async function ensureUser(client, { name, email, role }) {
  const existing = await client.query("select id from users where email = $1", [email]);
  if (existing.rowCount) return existing.rows[0].id;

  const inserted = await client.query(
    `insert into users (name, email, role, is_email_verified, confirmed, email_verified_at, is_deleted, created_at, updated_at)
     values ($1, $2, $3, true, true, now(), false, now(), now())
     returning id`,
    [name, email, role],
  );
  const userId = inserted.rows[0].id;
  await client.query(
    `insert into user_roles (user_id, portal, role)
     values ($1, 'store', $2), ($1, 'academy', $2)
     on conflict (user_id, portal, role) do nothing`,
    [userId, role],
  );
  await client.query("insert into user_analytics (user_id) values ($1) on conflict (user_id) do nothing", [userId]);
  return userId;
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("set search_path to kalima");
    await client.query("begin");

    const admin = await client.query("select id from users where email = $1", ["admin@kalima.local"]);
    if (!admin.rowCount) throw new Error("Run seed:local-admin before seeding the teacher access demo.");
    const adminId = admin.rows[0].id;

    const templateResult = await client.query("select id from e_booklet_templates where slug = $1", ["local-access-directory-demo"]);
    const templateId = templateResult.rowCount
      ? templateResult.rows[0].id
      : (await client.query(
        `insert into e_booklet_templates (title, slug, description, price, marketing_price, currency, status, created_by, created_at)
         values ('Local teacher access demo', 'local-access-directory-demo', 'Seed data for the local teacher-first access directory.', 0, 0, 'EGP', 'published', $1, now())
         returning id`,
        [adminId],
      )).rows[0].id;

    const versionResult = await client.query(
      "select id from e_booklet_template_versions where template_id = $1 and version_number = 1",
      [templateId],
    );
    const versionId = versionResult.rowCount
      ? versionResult.rows[0].id
      : (await client.query(
        `insert into e_booklet_template_versions (template_id, version_number, page_count, status, created_by, created_at, published_at)
         values ($1, 1, 1, 'active', $2, now(), now())
         returning id`,
        [templateId, adminId],
      )).rows[0].id;

    let instancesCreated = 0;
    for (const teacher of teachers) {
      const teacherId = await ensureUser(client, { ...teacher, role: "Teacher" });
      const studentId = await ensureUser(client, {
        name: `${teacher.name} Student`,
        email: `${teacher.email.replace("@", ".student@")}`,
        role: "Student",
      });

      for (const [index, title] of teacher.titles.entries()) {
        const existing = await client.query(
          `select id from e_booklet_instances where teacher_id = $1 and display_title = $2`,
          [teacherId, title],
        );
        let instanceId;
        if (existing.rowCount) {
          instanceId = existing.rows[0].id;
          await client.query(
            `update e_booklet_instances
             set invite_quota = $2, used_invites_count = $3, access_expires_at = now() + interval '180 days', status = 'active', updated_at = now()
             where id = $1`,
            [instanceId, teacher.quota, teacher.used[index]],
          );
        } else {
          const purchase = await client.query(
            `insert into e_booklet_purchases (teacher_id, template_id, template_version_id, status, price, marketing_price, internal_price, final_payable_price, currency, admin_notes, created_at, updated_at)
             values ($1, $2, $3, 'delivered', 0, 0, 0, 0, 'EGP', $4, now(), now())
             returning id`,
            [teacherId, templateId, versionId, demoMarker],
          );
          const instance = await client.query(
            `insert into e_booklet_instances (purchase_id, teacher_id, template_id, template_version_id, display_title, invite_quota, used_invites_count, access_expires_at, student_marketing_price, internal_price, status, created_at, updated_at)
             values ($1, $2, $3, $4, $5, $6, $7, now() + interval '180 days', 0, 0, 'active', now(), now())
             returning id`,
            [purchase.rows[0].id, teacherId, templateId, versionId, title, teacher.quota, teacher.used[index]],
          );
          instanceId = instance.rows[0].id;
          instancesCreated += 1;
        }

        await client.query(
          `insert into e_booklet_access (booklet_instance_id, user_id, role, status, access_source, granted_at)
           values ($1, $2, 'teacher', 'active', 'local_demo', now())
           on conflict (booklet_instance_id, user_id, role) do update set status = 'active', revoked_at = null`,
          [instanceId, teacherId],
        );

        if (index === 0) {
          await client.query(
            `insert into e_booklet_access (booklet_instance_id, user_id, role, status, access_source, granted_at)
             values ($1, $2, 'student', 'active', 'local_demo', now())
             on conflict (booklet_instance_id, user_id, role) do update set status = 'active', revoked_at = null`,
            [instanceId, studentId],
          );
          await client.query(
            `insert into e_booklet_devices (booklet_instance_id, user_id, device_fingerprint, device_label, status, first_seen_at, last_seen_at)
             values ($1, $2, $3, 'Local browser', 'active', now(), now())
             on conflict (booklet_instance_id, user_id, device_fingerprint) do update set status = 'active', last_seen_at = now()`,
            [instanceId, studentId, `local-demo-${teacherId}`],
          );
        }
      }
    }

    await client.query("commit");
    console.log(`Local teacher access demo ready. Created ${instancesCreated} e-booklet instances.`);
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

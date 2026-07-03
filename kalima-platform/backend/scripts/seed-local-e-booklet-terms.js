require("dotenv").config();

const { Pool } = require("pg");

const DEFAULT_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";
const adminEmail = (process.env.LOCAL_ADMIN_EMAIL || "admin@kalima.local").toLowerCase();

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
  });
  const client = await pool.connect();

  try {
    await client.query("set search_path to kalima");
    await client.query("begin");

    const admin = await client.query("select id from users where email = $1", [adminEmail]);
    if (!admin.rowCount) {
      throw new Error(`Local admin ${adminEmail} must exist before seeding e-booklet terms.`);
    }
    const adminId = admin.rows[0].id;

    await client.query(
      `
        update e_booklet_terms
        set status = 'archived',
            active_guard = null,
            updated_by = $1,
            updated_at = now()
        where template_id is null
          and status = 'active'
          and name <> 'Local E-booklet Terms'
      `,
      [adminId],
    );

    const existingLocalTerms = await client.query(
      `
        select id
        from e_booklet_terms
        where template_id is null
          and name = 'Local E-booklet Terms'
        order by id asc
        limit 1
      `,
    );

    if (existingLocalTerms.rowCount) {
      await client.query(
        `
          update e_booklet_terms
          set description = 'Local development terms for teacher e-booklet checkout.',
              status = 'active',
              active_guard = 'template:global',
              starts_at = now() - interval '1 day',
              ends_at = null,
              code_generation_terms = 'Local development terms for generating e-booklet access codes.',
              reward_claim_terms = 'Local development terms for claiming e-booklet milestone rewards.',
              updated_by = $2,
              updated_at = now()
          where id = $1
        `,
        [existingLocalTerms.rows[0].id, adminId],
      );
    } else {
      await client.query(
        `
          insert into e_booklet_terms (
            template_id,
            name,
            description,
            status,
            active_guard,
            starts_at,
            ends_at,
            code_generation_terms,
            reward_claim_terms,
            created_by,
            updated_by,
            created_at,
            updated_at
          )
          values (
            null,
            'Local E-booklet Terms',
            'Local development terms for teacher e-booklet checkout.',
            'active',
            'template:global',
            now() - interval '1 day',
            null,
            'Local development terms for generating e-booklet access codes.',
            'Local development terms for claiming e-booklet milestone rewards.',
            $1,
            $1,
            now(),
            now()
          )
        `,
        [adminId],
      );
    }

    await client.query(
      `
        update e_booklet_terms
        set status = 'archived',
            active_guard = null,
            updated_by = $1,
            updated_at = now()
        where template_id is null
          and status = 'active'
          and name <> 'Local E-booklet Terms'
      `,
      [adminId],
    );

    await client.query("commit");
    console.log("Local active e-booklet terms ready.");
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

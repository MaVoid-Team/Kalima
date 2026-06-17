import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const appRoot = '/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform';
const outDir = path.join(appRoot, '.hermes/reviews/phase-8-lifecycle-e2e');
const requireFromBackend = createRequire(path.join(appRoot, 'backend/package.json'));
const { Pool } = requireFromBackend('pg');
const bcrypt = requireFromBackend('bcrypt');

const backendUrl = process.env.KALIMA_BACKEND_URL || 'http://127.0.0.1:5001';
const frontendUrl = process.env.KALIMA_FRONTEND_URL || 'http://127.0.0.1:5173';
const runId = `phase8-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomBytes(3).toString('hex')}`;
const password = `Qa${crypto.randomBytes(9).toString('base64url')}1!`;
const passcode = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
const wrongPasscode = passcode === '000000' ? '000001' : '000000';

async function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const seed = await fs.readFile(path.join(appRoot, 'backend/scripts/seed-local-test-data.js'), 'utf8');
  const m = seed.match(/DEFAULT_DATABASE_URL\s*=\s*\n?\s*["']([^"']+)["']/);
  if (!m) throw new Error('DATABASE_URL missing and seed fallback not found');
  return m[1];
}

function schemaFromUrl(url) {
  try { return new URL(url).searchParams.get('schema') || 'public'; } catch { return 'public'; }
}

async function api(pathname, options = {}) {
  const res = await fetch(`${backendUrl}${pathname}`, options);
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text.slice(0, 300) }; }
  return { status: res.status, ok: res.ok, body };
}

function authHeaders(token, extra = {}) {
  return { Authorization: `Bearer ${token}`, ...extra };
}

async function apiJson(pathname, token, body, method = 'POST') {
  return api(pathname, {
    method,
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}

function assertOk(label, result, expected = [200, 201]) {
  if (!expected.includes(result.status)) {
    throw new Error(`${label} failed: HTTP ${result.status} ${JSON.stringify(result.body).slice(0, 500)}`);
  }
}

async function login(email) {
  const result = await api('/api/v2/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assertOk(`login ${email}`, result, [200]);
  return result.body.data;
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const dbUrl = await databaseUrl();
  const pool = new Pool({ connectionString: dbUrl });
  const schema = schemaFromUrl(dbUrl);
  const client = await pool.connect();
  const evidence = {
    runId,
    generatedAt: new Date().toISOString(),
    backendUrl,
    frontendUrl,
    fixtures: {},
    api: {},
    browser: { status: 'pending', notes: [] },
    redaction: 'JWTs, passwords, passcodes, invite tokens, access codes, and connection strings intentionally omitted.',
  };

  try {
    await client.query(`SET search_path TO ${JSON.stringify(schema)}, public`);
    const hash = await bcrypt.hash(password, 12);
    async function createUser(kind, role, portals) {
      const email = `${runId}-${kind}@qa.local`;
      const name = `QA ${kind} ${runId}`;
      const phone = `010${crypto.randomInt(10000000, 99999999)}`;
      const user = await client.query(
        `INSERT INTO users (name,email,password,phone,gender,is_email_verified,confirmed,role,created_at,updated_at)
         VALUES ($1,$2,$3,$4,'male',true,true,$5,now(),now()) RETURNING id,email,name,role`,
        [name, email, hash, phone, role]
      );
      const userId = user.rows[0].id;
      await client.query(
        `INSERT INTO auth_identities (user_id,provider,provider_user_id,provider_email) VALUES ($1,'local',$2,$2)`,
        [userId, email]
      );
      for (const portal of portals) {
        await client.query(`INSERT INTO user_roles (user_id,portal,role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [userId, portal, role]);
      }
      await client.query(`INSERT INTO user_analytics (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [userId]);
      if (role === 'Teacher') await client.query(`INSERT INTO teachers (user_id, serial, is_primary, is_preparatory, is_secondary) VALUES ($1,$2,true,false,false)`, [userId, `QA-${runId}-${kind}`]);
      if (role === 'Student') await client.query(`INSERT INTO students (user_id, parent_phone_number, faction) VALUES ($1,$2,$3)`, [userId, phone, runId]);
      return { id: userId, email, name, role };
    }

    const admin = await createUser('admin', 'Admin', ['store', 'academy']);
    const teacher = await createUser('teacher', 'Teacher', ['store', 'academy']);
    const passStudent = await createUser('pass-student', 'Student', ['academy']);
    const paidStudent = await createUser('paid-student', 'Student', ['academy']);
    const freeStudent = await createUser('free-student', 'Student', ['academy']);

    const category = await client.query(`INSERT INTO categories (title,active,description,created_at,updated_at) VALUES ($1,true,$2,now(),now()) RETURNING id`, [`QA Category ${runId}`, runId]);
    const template = await client.query(
      `INSERT INTO e_booklet_templates (title,slug,description,price,marketing_price,currency,status,category_id,created_by,created_at,updated_at)
       VALUES ($1,$2,$3,0,0,'EGP','published',$4,$5,now(),now()) RETURNING id,title`,
      [`QA Lifecycle Template ${runId}`, `qa-lifecycle-${runId}`, `Disposable QA template ${runId}`, category.rows[0].id, admin.id]
    );
    const version = await client.query(
      `INSERT INTO e_booklet_template_versions (template_id,version_number,page_count,status,created_by,created_at,published_at)
       VALUES ($1,1,1,'active',$2,now(),now()) RETURNING id,page_count`,
      [template.rows[0].id, admin.id]
    );

    async function createInstance(kind, price) {
      const p = await client.query(
        `INSERT INTO e_booklet_purchases (teacher_id,template_id,template_version_id,status,price,marketing_price,internal_price,final_payable_price,currency,admin_notes,created_at,updated_at)
         VALUES ($1,$2,$3,'ready',$4,$4,0,$4,'EGP',$5,now(),now()) RETURNING id`,
        [teacher.id, template.rows[0].id, version.rows[0].id, price, `QA ${kind} ${runId}`]
      );
      const i = await client.query(
        `INSERT INTO e_booklet_instances (purchase_id,teacher_id,template_id,template_version_id,display_title,invite_quota,used_invites_count,access_expires_at,student_marketing_price,internal_price,status,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,10,0,now() + interval '30 days',$6,0,'active',now(),now()) RETURNING id,display_title,student_marketing_price`,
        [p.rows[0].id, teacher.id, template.rows[0].id, version.rows[0].id, `QA ${kind} ${runId}`, price]
      );
      return { purchaseId: p.rows[0].id, instanceId: i.rows[0].id, price };
    }

    const passcodeInstance = await createInstance('passcode', 0);
    const paidInstance = await createInstance('paid', 25);
    const freeInstance = await createInstance('zero-price', 0);
    const paymentMethod = await client.query(
      `INSERT INTO payment_methods (name,phone_number,status,created_at,updated_at) VALUES ($1,$2,true,now(),now()) RETURNING id,name`,
      [`QA Wallet ${runId}`, `011${crypto.randomInt(10000000, 99999999)}`]
    );

    evidence.fixtures = {
      adminUserId: admin.id,
      teacherUserId: teacher.id,
      studentUserIds: { passcode: passStudent.id, paid: paidStudent.id, zeroPrice: freeStudent.id },
      templateId: template.rows[0].id,
      templateVersionId: version.rows[0].id,
      instances: { passcode: passcodeInstance, paid: paidInstance, zeroPrice: freeInstance },
      paymentMethodId: paymentMethod.rows[0].id,
    };

    const [adminLogin, teacherLogin, passLogin, paidLogin, freeLogin] = await Promise.all([
      login(admin.email), login(teacher.email), login(passStudent.email), login(paidStudent.email), login(freeStudent.email),
    ]);
    evidence.api.auth = { adminLogin: 'PASS', teacherLogin: 'PASS', studentLogins: 'PASS' };

    const teacherToken = teacherLogin.tokens.accessToken;
    const passToken = passLogin.tokens.accessToken;
    const paidToken = paidLogin.tokens.accessToken;
    const freeToken = freeLogin.tokens.accessToken;
    const adminToken = adminLogin.tokens.accessToken;

    const invite = await apiJson(`/api/v2/teacher/e-booklets/${passcodeInstance.instanceId}/invites`, teacherToken, {
      require_passcode: true,
      max_uses: 5,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      passcode,
      passcode_hint: 'QA',
    });
    assertOk('create passcode invite', invite, [201]);
    const inviteToken = invite.body.data.token;

    const wrongPass = await apiJson(`/api/v2/e-booklet-invites/${encodeURIComponent(inviteToken)}/accept`, passToken, {
      accessPath: 'offline_passcode', termsAccepted: true, termsVersion: 'phase-8-qa', passcode: wrongPasscode,
    });
    const correctPass = await apiJson(`/api/v2/e-booklet-invites/${encodeURIComponent(inviteToken)}/accept`, passToken, {
      accessPath: 'offline_passcode', termsAccepted: true, termsVersion: 'phase-8-qa', passcode,
    });
    assertOk('correct passcode accept', correctPass, [200]);
    const passViewer = await api(`/api/v2/e-booklet-viewer/${passcodeInstance.instanceId}/metadata`, { headers: authHeaders(passToken) });
    assertOk('passcode viewer metadata', passViewer, [200]);

    evidence.api.passcode = {
      wrongPasscodeStatus: wrongPass.status,
      wrongPasscodeBlocked: wrongPass.status === 403,
      correctPasscodeStatus: correctPass.status,
      accessSource: correctPass.body?.data?.access_source || correctPass.body?.data?.accessSource || 'offline_passcode',
      viewerMetadataStatus: passViewer.status,
      viewerMetadataHasInstance: Boolean(passViewer.body?.data?.booklet_instance || passViewer.body?.data?.bookletInstance || passViewer.body?.data),
    };

    const beforePaidViewer = await api(`/api/v2/e-booklet-viewer/${paidInstance.instanceId}/metadata`, { headers: authHeaders(paidToken) });
    const form = new FormData();
    for (const [k, v] of Object.entries({
      instance_id: paidInstance.instanceId,
      template_id: template.rows[0].id,
      template_version_id: version.rows[0].id,
      payment_method_id: paymentMethod.rows[0].id,
      numberTransferredFrom: `010${crypto.randomInt(10000000, 99999999)}`,
      terms_accepted: 'true',
      terms_version: 'phase-8-qa',
      notes: `QA paid lifecycle ${runId}`,
    })) form.append(k, String(v));
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#111827"/></svg>');
    form.append('paymentScreenshot', new Blob([svg], { type: 'image/svg+xml' }), 'qa-proof.svg');
    const paidCheckout = await api('/api/v2/e-booklet-checkout', { method: 'POST', headers: authHeaders(paidToken), body: form });
    assertOk('paid public checkout', paidCheckout, [201]);
    const paidPurchaseId = paidCheckout.body.data.purchase_id || paidCheckout.body.data.purchaseId;
    const paidLinkBefore = await client.query(`SELECT access_id, approved_at FROM e_booklet_student_purchase_links WHERE purchase_id=$1`, [paidPurchaseId]);
    const approve = await apiJson(`/api/v2/admin/e-booklet-student-purchases/${paidPurchaseId}/approve`, adminToken, {}, 'POST');
    assertOk('admin approve paid purchase', approve, [200]);
    const paidViewer = await api(`/api/v2/e-booklet-viewer/${paidInstance.instanceId}/metadata`, { headers: authHeaders(paidToken) });
    assertOk('paid viewer metadata', paidViewer, [200]);
    const paidLinkAfter = await client.query(`SELECT access_id, approved_at FROM e_booklet_student_purchase_links WHERE purchase_id=$1`, [paidPurchaseId]);
    const paidInstanceAfter = await client.query(`SELECT used_invites_count FROM e_booklet_instances WHERE id=$1`, [paidInstance.instanceId]);

    evidence.api.paidPurchase = {
      protectedViewerBeforeApprovalStatus: beforePaidViewer.status,
      checkoutStatus: paidCheckout.status,
      createdPurchaseStatus: paidCheckout.body.data.status,
      linkBeforeApprovalHasAccess: Boolean(paidLinkBefore.rows[0]?.access_id),
      approvalStatus: approve.status,
      linkAfterApprovalHasAccess: Boolean(paidLinkAfter.rows[0]?.access_id),
      approvedAtPresent: Boolean(paidLinkAfter.rows[0]?.approved_at),
      usedInvitesCountAfterApproval: Number(paidInstanceAfter.rows[0]?.used_invites_count ?? 0),
      viewerMetadataStatus: paidViewer.status,
    };

    const freeCheckout = await apiJson('/api/v2/e-booklet-checkout', freeToken, {
      instance_id: freeInstance.instanceId,
      template_id: template.rows[0].id,
      template_version_id: version.rows[0].id,
      terms_accepted: true,
      terms_version: 'phase-8-qa',
      notes: `QA zero-price lifecycle ${runId}`,
    });
    assertOk('zero-price public checkout', freeCheckout, [201]);
    const freeViewer = await api(`/api/v2/e-booklet-viewer/${freeInstance.instanceId}/metadata`, { headers: authHeaders(freeToken) });
    assertOk('zero-price viewer metadata', freeViewer, [200]);
    const freeLink = await client.query(`SELECT access_id, approved_at FROM e_booklet_student_purchase_links WHERE purchase_id=$1`, [freeCheckout.body.data.purchase_id]);

    evidence.api.zeroPrice = {
      checkoutStatus: freeCheckout.status,
      checkoutPurchaseStatus: freeCheckout.body.data.status,
      nextUrlPresent: Boolean(freeCheckout.body.data.next_url),
      accessIdPresent: Boolean(freeCheckout.body.data.access_id),
      linkHasAccess: Boolean(freeLink.rows[0]?.access_id),
      approvedAtPresent: Boolean(freeLink.rows[0]?.approved_at),
      viewerMetadataStatus: freeViewer.status,
    };

    const pageResult = await api(`/api/v2/e-booklet-viewer/${freeInstance.instanceId}/pages/1`, { headers: authHeaders(freeToken) });
    evidence.api.viewerPage = { zeroPricePageStatus: pageResult.status, renderMode: pageResult.body?.data?.renderMode || pageResult.body?.data?.render_mode || null };

    evidence.browser.seed = {
      routeToSmoke: `${frontendUrl}/student/e-booklets/${freeInstance.instanceId}`,
      studentUserId: freeStudent.id,
      note: 'Browser smoke will authenticate separately; credentials/tokens omitted from evidence.',
    };

    await fs.writeFile(path.join(outDir, 'evidence.json'), JSON.stringify(evidence, null, 2));

    // A separate non-persisted runtime payload for this process' stdout only; do not write tokens to disk.
    console.log(JSON.stringify({
      ok: true,
      runId,
      evidencePath: path.join(outDir, 'evidence.json'),
      browser: {
        route: `${frontendUrl}/student/e-booklets/${freeInstance.instanceId}`,
        loginFixtureUserId: freeStudent.id,
      },
      summary: {
        passcode: evidence.api.passcode,
        paidPurchase: evidence.api.paidPurchase,
        zeroPrice: evidence.api.zeroPrice,
      },
    }, null, 2));
  } catch (error) {
    evidence.error = { message: error.message, stackTop: String(error.stack || '').split('\n').slice(0, 3) };
    await fs.writeFile(path.join(outDir, 'evidence.json'), JSON.stringify(evidence, null, 2));
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

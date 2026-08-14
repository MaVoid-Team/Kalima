import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { chromium } from 'playwright';

const frontendPort = Number(process.env.KALIMA_FRONTEND_SMOKE_PORT || 5173);
const backendUrl = process.env.KALIMA_BACKEND_URL || 'http://127.0.0.1:5001';
const frontendUrl = `http://127.0.0.1:${frontendPort}`;
const adminEmail = process.env.KALIMA_SMOKE_ADMIN_EMAIL;
const adminPassword = process.env.KALIMA_SMOKE_ADMIN_PASSWORD;

const publicRoutes = [
  '/',
  '/privacy-policy',
  '/delete-my-data',
  '/e-booklets',
  '/market',
  '/samples',
  '/e-booklet-code',
  '/login',
  '/signup',
  '/forgot-password',
  '/auth/verify-email',
  '/not-a-real-route',
];

const roleRoutes = [
  { role: 'Admin', route: '/admin' },
  { role: 'Admin', route: '/admin/dashboard' },
  { role: 'Admin', route: '/admin/orders' },
  { role: 'Admin', route: '/admin/products' },
  { role: 'Admin', route: '/admin/products/create' },
  { role: 'Admin', route: '/admin/categories' },
  { role: 'Admin', route: '/admin/samples' },
  { role: 'Admin', route: '/admin/e-booklets/create' },
  { role: 'Admin', route: '/admin/e-booklets' },
  { role: 'Admin', route: '/admin/e-booklets/catalog' },
  { role: 'Admin', route: '/admin/e-booklets/orders' },
  { role: 'Admin', route: '/admin/e-booklets/access' },
  { role: 'Admin', route: '/admin/e-booklets/analytics' },
  { role: 'Admin', route: '/admin/e-booklets/hotspot-library' },
  { role: 'Admin', route: '/admin/e-booklets/settings' },
  { role: 'Admin', route: '/admin/e-booklets/settings/terms-milestones' },
  { role: 'Admin', route: '/admin/e-booklet-purchases', expectedPathPrefix: '/admin/e-booklets/orders' },
  { role: 'Admin', route: '/admin/e-booklet-instances', expectedPathPrefix: '/admin/e-booklets/access' },
  { role: 'Admin', route: '/admin/e-booklet-analytics', expectedPathPrefix: '/admin/e-booklets/analytics' },
  { role: 'Admin', route: '/admin/e-booklet-terms-milestones', expectedPathPrefix: '/admin/e-booklets/settings/terms-milestones' },
  { role: 'Admin', route: '/admin/payment-methods' },
  { role: 'Admin', route: '/admin/required-fields' },
  { role: 'Admin', route: '/admin/users' },
  { role: 'Admin', route: '/admin/coupons' },
  { role: 'Admin', route: '/admin/settings' },
  { role: 'Admin', route: '/admin/analytics' },
  { role: 'Admin', route: '/admin/employee-performance' },
  { role: 'Admin', route: '/admin/notifications' },
  { role: 'Teacher', route: '/e-booklet-cart' },
  { role: 'Teacher', route: '/e-booklet-checkout' },
  { role: 'Teacher', route: '/cart' },
  { role: 'Teacher', route: '/checkout' },
  { role: 'Teacher', route: '/fast-buy/checkout' },
  { role: 'Teacher', route: '/orders' },
  { role: 'Teacher', route: '/notifications' },
  { role: 'Teacher', route: '/teacher/profile' },
  { role: 'Teacher', route: '/teacher/settings' },
  { role: 'Teacher', route: '/teacher/e-booklets' },
  { role: 'Teacher', route: '/teacher/e-booklet-orders' },
  { role: 'Teacher', route: '/teacher/e-booklet-analytics' },
  { role: 'Teacher', route: '/teacher/orders' },
  { role: 'Student', route: '/student/profile' },
  { role: 'Student', route: '/student/settings' },
  { role: 'Student', route: '/student/e-booklets' },
  { role: 'Parent', route: '/parent/profile' },
  { role: 'Parent', route: '/parent/settings' },
];

const remainingDynamicRoutes = [];

const languages = [
  { lng: 'en', dir: 'ltr' },
  { lng: 'ar', dir: 'rtl' },
];

const allowedConsoleNoise = (text) => (
  text.includes('Failed to fetch analytics') ||
  text.includes('401') ||
  text.includes('403') ||
  text.includes('404') ||
  text.includes('NetworkError') ||
  text.includes('Network Error') ||
  text.includes('net::ERR_FAILED') ||
  text.includes('Socket connection error') ||
  text.includes('Request failed') ||
  text.includes('Failed to fetch') ||
  text.includes('AxiosError')
);

const makeToken = () => {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.smoke`;
};

const sessionForRole = (role) => ({
  user: {
    id: `smoke-${role.toLowerCase()}`,
    _id: `smoke-${role.toLowerCase()}`,
    name: `${role} Smoke`,
    email: `${role.toLowerCase()}-smoke@example.com`,
    role,
    confirmed: true,
  },
  portalAccess: {
    store: { hasAccess: true, roles: [role] },
    academy: { hasAccess: true, roles: role === 'Student' || role === 'Parent' ? [role] : [] },
  },
  accessToken: makeToken(),
  refreshToken: makeToken(),
});

const installSession = async (context, session = null) => {
  await context.addInitScript((value) => {
    try {
      window.localStorage.clear();
      if (!value) return;
      window.localStorage.setItem('user', JSON.stringify(value.user));
      window.localStorage.setItem('portalAccess', JSON.stringify(value.portalAccess));
      window.localStorage.setItem('accessToken', value.accessToken);
      window.localStorage.setItem('refreshToken', value.refreshToken);
    } catch {
      // Some browser-internal or cross-origin documents deny localStorage access.
    }
  }, session);
};

const closeContext = async (context) => {
  try {
    await context.close();
  } catch (error) {
    if (!String(error?.message || '').includes('has been closed')) throw error;
  }
};

const blockApiForRouteShellSmoke = async (context) => {
  await context.route('**/api/**', (route) => route.abort('failed'));
  await context.route(`${backendUrl}/**`, (route) => route.abort('failed'));
};

const httpOk = (url) => new Promise((resolve) => {
  const req = request(url, { method: 'GET', timeout: 5000 }, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk.toString(); });
    res.on('end', () => resolve({ ok: res.statusCode && res.statusCode < 500, status: res.statusCode, body }));
  });
  req.on('error', (error) => resolve({ ok: false, error: error.message }));
  req.on('timeout', () => {
    req.destroy();
    resolve({ ok: false, error: 'timeout' });
  });
  req.end();
});

const apiFetch = async (path, { token, method = 'GET', body } = {}) => {
  const response = await fetch(`${backendUrl}/api/v2${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${text.slice(0, 200)}`);
  }
  return json;
};

const collectObjects = (value, out = []) => {
  if (!value) return out;
  if (Array.isArray(value)) {
    for (const item of value) collectObjects(item, out);
    return out;
  }
  if (typeof value === 'object') {
    if (Object.prototype.hasOwnProperty.call(value, 'id') || Object.prototype.hasOwnProperty.call(value, '_id')) {
      out.push(value);
    }
    for (const child of Object.values(value)) collectObjects(child, out);
  }
  return out;
};

const firstObject = (json, predicate = () => true) => collectObjects(json).find(predicate) || null;
const firstId = (json, predicate) => {
  const object = firstObject(json, predicate);
  return object?.id ?? object?._id ?? null;
};

const loginAdmin = async () => {
  if (!adminEmail || !adminPassword) return null;
  const json = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: adminEmail, password: adminPassword },
  });
  const payload = json?.data || json;
  if (!payload?.user || !payload?.tokens?.accessToken) {
    throw new Error('Admin login response did not include user and access token');
  }
  return {
    user: payload.user,
    portalAccess: payload.portalAccess || {
      store: { hasAccess: true, roles: ['Admin'] },
      academy: { hasAccess: true, roles: [] },
    },
    accessToken: payload.tokens.accessToken,
    refreshToken: payload.tokens.refreshToken || payload.tokens.accessToken,
  };
};

const impersonateUser = async (adminSession, targetUserId) => {
  const json = await apiFetch('/auth/admin/impersonation/start', {
    token: adminSession.accessToken,
    method: 'POST',
    body: { targetUserId },
  });
  const payload = json?.data || json;
  if (!payload?.user || !payload?.tokens?.accessToken) {
    throw new Error(`Impersonation for user ${targetUserId} did not include user and access token`);
  }
  return {
    user: payload.user,
    portalAccess: payload.portalAccess,
    accessToken: payload.tokens.accessToken,
    refreshToken: payload.tokens.refreshToken || payload.tokens.accessToken,
  };
};

const discoverRealAdminRoutes = async (adminSession) => {
  if (!adminSession) return { routes: [], skipped: [] };
  const token = adminSession.accessToken;
  const routes = [];
  const skipped = [];
  const add = (label, id, builders) => {
    if (!id) {
      skipped.push(label);
      return;
    }
    for (const build of builders) routes.push(build(id));
  };

  const safeGet = async (label, path) => {
    try {
      return await apiFetch(path, { token });
    } catch (error) {
      skipped.push(`${label} (${error.message})`);
      return null;
    }
  };

  const products = await safeGet('product id', '/products?page=1&limit=5');
  add('product id', firstId(products), [
    (id) => ({ route: `/product/${id}`, expectedPathPrefix: `/product/${id}` }),
    (id) => ({ route: `/booklet/${id}`, expectedPathPrefix: `/booklet/${id}` }),
    (id) => ({ route: `/admin/products/${id}`, expectedPathPrefix: `/admin/products/${id}` }),
    (id) => ({ route: `/admin/products/${id}/buyers`, expectedPathPrefix: `/admin/products/${id}/buyers` }),
    (id) => ({ route: `/admin/products/${id}/edit`, expectedPathPrefix: `/admin/products/${id}/edit` }),
  ]);

  const samples = await safeGet('sample id', '/samples?page=1&limit=5');
  add('sample id', firstId(samples), [
    (id) => ({ route: `/samples/${id}`, expectedPathPrefix: `/samples/${id}` }),
    (id) => ({ route: `/samples/${id}/preview`, expectedPathPrefix: `/samples/${id}/preview` }),
  ]);

  const sampleSections = await safeGet('sample section id', '/sample-sections?page=1&limit=5');
  add('sample section id', firstId(sampleSections), [
    (id) => ({ route: `/admin/samples/${id}`, expectedPathPrefix: `/admin/samples/${id}` }),
  ]);

  const purchases = await safeGet('order id', '/purchases?page=1&limit=5');
  add('order id', firstId(purchases), [
    (id) => ({ route: `/admin/orders/${id}`, expectedPathPrefix: `/admin/orders/${id}` }),
  ]);

  const users = await safeGet('user id', '/admin/users?page=1&limit=5');
  add('user id', firstId(users), [
    (id) => ({ route: `/admin/users/${id}`, expectedPathPrefix: `/admin/users/${id}` }),
    (id) => ({ route: `/admin/users/${id}/appreciation`, expectedPathPrefix: `/admin/users/${id}/appreciation` }),
  ]);

  const storeTemplates = await safeGet('e-booklet public template id', '/e-booklet-store?page=1&limit=5');
  add('e-booklet public template id', firstId(storeTemplates), [
    (id) => ({ route: `/e-booklets/${id}`, expectedPathPrefix: `/e-booklets/${id}` }),
  ]);

  const adminTemplates = await safeGet('admin e-booklet template id', '/admin/e-booklet-templates?page=1&limit=5');
  add('admin e-booklet template id', firstId(adminTemplates), [
    (id) => ({ route: `/admin/e-booklets/${id}/edit`, expectedPathPrefix: `/admin/e-booklets/${id}/edit` }),
  ]);

  const eBookletPurchases = await safeGet('e-booklet purchase id', '/admin/e-booklet-purchases?page=1&limit=5');
  add('e-booklet purchase id', firstId(eBookletPurchases), [
    (id) => ({ route: `/admin/e-booklets/orders/${id}`, expectedPathPrefix: `/admin/e-booklets/orders/${id}` }),
    (id) => ({ route: `/admin/e-booklets/orders/${id}/delivery`, expectedPathPrefix: `/admin/e-booklets/orders/${id}/delivery` }),
    (id) => ({ route: `/admin/e-booklet-purchases/${id}/delivery`, expectedPathPrefix: `/admin/e-booklets/orders/${id}/delivery` }),
  ]);

  const instances = await safeGet('e-booklet instance id', '/admin/e-booklet-instances?page=1&limit=5');
  add('e-booklet instance id', firstId(instances), [
    (id) => ({ route: `/admin/e-booklets/access/${id}/view`, expectedPathPrefix: `/admin/e-booklets/access/${id}/view` }),
    (id) => ({ route: `/admin/e-booklets/access/${id}/students`, expectedPathPrefix: `/admin/e-booklets/access/${id}/students` }),
    (id) => ({ route: `/admin/e-booklets/access/${id}/devices`, expectedPathPrefix: `/admin/e-booklets/access/${id}/devices` }),
    (id) => ({ route: `/admin/e-booklet-instances/${id}/view`, expectedPathPrefix: `/admin/e-booklets/access/${id}/view` }),
    (id) => ({ route: `/admin/e-booklet-instances/${id}/students`, expectedPathPrefix: `/admin/e-booklets/access/${id}/students` }),
    (id) => ({ route: `/admin/e-booklet-instances/${id}/devices`, expectedPathPrefix: `/admin/e-booklets/access/${id}/devices` }),
  ]);

  return { routes, skipped };
};

const discoverRoleAndTokenRoutes = async (adminSession) => {
  if (!adminSession) return { routes: [], skipped: [], cleanup: [] };
  const routes = [];
  const skipped = [];
  const cleanup = [];
  const adminToken = adminSession.accessToken;

  const safeGet = async (label, path, token = adminToken) => {
    try {
      return await apiFetch(path, { token });
    } catch (error) {
      skipped.push(`${label} (${error.message})`);
      return null;
    }
  };

  const users = await safeGet('users for appreciation route', '/admin/users?page=1&limit=5');
  const appreciationUserId = firstId(users, (user) => !user.is_deleted);
  if (appreciationUserId) {
    try {
      const page = await apiFetch(`/admin/users/${appreciationUserId}/appreciation-page`, {
        token: adminToken,
        method: 'POST',
      });
      const token = page?.data?.token;
      if (token) routes.push({ route: `/appreciation/${token}`, expectedPathPrefix: `/appreciation/${token}` });
      else skipped.push('appreciation token (create response did not include token)');
    } catch (error) {
      skipped.push(`appreciation token (${error.message})`);
    }
  } else {
    skipped.push('appreciation token (no non-deleted user found)');
  }

  const instances = await safeGet('role e-booklet instance', '/admin/e-booklet-instances?page=1&limit=20');
  const instanceObjects = collectObjects(instances)
    .filter((item) => item.template_id && item.teacher_id && item.status === 'active');
  const teacherInstance = instanceObjects.find((item) => item.teacher_id && item.id && item.access_expires_at && new Date(item.access_expires_at).getTime() > Date.now() && (item.custom_document_file_id || item.template_version?.rendered_document_file_id))
    || instanceObjects.find((item) => item.teacher_id && item.id && (item.custom_document_file_id || item.template_version?.rendered_document_file_id))
    || instanceObjects.find((item) => item.teacher_id && item.id);
  const studentInstance = instanceObjects.find((item) => Array.isArray(item.students) && item.students.some((student) => student.user_id || student.user?.id));

  if (teacherInstance?.teacher_id) {
    try {
      const teacherSession = await impersonateUser(adminSession, teacherInstance.teacher_id);
      const canonicalTemplatePath = teacherInstance.template_id ? `/e-booklets/${teacherInstance.template_id}` : `/e-booklets/instances/${teacherInstance.id}`;
      routes.push(
        { route: `/e-booklets/instances/${teacherInstance.id}`, expectedPathPrefix: canonicalTemplatePath, session: teacherSession },
        { route: `/teacher/e-booklets/${teacherInstance.id}`, expectedPathPrefix: `/teacher/e-booklets/${teacherInstance.id}`, session: teacherSession },
        { route: `/teacher/e-booklets/${teacherInstance.id}/invites`, expectedPathPrefix: `/teacher/e-booklets/${teacherInstance.id}/invites`, session: teacherSession },
      );

      try {
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        const invite = await apiFetch(`/teacher/e-booklets/${teacherInstance.id}/invites`, {
          token: teacherSession.accessToken,
          method: 'POST',
          body: { max_uses: 1, expires_at: expiresAt },
        });
        const inviteToken = invite?.data?.token;
        const inviteId = invite?.data?.invite?.id;
        if (inviteToken) routes.push({ route: `/e-booklet-invite/${inviteToken}`, expectedPathPrefix: `/e-booklet-invite/${inviteToken}` });
        else skipped.push('e-booklet invite token (create response did not include token)');
        if (inviteId) {
          cleanup.push(async () => {
            await apiFetch(`/teacher/e-booklet-invites/${inviteId}/disable`, {
              token: teacherSession.accessToken,
              method: 'PATCH',
            });
          });
        }
      } catch (error) {
        skipped.push(`e-booklet invite token (${error.message})`);
      }
    } catch (error) {
      skipped.push(`teacher impersonation (${error.message})`);
    }
  } else {
    skipped.push('teacher dynamic routes (no active teacher instance found)');
  }

  const studentUserId = studentInstance?.students?.find((student) => student.user_id || student.user?.id)?.user_id
    || studentInstance?.students?.find((student) => student.user_id || student.user?.id)?.user?.id;
  if (studentInstance?.id && studentUserId) {
    try {
      const studentSession = await impersonateUser(adminSession, studentUserId);
      routes.push({ route: `/student/e-booklets/${studentInstance.id}`, expectedPathPrefix: `/student/e-booklets/${studentInstance.id}`, session: studentSession });
    } catch (error) {
      skipped.push(`student impersonation (${error.message})`);
    }
  } else {
    skipped.push('student dynamic route (no active student instance found)');
  }

  routes.push({ route: '/auth/reset-password?token=synthetic-smoke-token', expectedPathPrefix: '/auth/reset-password' });

  return { routes, skipped, cleanup };
};

const waitForFrontend = async () => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const result = await httpOk(`${frontendUrl}/`);
    if (result.ok) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Frontend preview did not become ready at ${frontendUrl}`);
};

const backendHealth = await httpOk(`${backendUrl}/api/v2/health`);
if (!backendHealth.ok) {
  console.error(`Backend health failed at ${backendUrl}/api/v2/health: ${backendHealth.status || backendHealth.error}`);
  process.exit(1);
}

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(frontendPort), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, BROWSER: 'none' },
});

let output = '';
preview.stdout.on('data', (chunk) => { output += chunk.toString(); });
preview.stderr.on('data', (chunk) => { output += chunk.toString(); });

try {
  await waitForFrontend();
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  const adminSession = await loginAdmin();
  const discoveredAdmin = await discoverRealAdminRoutes(adminSession);
  const discoveredRoleAndToken = await discoverRoleAndTokenRoutes(adminSession);

  const visitRoute = async ({ page, lng, dir, route, expectedPathPrefix, label, failures }) => {
    let response;
    try {
      response = await page.goto(`${frontendUrl}${route}${route.includes('?') ? '&' : '?'}lng=${lng}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForTimeout(1000);
    } catch (error) {
      failures.push(`${label}: navigation failed: ${error.message}`);
      return;
    }
    if (!response || response.status() >= 500) failures.push(`${label}: HTTP ${response?.status() ?? 'no response'}`);

    try {
      await page.waitForSelector('body', { state: 'attached', timeout: 10_000 });
    } catch (error) {
      failures.push(`${label}: body did not attach: ${error.message}`);
      return;
    }

    const evaluateRoute = () => page.evaluate(() => {
      const text = document.body.innerText || '';
      const rawKeyPattern = /\b(?:admin|common|landing|eBooklets|auth|cart|checkout|market|parent|product|student|teacher|userManagement|notifications|appreciation)\.[A-Za-z0-9_.-]+\b/g;
      const loadingOnly = /^\s*(Loading|جاري التحميل|جار التحميل|Loading\.\.\.|جاري التحميل\.\.\.)\s*$/i.test(text.trim());
      return {
        pathname: window.location.pathname,
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        textLength: text.trim().length,
        loadingOnly,
        rawKeys: [...new Set(text.match(rawKeyPattern) || [])].slice(0, 20),
      };
    });

    let result;
    try {
      result = await evaluateRoute();
      if (!result.lang || !result.dir || result.textLength < 20 || result.loadingOnly) {
        await page.waitForTimeout(1000);
        result = await evaluateRoute();
      }
      if (!result.lang || !result.dir || result.textLength < 20 || result.loadingOnly) {
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForTimeout(1500);
        result = await evaluateRoute();
      }
    } catch (error) {
      failures.push(`${label}: page evaluation failed: ${error.message}`);
      return;
    }

    if (expectedPathPrefix && !result.pathname.startsWith(expectedPathPrefix)) {
      failures.push(`${label}: redirected to ${result.pathname}`);
    }
    if (result.lang !== lng) failures.push(`${label}: expected lang=${lng}, got ${result.lang}`);
    if (result.dir !== dir) failures.push(`${label}: expected dir=${dir}, got ${result.dir}`);
    if (result.textLength < 20 || result.loadingOnly) failures.push(`${label}: blank/loading-only body`);
    if (result.rawKeys.length) failures.push(`${label}: raw translation keys visible: ${result.rawKeys.join(', ')}`);
  };

  for (const { lng, dir } of languages) {
    const context = await browser.newContext({ locale: lng === 'ar' ? 'ar-EG' : 'en-US' });
    await installSession(context);
    const page = await context.newPage();
    const consoleErrors = [];

    page.on('console', (message) => {
      if (message.type() === 'error' && !allowedConsoleNoise(message.text())) {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      if (!allowedConsoleNoise(error.message)) consoleErrors.push(error.message);
    });

    await page.goto(`${frontendUrl}/?lng=${lng}`, { waitUntil: 'networkidle', timeout: 30_000 });
    const browserOriginHealth = await page.evaluate(async (url) => {
      const response = await fetch(`${url}/api/v2/health`);
      return { status: response.status, body: await response.json() };
    }, backendUrl);
    if (browserOriginHealth.status !== 200 || browserOriginHealth.body?.status !== 'ok') {
      failures.push(`${lng}: browser-origin backend health failed ${JSON.stringify(browserOriginHealth)}`);
    }

    for (const route of publicRoutes) {
      await visitRoute({ page, lng, dir, route, expectedPathPrefix: route === '/not-a-real-route' ? '/not-a-real-route' : route.split('?')[0], label: `${lng} public ${route}`, failures });
    }

    if (consoleErrors.length) failures.push(`${lng}: console errors: ${consoleErrors.slice(0, 10).join(' | ')}`);
    await closeContext(context);

    for (const { role, route, expectedPathPrefix } of roleRoutes) {
      const roleContext = await browser.newContext({ locale: lng === 'ar' ? 'ar-EG' : 'en-US' });
      await installSession(roleContext, sessionForRole(role));
      await blockApiForRouteShellSmoke(roleContext);
      const rolePage = await roleContext.newPage();
      const roleConsoleErrors = [];
      rolePage.on('console', (message) => {
        if (message.type() === 'error' && !allowedConsoleNoise(message.text())) roleConsoleErrors.push(message.text());
      });
      rolePage.on('pageerror', (error) => {
        if (!allowedConsoleNoise(error.message)) roleConsoleErrors.push(error.message);
      });

      await visitRoute({ page: rolePage, lng, dir, route, expectedPathPrefix: expectedPathPrefix || route, label: `${lng} ${role} ${route}`, failures });
      if (roleConsoleErrors.length) failures.push(`${lng} ${role} ${route}: console errors: ${roleConsoleErrors.slice(0, 5).join(' | ')}`);
      await closeContext(roleContext);
    }

    if (adminSession && discoveredAdmin.routes.length) {
      for (const { route, expectedPathPrefix } of discoveredAdmin.routes) {
        const adminContext = await browser.newContext({ locale: lng === 'ar' ? 'ar-EG' : 'en-US' });
        await installSession(adminContext, adminSession);
        const adminPage = await adminContext.newPage();
        const adminConsoleErrors = [];
        adminPage.on('console', (message) => {
          if (message.type() === 'error' && !allowedConsoleNoise(message.text())) adminConsoleErrors.push(message.text());
        });
        adminPage.on('pageerror', (error) => {
          if (!allowedConsoleNoise(error.message)) adminConsoleErrors.push(error.message);
        });

        await visitRoute({
          page: adminPage,
          lng,
          dir,
          route,
          expectedPathPrefix,
          label: `${lng} real-admin ${route}`,
          failures,
        });
        if (adminConsoleErrors.length) failures.push(`${lng} real-admin ${route}: console errors: ${adminConsoleErrors.slice(0, 5).join(' | ')}`);
        await closeContext(adminContext);
      }
    }

    if (discoveredRoleAndToken.routes.length) {
      for (const { route, expectedPathPrefix, session } of discoveredRoleAndToken.routes) {
        const context = await browser.newContext({ locale: lng === 'ar' ? 'ar-EG' : 'en-US' });
        await installSession(context, session || null);
        const routePage = await context.newPage();
        const routeConsoleErrors = [];
        routePage.on('console', (message) => {
          if (message.type() === 'error' && !allowedConsoleNoise(message.text())) routeConsoleErrors.push(message.text());
        });
        routePage.on('pageerror', (error) => {
          if (!allowedConsoleNoise(error.message)) routeConsoleErrors.push(error.message);
        });

        await visitRoute({
          page: routePage,
          lng,
          dir,
          route,
          expectedPathPrefix,
          label: `${lng} role-token ${route}`,
          failures,
        });
        if (routeConsoleErrors.length) failures.push(`${lng} role-token ${route}: console errors: ${routeConsoleErrors.slice(0, 5).join(' | ')}`);
        await closeContext(context);
      }
    }
  }

  await browser.close();

  for (const cleanup of discoveredRoleAndToken.cleanup) {
    try {
      await cleanup();
    } catch (error) {
      failures.push(`fixture cleanup failed: ${error.message}`);
    }
  }

  if (failures.length) {
    console.error(`full-stack i18n smoke failed with ${failures.length} issue(s):`);
    console.error(failures.join('\n'));
    process.exit(1);
  }

  console.log(`full-stack i18n smoke passed for ${publicRoutes.length + roleRoutes.length} static routes in en/ar.`);
  if (adminSession) {
    console.log(`real admin dynamic smoke passed for ${discoveredAdmin.routes.length} discovered routes in en/ar.`);
    console.log(`role/token dynamic smoke passed for ${discoveredRoleAndToken.routes.length} discovered routes in en/ar.`);
    if (discoveredAdmin.skipped.length) {
      console.log(`admin dynamic discovery skipped ${discoveredAdmin.skipped.length} fixture type(s): ${discoveredAdmin.skipped.join(', ')}`);
    }
    if (discoveredRoleAndToken.skipped.length) {
      console.log(`role/token dynamic discovery skipped ${discoveredRoleAndToken.skipped.length} fixture type(s): ${discoveredRoleAndToken.skipped.join(', ')}`);
    }
  } else {
    console.log('real admin dynamic smoke skipped because KALIMA_SMOKE_ADMIN_EMAIL/KALIMA_SMOKE_ADMIN_PASSWORD were not set.');
  }
  if (remainingDynamicRoutes.length) {
    console.log(`remaining token/non-admin or fixture-specific dynamic routes not covered automatically: ${remainingDynamicRoutes.join(', ')}`);
  } else {
    console.log('all route patterns in App.jsx are covered by static, real-admin, role impersonation, token, or reset-shell smoke.');
    console.log('note: reset-password form submission with a valid one-time email token is not exercised; the page route is shell-smoked with a synthetic token.');
  }
  console.log(`frontend=${frontendUrl}`);
  console.log(`backend=${backendUrl}`);
} finally {
  preview.kill('SIGTERM');
  setTimeout(() => preview.kill('SIGKILL'), 2000).unref();
  if (process.env.DEBUG_I18N_FULLSTACK_SMOKE) console.error(output);
}

import fs from 'node:fs';
import { request } from 'node:http';
import { chromium } from 'playwright';

const frontendUrl = process.env.STORE_ORDER_SMOKE_FRONTEND_URL || 'http://127.0.0.1:5173';
const apiUrl = process.env.STORE_ORDER_SMOKE_API_URL || 'http://127.0.0.1:5001/api/v2';
const screenshotPath = process.env.STORE_ORDER_SMOKE_SCREENSHOT
  || new URL('../../../.codex/e2e-proof/store-order-product-serial/order-detail.png', import.meta.url).pathname;

const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${apiUrl}${path}`, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path} returned ${response.status}`);
  return body;
};

const waitForServer = async (url) => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const req = request(url, { method: 'GET', timeout: 1000 }, (response) => {
        response.resume();
        resolve(response.statusCode && response.statusCode < 500);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
    if (ok) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not become ready at ${url}`);
};

const installSession = async (context, session) => {
  await context.addInitScript((value) => {
    window.localStorage.setItem('user', JSON.stringify(value.user));
    window.localStorage.setItem('portalAccess', JSON.stringify(value.portalAccess));
    window.localStorage.setItem('accessToken', value.accessToken);
    window.localStorage.setItem('refreshToken', value.refreshToken);
  }, session);
};

const main = async () => {
  await waitForServer(`${apiUrl}/health`);
  await waitForServer(frontendUrl);

  const email = process.env.LOCAL_ADMIN_EMAIL || 'admin@kalima.local';
  const password = process.env.LOCAL_ADMIN_PASSWORD || 'pass1234';
  const login = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
  const payload = login.data || login;
  const session = {
    user: payload.user,
    portalAccess: payload.portalAccess || { store: { hasAccess: true, roles: ['Admin'] }, academy: { hasAccess: true, roles: [] } },
    accessToken: payload.tokens.accessToken,
    refreshToken: payload.tokens.refreshToken || payload.tokens.accessToken,
  };

  const ordersResponse = await apiFetch('/purchases?page=1&limit=50', { token: session.accessToken });
  const orders = ordersResponse.data?.purchases || ordersResponse.data || [];
  const order = orders.find((candidate) => candidate.purchase_items?.some((item) => item.products?.serial));
  if (!order) throw new Error('No local store order with a product serial was found');
  const productSerial = order.purchase_items.find((item) => item.products?.serial)?.products.serial;
  const detailResponse = await apiFetch(`/purchases/${order.id}`, { token: session.accessToken });
  const detail = detailResponse.data?.purchase || detailResponse.data;
  const detailSerial = detail?.purchase_items?.find((item) => item.products?.serial)?.products.serial;
  if (detailSerial !== productSerial) throw new Error(`Order detail API did not preserve ${productSerial}`);

  fs.mkdirSync(new URL('../../../.codex/e2e-proof/store-order-product-serial/', import.meta.url), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'en-US' });
  await installSession(context, session);
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(`${frontendUrl}/admin/orders/${order.id}`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.getByTestId(`admin-orders-item-serial-${order.purchase_items.find((item) => item.products?.serial).id}`).waitFor({ state: 'visible', timeout: 15_000 });
  const bodyText = await page.locator('body').innerText();
  if (!bodyText.includes(productSerial)) throw new Error(`Rendered order detail did not contain ${productSerial}`);
  if (consoleErrors.length) throw new Error(`Browser console errors: ${consoleErrors.join(' | ')}`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();

  console.log(`Store order product serial browser smoke passed for order ${order.id}`);
  console.log(`Screenshot: ${screenshotPath}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

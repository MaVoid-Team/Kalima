import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { chromium } from 'playwright';

const port = Number(process.env.KALIMA_I18N_SMOKE_PORT || 4173);
const baseUrl = `http://127.0.0.1:${port}`;
const routes = ['/', '/privacy-policy', '/delete-my-data', '/e-booklets'];
const languages = [
  { lng: 'en', dir: 'ltr' },
  { lng: 'ar', dir: 'rtl' },
];

const isExpectedFrontendOnlyNetworkError = (text) => (
  text.includes('127.0.0.1:5001') ||
  text.includes('AxiosError: Network Error') ||
  text.includes('Failed to fetch categories') ||
  text.includes('Failed to fetch products') ||
  text.includes('net::ERR_FAILED')
);

const waitForServer = async () => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const req = request(`${baseUrl}/`, { method: 'HEAD', timeout: 1000 }, (res) => {
        res.resume();
        resolve(res.statusCode && res.statusCode < 500);
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
  throw new Error(`Preview server did not become ready at ${baseUrl}`);
};

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, BROWSER: 'none' },
});

let previewOutput = '';
preview.stdout.on('data', (chunk) => { previewOutput += chunk.toString(); });
preview.stderr.on('data', (chunk) => { previewOutput += chunk.toString(); });

try {
  await waitForServer();

  const browser = await chromium.launch({ headless: true });
  const failures = [];

  for (const { lng, dir } of languages) {
    const context = await browser.newContext({ locale: lng === 'ar' ? 'ar-EG' : 'en-US' });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && !isExpectedFrontendOnlyNetworkError(message.text())) {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      if (!isExpectedFrontendOnlyNetworkError(error.message)) consoleErrors.push(error.message);
    });

    for (const route of routes) {
      const url = `${baseUrl}${route}?lng=${lng}`;
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      if (!response || response.status() >= 500) failures.push(`${lng} ${route}: HTTP ${response?.status() ?? 'no response'}`);

      await page.waitForSelector('body', { timeout: 10_000 });
      const result = await page.evaluate(() => {
        const text = document.body.innerText || '';
        const rawKeyPattern = /\b(?:admin|common|landing|eBooklets|auth|cart|checkout|market|parent|product|student|teacher|userManagement|notifications|appreciation)\.[A-Za-z0-9_.-]+\b/g;
        return {
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          textLength: text.trim().length,
          rawKeys: [...new Set(text.match(rawKeyPattern) || [])].slice(0, 20),
        };
      });

      if (result.lang !== lng) failures.push(`${lng} ${route}: expected html lang ${lng}, got ${result.lang}`);
      if (result.dir !== dir) failures.push(`${lng} ${route}: expected html dir ${dir}, got ${result.dir}`);
      if (result.textLength < 20) failures.push(`${lng} ${route}: page body looks blank (${result.textLength} chars)`);
      if (result.rawKeys.length) failures.push(`${lng} ${route}: raw translation keys visible: ${result.rawKeys.join(', ')}`);
    }

    if (consoleErrors.length) failures.push(`${lng}: console errors: ${consoleErrors.slice(0, 5).join(' | ')}`);
    await context.close();
  }

  await browser.close();

  if (failures.length) {
    console.error(`i18n DOM smoke failed with ${failures.length} issue(s):`);
    console.error(failures.join('\n'));
    process.exit(1);
  }

  console.log(`i18n DOM smoke passed for ${routes.length} public routes in en/ar at ${baseUrl}.`);
} finally {
  preview.kill('SIGTERM');
  setTimeout(() => preview.kill('SIGKILL'), 2000).unref();
  if (process.env.DEBUG_I18N_SMOKE) console.error(previewOutput);
}

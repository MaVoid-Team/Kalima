import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const proofDir = path.resolve(process.cwd(), '..', '..', '.codex/e2e-proof/orders-page-action-loading');

const orderFixture = {
  id: 42,
  purchase_serial: 'USR-CP-20260717-001',
  status: 'confirmed',
  created_at: '2026-07-17T10:00:00.000Z',
  total: 120,
  users: { id: 7, name: 'Screenshot Test Customer', email: 'screenshot-test@example.invalid', phone: null },
  payment_methods: { id: 1, name: 'Test transfer' },
  purchase_items: [],
};

test('renders admin orders and delivered action without a runtime crash', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'local-e2e-token');
    localStorage.setItem('refreshToken', 'local-e2e-refresh-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Local Admin', confirmed: true }));
    localStorage.setItem('portalAccess', JSON.stringify({
      store: { hasAccess: true, roles: ['Admin'] },
      academy: { hasAccess: true, roles: [] },
    }));
  });

  await page.route('**/api/v2/**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/purchases') && route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { purchases: [orderFixture], total: 1, page: 1, pages: 1, limit: 8 },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.goto('/admin/orders');
  await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible();
  await expect(page.getByTestId('admin-orders-table-link-42')).toBeVisible();

  await page.getByRole('button', { name: 'Open menu' }).first().click();
  const deliverAction = page.getByRole('menuitem', { name: /mark delivered/i });
  await expect(deliverAction).toBeVisible();
  await deliverAction.evaluate((element) => {
    element.style.outline = '3px solid #16a34a';
    element.style.outlineOffset = '4px';
    element.style.backgroundColor = 'rgba(22, 163, 74, 0.12)';
  });

  fs.mkdirSync(proofDir, { recursive: true });
  await page.screenshot({
    path: path.join(proofDir, 'orders-page-fixed-highlighted.png'),
    fullPage: false,
  });
});

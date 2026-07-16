import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const proofDir = path.resolve(process.cwd(), '..', '..', '.codex/e2e-proof/store-order-serial');

const orderFixture = {
  id: 42,
  purchase_serial: 'USR-CP-20260716-001',
  status: 'confirmed',
  created_at: '2026-07-16T10:00:00.000Z',
  subtotal: 120,
  discount: 0,
  total: 120,
  users: { id: 7, name: 'Serial Test Customer', email: 'serial-test@example.invalid', phone: null },
  payment_methods: { id: 1, name: 'Test transfer', phone_number: null },
  purchase_items: [
    {
      id: 99,
      price_at_purchase: 120,
      discount: 0,
      quantity: 1,
      is_deleted: false,
      products: {
        id: 12,
        title: 'Security-facing order product',
        serial: 'PRODUCT-SERIAL-001',
        type: 'Product',
        thumbnail_image: null,
      },
      purchase_item_required_fields: [],
    },
  ],
};

test('shows the product serial in the security-facing order detail', async ({ page }) => {
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
    const pathname = new URL(route.request().url()).pathname;

    if (pathname.endsWith('/purchases/42')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { purchase: orderFixture } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.goto('/admin/orders/42');
  await expect(page.getByTestId('admin-orders-item-serial-99')).toHaveText(
    'Serial number: PRODUCT-SERIAL-001',
  );

  fs.mkdirSync(proofDir, { recursive: true });
  await page.screenshot({
    path: path.join(proofDir, 'security-order-detail-serial.png'),
    fullPage: false,
  });
});

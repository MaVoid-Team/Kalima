import { expect, test } from '@playwright/test';

const purchaseSerial = '42-CP-20260727-001';
const trackingMessage = `مرحباً، رقم طلبي المميز هو ${purchaseSerial} وأرغب في معرفة حالة الطلب`;
const expectedTrackingHref = `https://wa.me/201044067113?text=${encodeURIComponent(trackingMessage)}`;

const product = {
  id: 7,
  title: 'Kalima Mathematics Starter Pack',
  type: 'Product',
  thumbnail_image: null,
};

const cart = {
  id: 11,
  user_id: 42,
  status: 'active',
  subtotal: 0,
  discount: 0,
  total: 0,
  cart_items: [
    {
      id: 17,
      product_id: product.id,
      quantity: 1,
      price_at_add: 0,
      final_price: 0,
      discount: 0,
      required_fields_filled: true,
      cart_item_required_fields: [],
      products: product,
    },
  ],
};

const purchase = {
  id: 42,
  purchase_serial: purchaseSerial,
  status: 'pending',
  subtotal: 0,
  discount: 0,
  total: 0,
  purchase_items: [
    {
      id: 21,
      product_id: product.id,
      quantity: 1,
      price_at_purchase: 0,
      final_price: 0,
      discount: 0,
      products: product,
    },
  ],
};

test('requires the customer to continue through the only order-tracking action', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'local-e2e-token');
    localStorage.setItem('refreshToken', 'local-e2e-refresh-token');
    localStorage.setItem('user', JSON.stringify({
      id: 42,
      name: 'Checkout Test Teacher',
      confirmed: true,
    }));
    localStorage.setItem('portalAccess', JSON.stringify({
      store: { hasAccess: true, roles: ['Teacher'] },
      academy: { hasAccess: false, roles: [] },
    }));
  });

  await page.route('**/api/v2/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (url.pathname.endsWith('/cart') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: cart }),
      });
      return;
    }

    if (url.pathname.endsWith('/cart/checkout') && method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { purchase } }),
      });
      return;
    }

    if (url.pathname.endsWith('/payment-methods') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.goto('/cart?step=2');
  await page.getByRole('button', { name: 'Pay', exact: true }).click();

  const receipt = page.getByRole('alertdialog', { name: 'Purchase Receipt' });
  await expect(receipt).toBeVisible();
  await expect(receipt.getByRole('link')).toHaveCount(1);
  await expect(receipt.getByRole('button')).toHaveCount(0);

  const trackingLink = receipt.getByRole('link', { name: 'Track your order' });
  await expect(trackingLink).toBeVisible();
  await expect(trackingLink).toHaveAttribute('href', expectedTrackingHref);
  await expect(trackingLink).toHaveAttribute('target', '_blank');

  await page.keyboard.press('Escape');
  await expect(receipt).toBeVisible();

  await page.mouse.click(10, 120);
  await expect(receipt).toBeVisible();
});

test('shows the same required tracking receipt after fast-buy checkout', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'local-e2e-token');
    localStorage.setItem('refreshToken', 'local-e2e-refresh-token');
    localStorage.setItem('user', JSON.stringify({
      id: 42,
      name: 'Checkout Test Teacher',
      roles: ['Teacher'],
      confirmed: true,
    }));
    localStorage.setItem('portalAccess', JSON.stringify({
      store: { hasAccess: true, roles: ['Teacher'] },
      academy: { hasAccess: false, roles: [] },
    }));
  });

  await page.route('**/api/v2/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (url.pathname.endsWith('/cart/fast-buy/checkout/preview') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            requiredFields: { common: [], itemsMissingFields: [] },
            isCheckoutReady: true,
          },
        }),
      });
      return;
    }

    if (url.pathname.endsWith('/cart/fast-buy') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: cart }),
      });
      return;
    }

    if (url.pathname.endsWith('/cart/fast-buy/checkout/repeat-purchases') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { items: [] } }),
      });
      return;
    }

    if (url.pathname.endsWith('/cart/fast-buy/checkout') && method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { purchase } }),
      });
      return;
    }

    if (url.pathname.endsWith('/payment-methods') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { data: [] } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.goto('/fast-buy/checkout');
  await page.getByTestId('fastbuy-summary-submit-button').click();

  const receipt = page.getByRole('alertdialog', { name: 'Purchase Receipt' });
  await expect(receipt).toBeVisible();
  await expect(page).toHaveURL(/\/fast-buy\/checkout$/);
  await expect(receipt.getByRole('link', { name: 'Track your order' })).toHaveAttribute(
    'href',
    expectedTrackingHref,
  );
  await page.screenshot({
    path: testInfo.outputPath('fast-buy-tracking-receipt.png'),
    fullPage: true,
  });
});

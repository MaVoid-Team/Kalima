import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const qrRef = 'demo-qr-reference';
const proofDir = path.resolve(process.cwd(), '../../.codex/e2e-proof/e-booklet-qr');

async function seedStudentSession(page) {
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({ id: 77, name: 'QR Student', role: 'student' }));
    localStorage.setItem('accessToken', 'e2e-student-token');
  });
}

test.describe('printed e-booklet QR redemption', () => {
  test('preserves the QR return URL through login', async ({ page }) => {
    await page.goto(`/e-booklet-code/qr/${qrRef}`);

    const loginLink = page.getByTestId('e-booklet-printed-code-login');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', /redirect=.*e-booklet-code.*qr.*demo-qr-reference/);
    fs.mkdirSync(proofDir, { recursive: true });
    await page.screenshot({ path: path.join(proofDir, 'qr-login-handoff.png'), fullPage: false });
  });

  test('shows the scanned code and redeems it after terms confirmation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await seedStudentSession(page);

    for (const endpoint of ['**/api/v2/notifications/my**', '**/api/v2/notifications/my/unread-count**', '**/api/v2/cart**']) {
      await page.route(endpoint, async (route) => {
        const data = endpoint.includes('unread-count') ? { unread_count: 0 } : endpoint.includes('/cart') ? { items: [] } : { notifications: [] };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
      });
    }

    await page.route(`**/api/v2/e-booklet-access-code-print/qr/${qrRef}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            code: 'KLM-QR-123456',
            teacher: { name: 'أستاذ أحمد' },
            eBooklet: { title: 'مذكرة النحو' },
            gradeClassText: 'الصف الثالث',
            registrationMethodText: 'Code or platform',
          },
        }),
      });
    });

    let redemptionPayload;
    await page.route('**/api/v2/e-booklet-access-codes/redeem', async (route) => {
      redemptionPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { bookletInstanceId: 91 } }),
      });
    });

    await page.goto(`/e-booklet-code/qr/${qrRef}`);
    await expect(page.getByTestId('e-booklet-printed-code-qr-page')).toBeVisible();
    await expect(page.getByTestId('e-booklet-printed-code')).toHaveValue('KLM-QR-123456');
    await expect(page.getByText('مذكرة النحو')).toBeVisible();

    fs.mkdirSync(proofDir, { recursive: true });
    await page.screenshot({ path: path.join(proofDir, 'qr-prefill-mobile.png'), fullPage: false });

    await page.getByTestId('e-booklet-printed-code-terms').check();
    await page.getByTestId('e-booklet-printed-code-submit').click();
    await expect.poll(() => redemptionPayload).toEqual(expect.objectContaining({
      code: 'KLM-QR-123456',
      termsAccepted: true,
    }));
    await expect(page).toHaveURL(/\/student\/e-booklets\/91$/);
  });
});

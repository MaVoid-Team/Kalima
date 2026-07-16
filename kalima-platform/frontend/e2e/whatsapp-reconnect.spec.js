import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const adminEmail = process.env.LOCAL_ADMIN_EMAIL;
const adminPassword = process.env.LOCAL_ADMIN_PASSWORD;
const proofDir = path.resolve(process.cwd(), '..', '..', '.codex/e2e-proof/whatsapp-reconnect-qr');

test('shows the WhatsApp QR after reconnecting from the disconnected settings state', async ({ page }) => {
    test.skip(!adminEmail || !adminPassword, 'Set LOCAL_ADMIN_EMAIL and LOCAL_ADMIN_PASSWORD for the documented local admin.');

    await page.goto('/login');
    await page.getByTestId('login-email-input').fill(adminEmail);
    await page.getByTestId('login-password-input').fill(adminPassword);
    await page.getByTestId('login-submit-button').click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/admin/settings');
    await expect(page.getByRole('heading', { name: 'WhatsApp Sender Status' })).toBeVisible();

    const connectButton = page.getByRole('button', { name: 'Connect WhatsApp' });
    const refreshButton = page.getByRole('button', { name: 'Refresh QR Code' });
    if (await connectButton.isVisible()) {
        await connectButton.click();
    } else {
        await expect(refreshButton).toBeVisible();
        await refreshButton.click();
    }

    await expect(page.getByTestId('whatsapp-qr-code')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Awaiting Scan' })).toBeVisible();

    fs.mkdirSync(proofDir, { recursive: true });
    await page.screenshot({
        path: path.join(proofDir, 'whatsapp-awaiting-scan-e2e.png'),
        fullPage: false,
    });
});

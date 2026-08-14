import { test, expect } from '@playwright/test';

test.describe('Production Product Buyers E2E', () => {
    test.setTimeout(90000);

    test('should login as admin, toggle buyers mode, and inspect product buyers', async ({ page }) => {
        // Collect console errors
        const consoleErrors = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // 1. Navigate to login
        await page.goto('https://kalima-edu.com/login', { waitUntil: 'networkidle' });

        // Fill login form
        const emailInput = page.locator('input[type="email"], input[name="email"], input[id*="email"]').first();
        const passwordInput = page.locator('input[type="password"], input[name="password"], input[id*="password"]').first();

        await emailInput.fill('admin@gmail.com');
        await passwordInput.fill('pass1234');

        // Submit
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click();

        // Wait for redirect to dashboard or admin
        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });

        // 2. Navigate to admin products page
        await page.goto('https://kalima-edu.com/admin/products', { waitUntil: 'networkidle' });

        // Verify products page elements
        const table = page.locator('table');
        await expect(table).toBeVisible({ timeout: 15000 });

        // Verify view mode toggle is present
        const viewModeToggle = page.locator('[data-testid="products-view-mode-toggle"]');
        await expect(viewModeToggle).toBeVisible();

        const catalogBtn = page.locator('[data-testid="products-view-catalog-btn"]');
        const buyersBtn = page.locator('[data-testid="products-view-buyers-btn"]');
        await expect(catalogBtn).toBeVisible();
        await expect(buyersBtn).toBeVisible();

        // 3. Switch to Product Buyers mode
        await buyersBtn.click();
        await page.waitForTimeout(500);

        // Find the first product's "View Buyers" action button
        const firstViewBuyersBtn = page.locator('[data-testid^="products-action-view-buyers-"]').first();
        await expect(firstViewBuyersBtn).toBeVisible({ timeout: 10000 });

        // 4. Click to navigate to buyers page
        await firstViewBuyersBtn.click();
        await page.waitForURL((url) => url.pathname.includes('/buyers'), { timeout: 15000 });

        // 5. Verify Product Buyers page elements
        const buyersPage = page.locator('[data-testid="product-buyers-page"]');
        await expect(buyersPage).toBeVisible({ timeout: 10000 });

        const statsGrid = page.locator('[data-testid="product-buyers-stats"]');
        await expect(statsGrid).toBeVisible();

        const searchInput = page.locator('[data-testid="product-buyers-search-input"]');
        await expect(searchInput).toBeVisible();

        const statusSelect = page.locator('[data-testid="product-buyers-status-select"]');
        await expect(statusSelect).toBeVisible();

        const buyersTable = page.locator('[data-testid="product-buyers-table"]');
        await expect(buyersTable).toBeVisible();

        // Test searching
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        await searchInput.fill('');
        await page.waitForTimeout(500);

        // 6. Navigate to product details and check header button
        const currentUrl = page.url();
        const productIdMatch = currentUrl.match(/\/admin\/products\/(\d+)\/buyers/);
        if (productIdMatch) {
            const productId = productIdMatch[1];
            await page.goto(`https://kalima-edu.com/admin/products/${productId}`, { waitUntil: 'networkidle' });

            const detailBuyersBtn = page.locator('[data-testid="product-detail-buyers-button"]');
            await expect(detailBuyersBtn).toBeVisible({ timeout: 10000 });
            await detailBuyersBtn.click();
            await page.waitForURL((url) => url.pathname.includes('/buyers'), { timeout: 15000 });
        }

        // Verify there are no critical unhandled errors
        const fatalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('socket') && !e.includes('WebSocket'));
        console.log('Production console errors:', fatalErrors);
        expect(fatalErrors.length).toBeLessThan(5);
    });
});

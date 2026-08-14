import { defineConfig } from '@playwright/test';
import process from 'node:process';

export default defineConfig({
    testDir: './e2e',
    timeout: 45_000,
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5176',
        headless: true,
        screenshot: 'only-on-failure',
    },
    webServer: {
        command: 'npm run preview -- --port 5176 --host 127.0.0.1',
        port: 5176,
        reuseExistingServer: true,
    },
    reporter: [['line']],
});

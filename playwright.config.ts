import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', timeout: 45_000, fullyParallel: false, workers: 1,
  reporter: [['list']], use: { baseURL: 'http://127.0.0.1:8092', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium-mobile', use: { ...devices['Pixel 7'], browserName: 'chromium', channel: 'chrome' } }],
  webServer: { command: 'node scripts/preview-web.mjs', url: 'http://127.0.0.1:8092', reuseExistingServer: false, timeout: 120_000 },
});

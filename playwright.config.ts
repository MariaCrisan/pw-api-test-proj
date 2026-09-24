import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/src',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'artifacts/html-report', open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
  },
});

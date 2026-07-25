// إعدادات إطار عمل Playwright لتشغيل اختبارات E2E التشغيلية
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120 * 1000, // زيادة المهلة إلى 120 ثانية لتلافي بطء استجابة السيرفر المحلي
  expect: {
    timeout: 20000     // مهلة التوقعات 20 ثانية
  },
  fullyParallel: false, // عدم التشغيل المتوازي المتشابك لتلافي تعليق السيرفر وقاعدة البيانات
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',     // إخراج مريح كقائمة
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    actionTimeout: 0,
    ignoreHTTPSErrors: true
  },
  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        }
      ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});

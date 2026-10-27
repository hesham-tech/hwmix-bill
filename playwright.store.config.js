import { defineConfig } from '@playwright/test'
import base from './playwright.config.js'

// Run the built application to avoid Vite dependency-optimization reloads mid-test.
export default defineConfig({
  ...base,
  testDir: './tests/e2e/store',
  use: { ...base.use, baseURL: 'http://127.0.0.1:5175' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 5175',
    url: 'http://127.0.0.1:5175',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})

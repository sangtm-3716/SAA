import { defineConfig, devices } from '@playwright/test';

/**
 * Two dev servers run concurrently:
 *
 *  - :3000  EVENT_STARTS_AT unset  -> countdown lock INACTIVE (fail-open path).
 *           Runs the login suite and every countdown rendering test.
 *  - :3001  EVENT_STARTS_AT far future -> countdown lock ACTIVE.
 *           Runs only the `@locked` tests, which assert the redirect behaviour.
 *
 * They need separate build directories: Next refuses to start a second dev
 * server that shares one `.next` ("Another next dev server is already
 * running"). `NEXT_DIST_DIR` is honoured by next.config.ts for exactly this.
 *
 * `webServer` is a TOP-LEVEL key and may be an array. It is NOT valid inside a
 * `project` entry — placed there it is silently ignored and no server starts
 * at all, which looks like a mass connection-refused failure.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command:
        'NEXT_DIST_DIR=.next-locked PORT=3001 EVENT_STARTS_AT=2099-12-31T23:59:59Z npm run dev',
      url: 'http://localhost:3001/countdown',
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
    },
  ],

  projects: [
    {
      name: 'unit',
      testDir: './tests/unit',
      use: {},
    },
    {
      // Everything that must observe an UNLOCKED app.
      name: 'chromium',
      grepInvert: /@locked/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
    },
    {
      // Only the tests that require the countdown lock to be ACTIVE.
      name: 'chromium-locked',
      grep: /@locked/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3001' },
    },
  ],
});

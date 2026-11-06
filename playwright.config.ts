import { defineConfig, devices } from '@playwright/test';

// Site-specific values, defaulting to the bundled WKND example. Set them in your shell to
// point the suite at your own project (/setup-project proposes them; see .env.example).
// This is the only code outside tests/specs/wknd that names a WKND path.
const PROJECT_DEFAULTS = {
  AEM_TEMPLATE: '/conf/wknd/settings/wcm/templates/content-page-template',
  AEM_SCRATCH_PARENT: '/content/wknd/us/en',
  AEM_CONTAINER: 'jcr:content/root/container',
};
for (const [name, value] of Object.entries(PROJECT_DEFAULTS)) process.env[name] ||= value;

export default defineConfig({
  testDir: './tests',
  // The editor is shared state on one author instance, so run one test at a time.
  fullyParallel: false,
  workers: 1,
  retries: 0, // A retry would hide exactly the flakiness these tests exist to expose.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.AEM_AUTHOR_URL ?? 'http://localhost:4502',
    viewport: { width: 1600, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'authoring',
      testMatch: /specs\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 1000 }, storageState: '.auth/admin.json' },
    },
  ],
});

import { test as setup, expect } from '@playwright/test';

// Local SDK only. AEMaaCS author sits behind IMS SSO, so this form does not exist there.
setup('log in to the local author', async ({ page }) => {
  await page.goto('/libs/granite/core/content/login.html');
  await page.locator('#username').fill(process.env.AEM_USER ?? 'admin');
  await page.locator('#password').fill(process.env.AEM_PASSWORD ?? 'admin');
  await page.locator('#submit-button').click();
  await expect(page).not.toHaveURL(/login\.html/);
  await page.context().storageState({ path: '.auth/admin.json' });
});

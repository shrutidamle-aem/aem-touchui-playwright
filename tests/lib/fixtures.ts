import { test as base } from '@playwright/test';
import { createScratchPage, deletePage } from './aem.js';
import { openEditor } from './editor.js';

/** Insert-then-delete: every test gets its own throwaway page, removed pass or fail. */
export const test = base.extend<{ scratchPage: string }>({
  scratchPage: async ({ page }, use) => {
    await page.goto('/libs/granite/csrf/token.json');
    const path = await createScratchPage(page);
    await openEditor(page, path);
    await use(path);
    await deletePage(page, path);
  },
});

export { expect } from '@playwright/test';

import { test, expect } from '@playwright/test';
import { postFromPage, readNode, renderedHtml } from '../../lib/aem.js';
import { fillField, openDialogFor, openEditor, openTab, saveDialog } from '../../lib/editor.js';

/**
 * Insert-then-delete is the easy pattern. The site header is one shared, permanent
 * experience fragment, so there is nothing safe to delete. Here the test records the
 * original value, changes it through the dialog, and restores it, pass or fail.
 */
const FRAGMENT = '/content/experience-fragments/wknd/language-masters/en/site/header/master';
const LOGO = `${FRAGMENT}/jcr:content/root/container/container_1195249223/image`;

test.describe('site header logo', () => {
  let original: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/libs/granite/csrf/token.json');
    original = String((await readNode(page, LOGO)).alt);
  });

  test.afterEach(async ({ page }) => {
    // Plain POST so a broken dialog can't leave the live header changed.
    expect(await postFromPage(page, LOGO, { alt: original })).toBe(200);
  });

  test('edit a live component and put it back', async ({ page }) => {
    await openEditor(page, FRAGMENT);

    const dialog = await openDialogFor(page, LOGO);
    await openTab(dialog, 'Asset');
    await fillField(dialog, './alt', 'Changed by Playwright');
    await saveDialog(dialog);

    expect(await renderedHtml(page, FRAGMENT)).toContain('Changed by Playwright');
  });
});

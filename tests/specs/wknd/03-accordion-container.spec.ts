import { test, expect } from '../../lib/fixtures.js';
import { listChildren } from '../../lib/aem.js';
import { containerOf, insertComponent, openDialogForContainer } from '../../lib/editor.js';
import { sel } from '../../lib/selectors.js';

test('a container opens its own dialog, not a child dialog', async ({ page, scratchPage }) => {
  const path = await insertComponent(page, containerOf(scratchPage), 'wknd/components/accordion');

  // WKND's _cq_template seeds two items, which is what makes this hard.
  expect(await listChildren(page, path)).toEqual(expect.arrayContaining(['item_1', 'item_2']));

  const dialog = await openDialogForContainer(page, path);
  await expect(dialog).toContainText('Accordion');
  await dialog.locator(sel.dialogCancel).click();
});

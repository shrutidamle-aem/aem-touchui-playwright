import { test, expect } from '../../lib/fixtures.js';
import { readNode } from '../../lib/aem.js';
import { containerOf, fillRichText, insertComponent, openDialogFor, openTab, saveDialog, tick, untick } from '../../lib/editor.js';
import { sel } from '../../lib/selectors.js';

// Deliberately long: short strings are how dropped characters stay hidden.
const LONG = 'A rich text value long enough that a dropped keystroke cannot hide in it, ending here.';
const ALT_ERROR = 'Please provide an asset which has a description that can be used as alt text.';

test('a long rich text value survives the save intact', async ({ page, scratchPage }) => {
  const path = await insertComponent(page, containerOf(scratchPage), 'wknd/components/teaser');

  const dialog = await openDialogFor(page, path);
  // A new Teaser inherits the page's featured image and its alt text. Scratch pages have no
  // featured image, so the required alt field is left empty and disabled, and Done is blocked
  // (pinned in the next test). "Don't provide an alternative text" is the author's way through
  // when there is no image, and the image isn't what this test is about.
  await openTab(dialog, 'Asset');
  await tick(dialog, sel.isDecorative);
  await openTab(dialog, 'Text');
  // "Get description from linked page" is also ticked by default and makes the editor read-only.
  await untick(dialog, sel.descriptionFromPage);
  await fillRichText(dialog, './jcr:description', LONG);
  await saveDialog(dialog);

  expect(String((await readNode(page, path))['jcr:description'])).toContain(LONG);
});

/**
 * Pinned behaviour, not a known bug. If this starts failing, the Core Components default
 * for "Inherit featured image from page" (or its alt-text rule) has changed. Review what
 * changed and update this test and the one above. Don't just delete it.
 */
test("pinned behaviour: a default Teaser can't be saved on a page with no featured image", async ({ page, scratchPage }) => {
  const path = await insertComponent(page, containerOf(scratchPage), 'wknd/components/teaser');

  const dialog = await openDialogFor(page, path);
  // Every image setting stays at its default. Only the text tab is touched, so the text is real input.
  await openTab(dialog, 'Text');
  await untick(dialog, sel.descriptionFromPage);
  await fillRichText(dialog, './jcr:description', LONG);
  await dialog.locator(sel.dialogDone).click();

  await expect(dialog.locator(sel.fieldErrorLabel, { hasText: ALT_ERROR })).toBeAttached();
  await expect(dialog).toBeVisible();
  // Nothing saved: the node holds only what the insert created (resource type and jcr:* metadata).
  const node = await readNode(page, path);
  expect(Object.keys(node).filter((k) => !k.startsWith('jcr:'))).toEqual(['sling:resourceType']);

  await dialog.locator(sel.dialogCancel).click();
});

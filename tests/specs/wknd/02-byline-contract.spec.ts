import { test, expect } from '../../lib/fixtures.js';
import { postFromPage, readNode, renderedHtml } from '../../lib/aem.js';
import {
  addMultifieldValue,
  containerOf,
  fillField,
  insertComponent,
  openDialogFor,
  openTab,
  saveDialog,
  setOwnAltText,
} from '../../lib/editor.js';
import { sel } from '../../lib/selectors.js';

/**
 * The dialog and the model disagree about what a Byline needs.
 *
 *   Dialog            Name required, image required (via the alt text rule). Occupations required="false".
 *   BylineImpl.isEmpty()   Name, at least one occupation AND an image, or it renders nothing.
 *
 * The dialog now enforces the image, so that gap is closed and is tested as normal behaviour.
 * The occupation gap is still open: an author can save a dialog that passes validation and
 * publish a component that isn't there. The KNOWN BAD test pins that. If the dialog ever
 * requires an occupation, it fails on purpose, and that is the tripwire doing its job: update it.
 */
const IMAGE = '/content/dam/wknd-shared/en/contributors/jacob_wester.jpg';
const ALT_ERROR = 'Please provide an asset which has a description that can be used as alt text.';

test.describe('Byline: dialog contract vs model contract', () => {
  test('dialog requires an image', async ({ page, scratchPage }) => {
    const path = await insertComponent(page, containerOf(scratchPage), 'wknd/components/byline');

    const dialog = await openDialogFor(page, path);
    await openTab(dialog, 'Properties');
    await fillField(dialog, './name', 'Name With No Image');
    await addMultifieldValue(dialog, './occupations', 'Writer');
    await dialog.locator(sel.dialogDone).click();

    await expect(dialog.locator(sel.fieldErrorLabel, { hasText: ALT_ERROR })).toBeAttached();
    await expect(dialog).toBeVisible();
    // Proves the save was really blocked, not just slow to close.
    expect((await readNode(page, path)).name).toBeUndefined();

    await dialog.locator(sel.dialogCancel).click();
  });

  test('KNOWN BAD: no occupation saves but renders nothing', async ({ page, scratchPage }) => {
    const path = await insertComponent(page, containerOf(scratchPage), 'wknd/components/byline');
    // Picking an asset from the side rail is the flaky path, and the image isn't under test.
    expect(await postFromPage(page, path, { fileReference: IMAGE })).toBe(200);

    const dialog = await openDialogFor(page, path);
    await openTab(dialog, 'Asset');
    await setOwnAltText(dialog, 'Portrait');
    await openTab(dialog, 'Properties');
    await fillField(dialog, './name', 'Name With No Occupation');
    await saveDialog(dialog); // no validation error: that's the bug

    // The value really saved, so an empty render below can only mean the model hid it.
    expect((await readNode(page, path)).name).toBe('Name With No Occupation');
    expect(await renderedHtml(page, scratchPage)).not.toContain('Name With No Occupation');
  });

  // The control: proves the test above fails for the missing occupation, not a broken render.
  test('control: with an image and an occupation it renders', async ({ page, scratchPage }) => {
    const path = await insertComponent(page, containerOf(scratchPage), 'wknd/components/byline');
    // Picking an asset from the side rail is the flaky path, and the image isn't under test.
    expect(await postFromPage(page, path, { fileReference: IMAGE })).toBe(200);

    const dialog = await openDialogFor(page, path);
    await openTab(dialog, 'Asset');
    await setOwnAltText(dialog, 'Portrait');
    await openTab(dialog, 'Properties');
    await fillField(dialog, './name', 'Complete Byline');
    await addMultifieldValue(dialog, './occupations', 'Writer');
    await saveDialog(dialog);

    expect((await readNode(page, path)).name).toBe('Complete Byline');
    expect(await renderedHtml(page, scratchPage)).toContain('Complete Byline');
  });
});

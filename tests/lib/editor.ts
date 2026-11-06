import { expect, type Locator, type Page } from '@playwright/test';
import { dismissEditorOnboarding, listChildren } from './aem.js';
import { CONTAINER } from './config.js';
import { sel } from './selectors.js';

/** The page's insert container, from AEM_CONTAINER. */
export const containerOf = (pagePath: string) => `${pagePath}/${CONTAINER}`;

export async function openEditor(page: Page, pagePath: string): Promise<void> {
  // Start in Edit mode, not whatever layer the last session left behind.
  const url = process.env.AEM_AUTHOR_URL ?? 'http://localhost:4502';
  await page.context().addCookies([{ name: 'cq-editor-layer.page', value: 'Edit', url }]);
  await dismissEditorOnboarding(page);
  await page.goto(`/editor.html${pagePath}.html`);
  await page.locator('div[data-type="Editable"]').first().waitFor();
}

/**
 * Insert through the picker, not drag and drop. It is just as real an authoring path and
 * far more deterministic, because the overlays don't shift under the pointer.
 * The new node gets a generated name, so diff the container's children to find it.
 */
export async function insertComponent(page: Page, containerPath: string, resourceType: string): Promise<string> {
  const before = await listChildren(page, containerPath);
  const slot = `${containerPath}/*`;

  await page.locator(sel.editable(slot)).click();
  await page.locator(sel.insertButton(slot)).click();
  await page.locator(sel.pickerItem(resourceType)).click();

  // The insert is an async POST with no reliable signal, so poll instead of sleeping.
  await expect
    .poll(async () => (await listChildren(page, containerPath)).filter((n) => !before.includes(n)).length)
    .toBe(1);
  const [name] = (await listChildren(page, containerPath)).filter((n) => !before.includes(n));
  return `${containerPath}/${name}`;
}

export async function openDialogFor(page: Page, path: string): Promise<Locator> {
  await page.locator(sel.editable(path)).click();
  await page.locator(sel.toolbarConfigure).click();
  const dialog = page.locator(sel.dialog);
  await expect(dialog).toBeVisible();
  return dialog;
}

/**
 * The risk with a container is opening a child's dialog by mistake. On this AEM build a
 * click on the container's overlay selects the container itself (its toolbar reads
 * "Accordion: Item 1"), and Parent would step *past* it to the root container. So select
 * it, prove the container is the selected editable, and click the Configure button
 * whose data-path is the container's. A child selection fails here, loudly.
 */
export async function openDialogForContainer(page: Page, containerPath: string): Promise<Locator> {
  await page.locator(sel.editable(containerPath)).click();
  await expect(page.locator(sel.selectedEditable(containerPath))).toBeVisible();
  await page.locator(sel.toolbarConfigureFor(containerPath)).click();
  const dialog = page.locator(sel.dialog);
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function openTab(dialog: Locator, title: string): Promise<void> {
  await dialog.locator('coral-tab', { hasText: title }).click();
}

export async function fillField(dialog: Locator, name: string, value: string): Promise<void> {
  await dialog.locator(`input[name="${name}"], textarea[name="${name}"]`).first().fill(value);
}

/**
 * keyboard.insertText, not keyboard.type: per-key events can drop characters in contenteditable.
 * A read-only editor (e.g. while "get it from the page" is ticked) takes the click and silently
 * swallows the text, so prove it is editable first and that the text landed after.
 */
export async function fillRichText(dialog: Locator, name: string, text: string): Promise<void> {
  const editor = dialog.locator(sel.richText(name)).first();
  await editor.click();
  await expect(editor).toHaveAttribute('contenteditable', 'true');
  await dialog.page().keyboard.insertText(text);
  await expect(editor).toContainText(text);
}

export async function addMultifieldValue(dialog: Locator, name: string, value: string): Promise<void> {
  const field = dialog.locator(sel.multifield(name));
  await field.locator('button[coral-multifield-add]').click();
  await field.locator('coral-multifield-item input').last().fill(value);
}

export async function tick(dialog: Locator, name: string): Promise<void> {
  const input = dialog.locator(sel.checkboxInput(name));
  await expect(input).toBeEnabled();
  await input.check(); // no-op if already set; Playwright verifies the state after
  await expect(input).toBeChecked();
}

export async function untick(dialog: Locator, name: string): Promise<void> {
  const input = dialog.locator(sel.checkboxInput(name));
  await expect(input).toBeEnabled();
  await input.uncheck(); // no-op if already clear; Playwright verifies the state after
  await expect(input).not.toBeChecked();
}

/**
 * Use the component's own asset with typed alt text, the way an author does. Call it with
 * the Asset tab open. "Inherit featured image from page" is ticked by default, and while it
 * is, the asset and "from DAM" controls are disabled, so untick it first. Then untick
 * "Inherit from description of asset", which enables the alt field, and type.
 */
export async function setOwnAltText(dialog: Locator, text: string): Promise<void> {
  await untick(dialog, sel.imageFromPage);
  await untick(dialog, sel.altFromDam);
  const alt = dialog.locator(sel.altText);
  await expect(alt).toBeEnabled();
  await alt.fill(text);
}

/** Saves and proves the dialog accepted it: a failed validation leaves it open. */
export async function saveDialog(dialog: Locator): Promise<void> {
  await dialog.locator(sel.dialogDone).click();
  await expect(dialog).toBeHidden();
}

import { test, expect } from '../../lib/fixtures.js';
import { renderedHtml } from '../../lib/aem.js';
import { containerOf, fillField, insertComponent, openDialogFor, saveDialog } from '../../lib/editor.js';

test('an author can insert a Title, fill its dialog and see it rendered', async ({ page, scratchPage }) => {
  const path = await insertComponent(page, containerOf(scratchPage), 'wknd/components/title');

  const dialog = await openDialogFor(page, path);
  await fillField(dialog, './jcr:title', 'Hello from Playwright');
  await saveDialog(dialog);

  expect(await renderedHtml(page, scratchPage)).toContain('Hello from Playwright');
});

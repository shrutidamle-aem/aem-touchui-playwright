import type { Page } from '@playwright/test';
import { SCRATCH_PARENT, TEMPLATE } from './config.js';

/**
 * Runs inside the live page, so it always uses the cookies the browser holds right now.
 * The standalone `request` fixture keeps its own cookie jar, which drifts during a run
 * and turns into a 403 that looks like flakiness.
 */
export async function postFromPage(page: Page, url: string, form: Record<string, string>): Promise<number> {
  return page.evaluate(
    async ({ url, form }) => {
      const { token } = await (await fetch('/libs/granite/csrf/token.json')).json();
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'CSRF-Token': token },
        body: new URLSearchParams({ _charset_: 'utf-8', ...form }),
      });
      return res.status;
    },
    { url, form },
  );
}

/**
 * A fresh instance opens the page editor with a first-run onboarding tour whose overlay
 * covers the whole editor and swallows every click. Dismissing the tour stores this user
 * preference, so set it the same way before the editor loads. This is setup, not under test,
 * and it's idempotent. If the editor ever bumps the suffix (…62), the overlay comes back
 * and every insert times out on "coral-overlay … intercepts pointer events".
 */
export const EDITOR_ONBOARDING_PREF = 'cq.authoring.editor.page.showOnboarding62';

export async function dismissEditorOnboarding(page: Page): Promise<void> {
  const res = await page.request.get('/libs/granite/security/currentuser.json');
  if (!res.ok()) throw new Error(`currentuser.json returned ${res.status()}`);
  const { home } = (await res.json()) as { home: string };
  const status = await postFromPage(page, `${home}/preferences`, { [EDITOR_ONBOARDING_PREF]: 'false' });
  if (status !== 200 && status !== 201) throw new Error(`Saving the onboarding preference returned ${status}`);
}

export async function createScratchPage(page: Page): Promise<string> {
  const label = `pw-${Date.now()}`;
  const status = await postFromPage(page, '/bin/wcmcommand', {
    cmd: 'createPage',
    parentPath: SCRATCH_PARENT,
    title: label,
    label,
    template: TEMPLATE,
  });
  if (status !== 200) throw new Error(`createPage returned ${status}`);
  return `${SCRATCH_PARENT}/${label}`;
}

export async function deletePage(page: Page, path: string): Promise<void> {
  await postFromPage(page, '/bin/wcmcommand', { cmd: 'deletePage', path, force: 'true' });
}

export async function listChildren(page: Page, path: string): Promise<string[]> {
  const res = await page.request.get(`${path}.1.json`);
  if (!res.ok()) throw new Error(`Listing ${path} returned ${res.status()}`);
  const json = (await res.json()) as Record<string, unknown>;
  return Object.keys(json).filter((k) => typeof json[k] === 'object' && json[k] !== null && !k.includes(':'));
}

export async function readNode(page: Page, path: string): Promise<Record<string, unknown>> {
  const res = await page.request.get(`${path}.json`);
  if (!res.ok()) throw new Error(`Reading ${path} returned ${res.status()}`);
  return res.json();
}

/** What a visitor gets: the page with no authoring layer. */
export async function renderedHtml(page: Page, pagePath: string): Promise<string> {
  const res = await page.request.get(`${pagePath}.html?wcmmode=disabled`);
  if (!res.ok()) throw new Error(`Rendering ${pagePath} returned ${res.status()}`);
  return res.text();
}

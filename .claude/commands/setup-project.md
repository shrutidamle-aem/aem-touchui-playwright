---
description: Point the suite at an AEM project by proposing its template, scratch parent and container
argument-hint: <path to the AEM project>
---

Set this suite up for the AEM project at `$1`. Read the project and propose values for `AEM_TEMPLATE`, `AEM_SCRATCH_PARENT` and `AEM_CONTAINER` (described in `.env.example`). Propose, wait for the person to confirm, then create the spec folder.

**Never write to `$1`.** Read its files only. Against the author instance, only `GET` requests are allowed. Don't create pages, templates or policies there either.

## 1. Find the project and the components

- Find the app folder: `ui.apps/src/main/content/jcr_root/apps/<app>/`. Check the `filter.xml` files too. `<app>` is the project name. It's also the first segment of the resource types (`<app>/components/title`) and the name of the spec folder. If there's more than one app folder, ask which one.
- List the components under `/apps/<app>/components` that have a `_cq_dialog`, with their `componentGroup` from `.content.xml`. A group of `.hidden` never shows in the picker.
- Ask which of them the person plans to test. If they don't say, use all the components with a dialog that aren't hidden.

## 2. AEM_TEMPLATE: a template whose policy allows those components

- Find the editable templates: `/conf/<site>/settings/wcm/templates/*` (usually in `ui.content`), whose `jcr:content` has `status="enabled"`. Ignore disabled ones and the template-types.
- For each template, read `structure/.content.xml` and `policies/.content.xml`. Follow the `cq:policy` on each editable container to `/conf/<site>/settings/wcm/policies/.content.xml`. Read its `components` property. A `group:<name>` entry allows every component with that `componentGroup`.
- Pick the template whose editable container allows the most of the chosen components. List any chosen component it doesn't allow. The picker won't show those, so they can't be tested on it.
- If the project has only static templates (`/apps/.../templates`), say so and stop. This suite creates scratch pages from editable templates.

## 3. AEM_CONTAINER: the insert container

- In the chosen template's `structure/.content.xml`, find the container with `editable="{Boolean}true"`, the one whose policy you used above.
- Give its path relative to the page, starting at `jcr:content` with no leading slash. For example `jcr:content/root/container`.
- If there are several editable containers, propose the main content one and list the others.

## 4. AEM_SCRATCH_PARENT: a safe parent

Each test creates a `pw-<timestamp>` page under it and deletes that page afterwards, pass or fail. Find candidates under `/content/<site>` in `ui.content`. A candidate must meet all of these:
- `cq:conf` on the site root (or an ancestor) points at the `/conf/<site>` that holds the template.
- The template's `allowedPaths` (and any `allowedParents`) permit pages under it.
- It isn't a live copy (`cq:LiveRelationship`) or a blueprint source with rollout configs, so a scratch page can never roll out to a live copy or be overwritten by a rollout. Prefer a language master.
- No navigation, list or sitemap component on a shared page reads its children. Otherwise a run briefly changes what those show.

Say which candidates you rejected and why.

## 5. Check against the instance (read only)

If `AEM_AUTHOR_URL` responds, `GET` `<template>.json`, `<parent>.json` and the policy node to check they're installed and match the source. Use the `AEM_USER` and `AEM_PASSWORD` from the environment, or `admin:admin` on a local SDK. If the source and the instance differ, show both and let the person choose. If the instance isn't running, say so, and note that the values haven't been checked against it.

## 6. Propose

Show a table with these columns: variable, proposed value, evidence (`file:line` in `$1`), what you checked against the instance. Add any components the template doesn't allow, and any open questions. Then ask the person to confirm or change each value. Don't continue until they confirm.

## 7. After confirmation

- Create `tests/specs/<app>/` with a `.gitkeep` file so git keeps the empty folder. Don't touch `tests/specs/wknd/` or `tests/lib/`.
- Print the confirmed values as `export` lines for the person's shell. Don't write `.env`, because nothing reads it.
- Tell them the next steps: `/audit-dialog $1 <component>` for each component, then `/add-authoring-test <app>/components/<component> <dialog path>`. With the values exported, run only their folder with `npx playwright test tests/specs/<app>`. A plain `npm test` also runs the WKND specs, and those fail outside WKND.

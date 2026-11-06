# AI-Assisted Authoring Tests for AEM Dialogs

**Works on any AEM project that uses the Touch UI page editor.** Playwright tests drive the real editor the way an author does: pick a component, open its dialog, fill it in, save, and check what comes out. The bugs that live in dialogs never show up in tests that only look at the rendered page.

The background is in the article [Testing the Click, Not the Render](https://medium.com/@damleshruti/testing-the-click-not-the-render-981e0b9f605b).

## Try it on WKND first

The repo ships with an example suite for Adobe's public [WKND site](https://github.com/adobe/aem-guides-wknd), in `tests/specs/wknd/`. Every setting defaults to WKND, so it runs with no configuration.

You need a local AEM SDK author on `localhost:4502` and Node 22 or later.

```bash
# In a clone of adobe/aem-guides-wknd
mvn clean install -PautoInstallSinglePackage

# In this repo
npm install
npx playwright install chromium
npm test
```

Set `AEM_AUTHOR_URL`, `AEM_USER` and `AEM_PASSWORD` if yours differ from the defaults.

Run this only on a disposable local instance. The tests create pages and briefly change the WKND header.

## Tested versions

Run end to end against a local AEM SDK author with WKND installed:

| AEM SDK | Core Components | Result | Run time |
|---|---|---|---|
| 2026.10.29251 | 2.33.0 | 9 of 9 passing | about 27s |
| 2026.3.24893 | 2.30.4 | 9 of 9 passing | about 25s |

## What's in the WKND example

All in `tests/specs/wknd/`.

| Spec | Pattern |
|---|---|
| `01-title` | The basic loop: insert, fill, save, assert the render |
| `02-byline-contract` | Known-bad tripwires for a dialog and model that disagree, with a control |
| `03-accordion-container` | Opening a container's dialog when its children paint over it |
| `04-teaser-richtext` | A long value in a rich text field |
| `05-header-edit-restore` | Changing shared, live content and always putting it back |

## The example finding

`BylineImpl.isEmpty()` needs three things before WKND's Byline renders: a name, at least one occupation, and an image. The dialog checks only two of them. **Name** is required. The image's alt text is required too, which in practice means the author has to deal with the image before Done works. **Occupations** is marked `required="false"`.

So an author can fill in a name and an image and save without complaint, and visitors get nothing. In the editor, the author sees an empty placeholder with no hint about what's missing.

`02-byline-contract.spec.ts` covers all three cases:

- the dialog refuses to save with no image
- a `KNOWN BAD` test pins the missing-occupation gap: the dialog saves, but the component doesn't render
- a control shows the component rendering once all three are present

If the dialog is ever changed to require an occupation, the `KNOWN BAD` test fails on purpose.

Older versions of this README said only the name was checked. The image check holds on both tested SDKs.

## Point it at your project

The helpers in `tests/lib` don't know about any one site. Three environment variables tell them where to work. They're described in `.env.example`:

| Variable | What it is | WKND default |
|---|---|---|
| `AEM_TEMPLATE` | Editable template that scratch pages are created from. Its policy must allow the components you test. | `/conf/wknd/settings/wcm/templates/content-page-template` |
| `AEM_SCRATCH_PARENT` | Existing page that scratch pages go under. Each test makes one child page and deletes it afterwards. | `/content/wknd/us/en` |
| `AEM_CONTAINER` | The insert container's path, relative to the page | `jcr:content/root/container` |

The `.claude/commands` folder holds three Claude Code commands that do the setup. The ideas work in any coding agent. Run them in order:

1. **`/setup-project <path to your AEM project>`** reads the project. It proposes a template whose policy allows your components, a safe scratch parent, and the container path, and shows the file and line behind each one. You confirm or change them. Then it creates `tests/specs/<project>/` and prints the `export` lines. It only reads your project and never writes to it.
2. **`/audit-dialog <project> <component>`** compares what a dialog promises with what the model and HTL enforce, and lists the mismatches.
3. **`/add-authoring-test <resource type> <dialog path>`** writes a test into `tests/specs/<project>/` from the shared helpers, runs it, and fixes selectors from the trace.

With your values exported, run your own folder:

```bash
npx playwright test tests/specs/<project>
```

A plain `npm test` also runs the WKND specs, and they only pass on WKND.

`CLAUDE.md` holds the rules. The important one: a failure that looks like a product bug gets reported, never worked around.

## Limits

- Local SDK only. AEMaaCS author uses IMS sign-in, which this login step doesn't handle.
- Selectors can change between AEM releases. They're all in `tests/lib/selectors.ts`.
- A fresh instance shows a page editor tour. The suite turns it off through a user preference whose name includes a version number. If every test times out, check that first.

## Licence

MIT. WKND is © Adobe and also MIT licensed. This project isn't affiliated with Adobe.

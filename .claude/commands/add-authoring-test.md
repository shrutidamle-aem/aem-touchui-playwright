---
description: Write and run a Playwright test that authors a component through the real Touch UI dialog
argument-hint: <component resource type> <path to its dialog>
---

Add an authoring test for `$1`, using the dialog at `$2`.

0. Find the project: it's the first segment of `$1` (`<project>/components/...`). The test goes in `tests/specs/<project>/`. If that folder doesn't exist, stop and ask the person to run `/setup-project` first. Check that `AEM_TEMPLATE`, `AEM_SCRATCH_PARENT` and `AEM_CONTAINER` are set for this project. If they're unset, the run uses the WKND defaults. Every project-specific path (assets, fragments, pages) goes in the spec, never in `tests/lib`.
1. Read the dialog and pick the fields that matter. Note tabs, multifields and rich text.
2. Choose the pattern:
   - Leaf component: `insertComponent`, then `openDialogFor`.
   - Container: `openDialogForContainer`.
   - Shared or live content: edit, assert, restore. See `tests/specs/wknd/05-header-edit-restore.spec.ts`.
3. Write `tests/specs/<project>/NN-<component>.spec.ts` from the helpers in `tests/lib`, imported as `../../lib/...`. Number it after the files already in that folder. Don't write new selectors in a spec.
4. Run it with `npx playwright test tests/specs/<project>/<file>`. If a selector fails, open the trace, fix it in `tests/lib/selectors.ts`, and run again. A selector fix is shared, so then run the whole bundled WKND suite on its defaults, and check that it still passes.
5. Assert what a visitor or the repository actually gets, not only that the dialog closed.
6. Stop and report a failure that looks like a product bug. Never bend the test to get green. See "Failures" in `CLAUDE.md`.

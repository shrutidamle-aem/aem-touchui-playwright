# AEM Touch UI authoring tests

Playwright tests that drive the real Touch UI page editor (`/editor.html`) on a local AEM SDK author, for any AEM project that uses that editor. Not Universal Editor. WKND is the bundled example.

## Layout
- `tests/lib/`: generic helpers and selectors, shared by every project. Nothing project-specific goes here: no app names, `/content` or `/conf` paths, or assets.
- `tests/lib/config.ts`: reads `AEM_TEMPLATE`, `AEM_SCRATCH_PARENT` and `AEM_CONTAINER`. The WKND defaults are set in `playwright.config.ts`, and `.env.example` describes each value.
- `tests/specs/<project>/`: one folder per AEM project, named after its `/apps` folder. Project-specific paths stay in its specs.
- `tests/specs/wknd/`: the bundled example. Keep it green on the defaults.
- `.claude/commands/`: `/setup-project` proposes the env values and creates the spec folder. `/audit-dialog` finds dialog and model mismatches. `/add-authoring-test` writes a test into `tests/specs/<project>/`.

## Commands
- `npm test`: run everything (the WKND specs need the WKND defaults)
- `npx playwright test tests/specs/<project>`: run one project, with its env values exported
- `npx playwright test tests/specs/<project>/<file>`: run one file
- `npx playwright show-trace <trace.zip>`: inspect a failure
- `npm run typecheck`

## Rules
- Drive the UI. Use direct POSTs only for setup, cleanup, or something that isn't under test, and say why in a comment.
- Insert with the picker, not drag and drop.
- Selectors live only in `tests/lib/selectors.ts`.
- Keep `tests/lib` generic. `grep -rni wknd . --exclude-dir={node_modules,.git,test-results,playwright-report} | grep -v '^tests/specs/wknd/\|^README.md'` should list only the documented defaults and pointers to the example.
- Use `page.request` or `postFromPage`. Never the standalone `request` fixture, because its cookies drift.
- Poll with `expect.poll`. Never use a fixed sleep.
- Every test cleans up after itself, pass or fail.
- Keep `retries: 0`.

## Failures
Work out which kind it is before changing anything:
1. **Wrong selector:** fix `selectors.ts` and rerun.
2. **Timing:** wait for the real signal.
3. **Product bug:** stop and report it. If the team agrees, pin it as a `KNOWN BAD` test with a control beside it.

Never weaken an assertion to get a green run.

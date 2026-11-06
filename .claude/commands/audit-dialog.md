---
description: Compare what an AEM component's dialog promises with what its code enforces
argument-hint: <path to the AEM project> <component name>
---

Audit the dialog contract for component `$2` in the AEM project at `$1`. Read code only. Don't change the AEM project.

1. Find the dialog: `_cq_dialog/.content.xml`, following `sling:resourceSuperType` and any Granite includes.
2. Find what renders it: the HTL file, the Sling Model it uses, and especially `isEmpty()` or any `data-sly-test` that hides output.
3. List each authorable field in a table with these columns: field, label and description text, dialog rule (`required`, `validation`), model or HTL rule, match or mismatch.
4. Report only these mismatches:
   - **Stricter dialog:** the dialog blocks a save the content doesn't need, or that contradicts the description.
   - **Silent loss:** the dialog accepts a save and the output disappears or loses data.
   - **Lying description:** the `fieldDescription` claims a rule nothing enforces.
5. For each mismatch give the file and line for both sides, and the exact steps an author would take.

Treat every mismatch as a candidate until a test proves it. Then ask which ones to pin. For each one chosen, follow `/add-authoring-test`, and write it as `KNOWN BAD` with a passing control test.

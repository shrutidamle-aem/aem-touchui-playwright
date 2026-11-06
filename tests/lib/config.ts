/**
 * The site-specific values the helpers need, read from the environment.
 * The defaults are set once in playwright.config.ts; see .env.example for what each one means.
 * Nothing in tests/lib may hard-code a project's paths: put them here or in the project's specs.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. See .env.example.`);
  return value;
}

/** Page template the scratch pages are created from. */
export const TEMPLATE = required('AEM_TEMPLATE');

/** Where scratch pages are created. Each test makes one child here and deletes it after. */
export const SCRATCH_PARENT = required('AEM_SCRATCH_PARENT');

/** Path of the insert container, relative to the page, with no leading slash. */
export const CONTAINER = required('AEM_CONTAINER').replace(/^\/+|\/+$/g, '');

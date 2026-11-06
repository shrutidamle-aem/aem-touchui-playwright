/**
 * Every Touch UI selector lives here, so a change in an AEM release is a one-file fix.
 * The first three come straight from the Cypress tests in Adobe's own sample site project.
 * The rest are checked by running the suite, not by Adobe's docs.
 */
export const sel = {
  editable: (path: string) => `div[data-type="Editable"][data-path="${path}"]`,
  insertButton: (path: string) => `button[data-action="INSERT"][data-path="${path}"]`,
  pickerItem: (resourceType: string) => `coral-list-item[value="/apps/${resourceType}"]`,

  toolbarConfigure: '#EditableToolbar button[data-action="CONFIGURE"]',
  toolbarParent: '#EditableToolbar button[data-action="PARENT"]',
  // Parent selects the container directly; there is no .parent-border-0 outline to click.
  selectedEditable: (path: string) => `div[data-type="Editable"][data-path="${path}"].is-selected`,
  // The toolbar re-renders for the new selection, and its buttons carry that editable's path.
  toolbarConfigureFor: (path: string) => `#EditableToolbar button[data-action="CONFIGURE"][data-path="${path}"]`,

  dialog: 'coral-dialog[open]',
  dialogDone: 'button.cq-dialog-submit',
  dialogCancel: 'button.cq-dialog-cancel',
  invalidField: '[aria-invalid="true"]',
  fieldErrorLabel: '.coral-Form-errorlabel',

  // Coral's native input is transparent but sits on top of the box, so it takes the click.
  checkboxInput: (name: string) => `coral-checkbox[name="${name}"] input[type="checkbox"]`,

  // Core Image v3 asset tab, shared by Image and any component that embeds it (Teaser, for one).
  altText: 'input[name="./alt"]',
  imageFromPage: './imageFromPageImage', // "Inherit featured image from page", ticked by default
  altFromDam: './altValueFromDAM', // "Inherit from description of asset"
  isDecorative: './isDecorative', // "Don't provide an alternative text"

  // Teaser text tab: "Get description from linked page", ticked by default; makes the editor read-only.
  descriptionFromPage: './descriptionFromPage',

  richText: (name: string) =>
    `.cq-RichText:has(input[name="${name}"]) [data-cq-richtext-editable], [contenteditable][name="${name}"]`,
  multifield: (name: string) => `coral-multifield[data-granite-coral-multifield-name="${name}"]`,
} as const;

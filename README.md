# ngx-form-draft

Zero-dependency Angular form draft auto-save and restore. Works with any Angular version ≥12.

## Features

- Auto-saves form values to localStorage
- Restores drafts on page reload
- Works with Reactive and Template-driven forms
- Handles nested FormGroups and FormArrays
- Visual banner with discard option
- 7-day draft expiration
- Zero external dependencies

## Installation

```bash
npm install ngx-form-draft
```

## Usage

### 1. Import the module

```typescript
import { NgxFormDraftModule } from 'ngx-form-draft';

@NgModule({
  imports: [NgxFormDraftModule]
})
export class AppModule {}
```

### 2. Add directive to your form

```html
<form [formGroup]="myForm" ngxFormDraft="uniqueFormId">
  <!-- form fields -->
</form>
```

### 3. Scoped drafts (per entity)

```html
<form [formGroup]="editForm" [ngxFormDraft]="'edit_' + userId">
```

## Options

```html
<form 
  [formGroup]="myForm"
  [ngxFormDraft]="'myForm_' + entityId"
  [draftDebounce]="1000"
  [draftExcludeFields]="['password', 'confirmPassword']"
  [draftShowOnChange]="true"
  [draftRestoredText]="'Draft restored'"
  [draftSavedText]="'Draft saved'"
  [draftSavedLabel]="'saved'"
  [draftDiscardText]="'Discard'">
</form>
```

### Input Properties

- `ngxFormDraft` (string): Unique form identifier
- `draftDebounce` (number): Debounce time in ms (default: 800)
- `draftExcludeFields` (string[]): Fields to exclude from draft
- `draftShowOnChange` (boolean): Show banner immediately on change (default: false)
- `draftRestoredText` (string): Banner text for restored draft
- `draftSavedText` (string): Banner text for saved draft
- `draftSavedLabel` (string): Label before timestamp
- `draftDiscardText` (string): Discard button text

## Internationalization (i18n)

The package has **zero dependencies** and supports any i18n solution. Just pass translated strings via inputs:

### With ngx-translate:
```html
<form 
  [formGroup]="myForm"
  ngxFormDraft="myForm"
  [draftRestoredText]="'form_draft.restored' | translate"
  [draftSavedText]="'form_draft.saved' | translate"
  [draftSavedLabel]="'form_draft.saved_label' | translate"
  [draftDiscardText]="'form_draft.discard' | translate">
</form>
```

### With Angular i18n:
```html
<form 
  [formGroup]="myForm"
  ngxFormDraft="myForm"
  [draftRestoredText]="restoredText"
  [draftSavedText]="savedText"
  [draftDiscardText]="discardText"
  i18n-draftRestoredText="@@formDraftRestored"
  i18n-draftSavedText="@@formDraftSaved"
  i18n-draftDiscardText="@@formDraftDiscard">
</form>
```

### With component properties:
```typescript
// component.ts
export class MyComponent {
  draftTexts = {
    restored: 'Brouillon restauré',
    saved: 'Brouillon sauvegardé',
    savedLabel: 'sauvegardé',
    discard: 'Supprimer'
  };
}
```

```html
<!-- template.html -->
<form 
  [formGroup]="myForm"
  ngxFormDraft="myForm"
  [draftRestoredText]="draftTexts.restored"
  [draftSavedText]="draftTexts.saved"
  [draftSavedLabel]="draftTexts.savedLabel"
  [draftDiscardText]="draftTexts.discard">
</form>
```

### Default English text:
If you don't provide any text inputs, defaults are:
- `draftRestoredText`: "Draft restored"
- `draftSavedText`: "Draft saved"
- `draftSavedLabel`: "saved"
- `draftDiscardText`: "Discard"

## License

MIT

# Hyper-Compact UI Design Guide (28px Standard)

This document serves as a reference for the high-density UI system implemented in the project. The goal is to maximize information density while maintaining a professional and clean aesthetic.

## 1. Global Configuration (Automatic)

The system is configured to automatically apply the hyper-compact look to **all** Vuetify input components globally.

- **Global SCSS File**: `src/@core-styles/base/_hyper-compact.scss`
- **Registration**: Imported in `src/@core-styles/base/_index.scss`

### What it does automatically:
- Forces all `.v-field` (TextField, Select, Autocomplete, etc.) to a strict **28px height**.
- Automatically **centers labels vertically** using dynamic transforms.
- Removes internal paddings and margins from input fields.
- Vertically centers **prefixes, suffixes (EGP, %)**, and icons.
- Scales down icons to **16px** to fit the small height.

---

## 2. Component-Level Implementation

While the fields are automatic, the containers (Rows, Cards, Headers) require manual "thinning" to match the density.

### Core Principles for New Pages:
1. **Reduce Margins/Paddings**: Replace `pa-4` or `mb-4` with `pa-1`, `pa-2`, or `mb-2`.
2. **Compact Density**: Always use `density="compact"` on Vuetify components like `v-btn`, `v-alert`, `v-chip`, and `v-switch`.
3. **Small Sizes**: Use `size="small"` or `size="x-small"` for buttons and icons.
4. **Line Height**: Use the utility class `.line-height-1` for labels to prevent vertical bloat.

### Custom Utility Classes:
Add these to your component's `<style scoped>` if needed (or they can be moved to global if used frequently):

| Class | Purpose |
| :--- | :--- |
| `.text-xxs` | Sets font-size to **10px** for secondary labels/hints. |
| `.min-height-28` | Forces a container (like expansion panel titles) to 28px. |
| `.centered-input` | Centers the text inside an input field. |
| `.dashed-row` | Adds a 1px dashed border for financial summaries. |

---

## 3. Reference Example (Page Structure)

When creating a new form, follow this structure:

```html
<!-- High-Density Header -->
<div class="d-flex align-center gap-2 mb-2">
  <v-avatar size="28" class="rounded-md">...</v-avatar>
  <span class="text-xxs font-weight-bold">Section Title</span>
</div>

<!-- High-Density Row -->
<v-row dense class="mt-1">
  <v-col cols="3">
    <AppInput label="Field" density="compact" />
  </v-col>
</v-row>
```

## 4. Troubleshooting misalignments

- **Label cut off?** Ensure the parent doesn't have an overflow issue and that the global `_hyper-compact.scss` is loaded.
- **Icon not centered?** Check if the component uses a custom slot that might need `display: flex; align-items: center;`.
- **EGP/% out of place?** The global styles target `.v-field__prefix` and `.v-field__suffix`; ensure your component uses these standard Vuetify props.

---
*Last updated: May 2026*

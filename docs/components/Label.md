# Label

A visible field label that pairs with a form control via `htmlFor`. It mirrors the typography the house field skeleton uses, so a standalone label reads the same as the label TextField and Checkbox generate internally.

## When to use

Use Label when building a custom field control that needs a visible label without the full TextField or Checkbox wrapper, or when labelling a group of controls (a fieldset heading, a group of checkboxes). Do not use it as a heading — use semantic heading elements for document structure.

## Sizes

| Size | Token | Use |
|------|-------|-----|
| `sm` | `--font-size-xs` | Dense layouts, secondary labels |
| `md` (default) | `--font-size-sm` | Standard field labels |

## Required marker

Pass `required={true}` to render the asterisk marker. It is `aria-hidden` so the label text reads cleanly in assistive technology — pair with `aria-required="true"` on the control itself.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `htmlFor` | `string` | — | Associates the label with a control by id |
| `size` | `LabelSize` | `"md"` | `"sm"` \| `"md"` |
| `required` | `boolean` | `false` | Appends the visible required marker |
| `hint` | `string` | — | Short supporting text rendered below the label text |
| `children` | `ReactNode` | — | The label text |

## Tokens consumed

```
--field-label-gap       → --space-1 (gap between label text and hint)
--font-size-sm          default size
--font-size-xs          sm size
--font-weight-medium    label weight
--line-height-snug      line height
--color-base-content    label text
--color-text-muted      hint text
--color-link            required marker colour (decorative)
```

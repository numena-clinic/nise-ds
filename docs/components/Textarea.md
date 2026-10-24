# Textarea

A multi-line text control with a visible label, an optional hint and an optional error. It is TextField as a `<textarea>`: the label is always visible, the field skeleton is shared, and errors carry text, an icon, and a heavier boundary — never colour alone.

## When to use

Use Textarea for free-text clinical notes, observations, and comments where a single line is not enough. Use TextField for short structured fields (names, IDs, emails).

## States

| State | Visual signal |
|-------|--------------|
| Default | `--color-border-strong` border |
| Hover | `--color-border-hover` border |
| Focus | `--color-focus-ring` outline |
| Error | `--color-border-error` border + error icon + error text |
| Disabled | Reduced opacity (`--opacity-disabled`); not interactive |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **required** | Always-visible label |
| `hint` | `string` | — | Supporting text below the label |
| `error` | `string` | — | Error message; suppresses hint when present |
| `disabled` | `boolean` | `false` | Disables the control |
| `id` | `string` | auto | Wires `htmlFor` and `aria-describedby` automatically |
| `rows` | `number` | — | Native `<textarea>` rows attribute |

Also accepts all `<textarea>` HTML attributes except `id` (managed internally).

## Tokens consumed

```
--textarea-padding-y       → --space-2
--textarea-min-height      literal px (component layer)
--input-padding-x          → --space-3
--control-font-size        → --font-size-md
--field-gap, --field-label-gap, --field-message-font-size
--color-base-100           control background
--color-base-content       input text
--color-text-muted         placeholder + hint
--color-border-strong      default border
--color-border-hover       hover border
--color-border-error       error border
--color-focus-ring         focus outline
--opacity-disabled         disabled state
```

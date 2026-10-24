# Collapsible

A disclosure region — release notes, advanced options, additional history — built on the native `<details>`/`<summary>` pair. The disclosure is accessible natively; the component adds styling and a rotating chevron.

## When to use

Use Collapsible for optional supplemental content that most users skip but some need. Do not use it for primary content paths — visible content is easier to read and scan than hidden content.

## Controlled vs uncontrolled

- Pass `defaultOpen` for an initially-open uncontrolled state.
- Pass `open` to own the state from outside. Note that because this is `<details>`, native user toggles are corrected back on the next re-render — prefer `defaultOpen` unless you truly need to own the state.

## Composition

```tsx
<Collapsible trigger="Advanced export options">
  <CollapsibleContent>
    <Checkbox label="Include archived notes" />
  </CollapsibleContent>
</Collapsible>
```

`CollapsibleTrigger` is also exported for cases where you need the trigger rendered separately from the `<details>` wrapper.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | **required** | The always-visible summary label |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `open` | `boolean` | — | Controlled open state |

## Tokens consumed

```
--color-base-content    trigger text
--color-base-hover      trigger hover background
--color-focus-ring      focus outline
--focus-ring-width      focus outline width
--focus-ring-offset     focus outline offset
--font-weight-medium    trigger label weight
--radius-sm             trigger border-radius
--space-1, --space-2    padding
```

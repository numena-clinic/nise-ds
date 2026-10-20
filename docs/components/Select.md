# Select

A single-choice control for a short, known list.

## When to use

- The options are mutually exclusive and the list is short (roughly 5–15).
- The user must pick one value from a set they can scan.

## When not to use

- Two or three options — radio tiles read better and need no menu.
- A long or free-form set — use a combobox (not built yet).
- Multiple selection — not supported here.

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `label` | `string` | Required, always visible |
| `options` | `SelectOption[]` | `{ value, label, disabled? }` |
| `value` / `defaultValue` | `string` | Controlled / uncontrolled |
| `onValueChange` | `(value: string) => void` | — |
| `placeholder` | `string` | Shown before a choice is made |
| `hint` / `error` | `ReactNode` | Same behaviour as `TextField` |
| `disabled`, `required`, `name` | — | Forwarded to the primitive |
| `portalContainer` | `HTMLElement \| null` | Where to mount the popup. Defaults to `document.body`; pass a container when the Select sits inside a scoped theme so the popup inherits the same CSS custom properties |

## Why Radix

`Select` is built on `@radix-ui/react-select`. Listbox semantics, typeahead,
keyboard navigation, focus management and the portal are the primitive's job —
classes of accessibility bug we do not want to re-solve. We own only the
appearance and the token mapping. A native `<select>` is not used because it
cannot be styled consistently across the system.

## Anatomy & tokens

```
Label  *
[ value              ▾ ]   chevron 20, muted → action on hover
hint or error
```

- Trigger height `--select-height` → `--control-height-md` (40px); padding,
  font size and item height come from the same `--control-*` slots.
- The open menu is a floating surface: `--shadow-md`, `--radius-md`,
  `--color-surface`.
- The reserved 16px indicator slot holds the check; the selected item is a tinted
  tile (`--color-selected-surface`) with a distinct action foreground
  (`--color-selected-text`) — selection is shown by **tile and foreground**, not
  colour alone (iconography.md §4).
- The chevron is `ChevronDownIcon size={20}` — the brand's default icon size.

## Accessibility

- The trigger owns `role="combobox"` and is labelled by the visible label via
  `aria-labelledby`.
- `aria-describedby` follows the same rule as `TextField`: hint or error, never a
  missing id, and the hint leaves the DOM on error.
- The check is reserved, not injected, so opening the menu does not reflow rows.

## Do / Don't

- **Don't** use the check icon anywhere but the selected item — it is reserved
  for the system's "this option is chosen" state (iconography.md §5).

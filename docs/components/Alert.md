# Alert

A status banner for a machine state. It reports what the system knows — never a clinical judgement. The words in it must carry the meaning on their own.

## When to use

Use an Alert when you need to surface a system event that the user should read but need not act on immediately: a save confirmation, a sync failure, a deadline warning. Do not use it for clinical observations, diagnoses, or evidence — those go in plain body copy governed by context.

## Variants

| Variant | Color family | Meaning |
|---------|--------------|---------|
| `neutral` | `--color-base` | No status; a general informational banner |
| `info` | `--color-info` | System information — a scheduled job, a pending export |
| `success` | `--color-success` | A completed machine operation |
| `warning` | `--color-warning` | A recoverable condition requiring attention |
| `error` | `--color-error` | A failed operation; content must say what to do next |

## Accessibility

Color is never the only signal (color.md §4). Each variant also carries:
- The `role="alert"` attribute, which announces the content to screen readers.
- A default `icon` drawn per variant — `AlertIcon` for warning/error, `InfoIcon` for info/success. Pass `icon={null}` only when a surrounding region already provides the icon.
- A `title` prop rendered as `<p>` (the primary statement of state); body `children` stay `--color-base-content`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `AlertVariant` | `"neutral"` | The machine state to communicate |
| `title` | `ReactNode` | — | Short text summary of the state |
| `icon` | `ReactNode` | variant default | Overrides the default icon; pass `null` to suppress |
| `children` | `ReactNode` | — | Detail copy; always renders in `--color-base-content` |

## Tokens consumed

```
--alert-padding     → --space-4
--alert-gap         → --space-3
--color-base-100    page surface behind the banner
--color-base-200    tinted surface of the banner itself
--color-base-content body text
--color-info / -content, --color-success / -content,
--color-warning, --color-error   status accent + icon
--color-border      hairline rule
```

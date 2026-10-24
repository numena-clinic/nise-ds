/* =============================================================================
   Label
   -----------------------------------------------------------------------------
   The standalone form label — the same control labels that TextField and
   Textarea render, for when the labelled control is composed by hand (a custom
   input, a group heading for checkboxes). Typography mirrors the shared field
   skeleton: `--font-size-sm` at `md` (the size TextField's labels read at, and
   the pair for `--control-font-size`), `--font-size-xs` at `sm`, medium weight,
   `--color-base-content`.

   It associates through `htmlFor` — there is no hint/error wiring here, so
   `aria-describedby` is the consuming component's job. A hint, when given, is
   short supporting text in the muted tone, read together with the label;
   `required` adds the visible marker the labelled controls use (aria-hidden,
   so the label itself reads cleanly).

   Tokens consumed (component layer → semantic → primitive):
      --field-label-gap               → --space-1
      --font-size-{xs,sm}, --font-weight-*, --line-height-snug
      --color-base-content, --color-text-muted, --color-link
   ============================================================================= */

import type { HTMLAttributes, ReactNode } from "react";
import "./Label.css";

export type LabelSize = "sm" | "md";

export interface LabelProps extends Omit<HTMLAttributes<HTMLLabelElement>, "className"> {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  /** Short supporting text, rendered muted after the label. */
  hint?: string;
  size?: LabelSize;
  className?: string;
}

export function Label({
  htmlFor,
  children,
  required,
  hint,
  size = "md",
  className,
  ...rest
}: LabelProps) {
  const classes = ["nise-label", `nise-label--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes} htmlFor={htmlFor} {...rest}>
      <span>{children}</span>
      {hint != null ? <span className="nise-label__hint">{hint}</span> : null}
      {required ? (
        <span className="nise-label__required" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

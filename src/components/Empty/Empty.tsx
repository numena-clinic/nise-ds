/* =============================================================================
   Empty
   -----------------------------------------------------------------------------
   An empty state block for a list with no records yet — no sessions recorded,
   no assessment data. A centred column: an optional tinted icon slot, a title,
   an optional description and an optional action.

   The icon slot is purely decorative (aria-hidden): the title and description
   carry the meaning in words (iconography.md §5). It is not a status banner —
   no success/error information, no verdict; colour here is categorical tint
   and the copy is what reads (color.md §4).

   Tokens consumed:
     --empty-padding, --empty-gap → --space-8, --space-3
     --control-height-lg (icon slot size)
       → --control-lg 48px
     --color-tint-purple, --color-base-content, --color-text-muted,
     --font-sans, --font-size-{md,sm}, --font-weight-medium,
     --line-height-snug, --radius-full (point of use:
     var(--empty-radius, var(--radius-full)))
   ============================================================================= */

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import "./Empty.css";

export interface EmptyProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Decorative leading icon, shown inside a tinted circle. */
  icon?: ReactNode;
  /** The short statement of what is empty. Rendered as a labelled <p>. */
  title: ReactNode;
  /** Optional supporting copy under the title. */
  description?: ReactNode;
  /** An action area (e.g. a button to create the first record). */
  action?: ReactNode;
}

export const Empty = forwardRef<HTMLElement, EmptyProps>(
  function Empty({ icon, title, description, action, className, ...rest }, ref) {
    return (
      <section
        {...rest}
        ref={ref}
        className={["nise-empty", className].filter(Boolean).join(" ")}
      >
        {icon != null ? (
          <span className="nise-empty__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {title != null ? <p className="nise-empty__title">{title}</p> : null}
        {description != null ? (
          <p className="nise-empty__description">{description}</p>
        ) : null}
        {action != null ? <div className="nise-empty__action">{action}</div> : null}
      </section>
    );
  },
);

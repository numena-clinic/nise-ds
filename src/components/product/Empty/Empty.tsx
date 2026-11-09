/* =============================================================================
   Empty
   -----------------------------------------------------------------------------
   An empty state block for a list with no records yet — no sessions recorded,
   no assessment data.

   Tokens consumed:
     --empty-padding, --empty-gap → --space-8, --space-3
     --control-height-lg (icon slot size)
     --color-tint-purple, --color-base-content, --color-text-muted
   ============================================================================= */

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../../lib/cn";

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
        className={cn(
          "nise-empty flex flex-col items-center justify-center text-center gap-[var(--empty-gap)] p-[var(--empty-padding)] bg-base-100 border border-dashed border-border rounded-[var(--radius-lg)] font-sans",
          className,
        )}
      >
        {icon != null ? (
          <span
            className="nise-empty__icon inline-flex items-center justify-center size-[var(--control-height-lg)] rounded-[var(--empty-radius,var(--radius-full))] bg-tint-purple text-base-content"
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
        {title != null ? (
          <p className="nise-empty__title m-0 text-[length:var(--font-size-md)] font-[var(--font-weight-semibold)] leading-[var(--line-height-snug)] text-base-content">
            {title}
          </p>
        ) : null}
        {description != null ? (
          <p className="nise-empty__description m-0 max-w-[var(--measure-form)] text-[length:var(--font-size-sm)] leading-[var(--line-height-normal)] text-text-muted">
            {description}
          </p>
        ) : null}
        {action != null ? (
          <div className="nise-empty__action pt-[var(--space-2)]">{action}</div>
        ) : null}
      </section>
    );
  },
);

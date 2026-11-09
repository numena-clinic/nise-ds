/* =============================================================================
   Card
   -----------------------------------------------------------------------------
   A bordered surface that groups related content under a heading.

   Tokens consumed:
     --card-padding, --card-gap, --card-border-width
     --color-base-100, --color-base-content, --color-text-muted, --color-border,
     --shadow-sm, --font-serif, --font-size-{xl,sm}
   ============================================================================= */

import { createElement, type ReactNode } from "react";
import { cn } from "../../../lib/cn";

export interface CardProps {
  heading?: ReactNode;
  description?: ReactNode;
  /** Right-aligned controls in the header (buttons, a menu). */
  actions?: ReactNode;
  /** Actions along the bottom, separated by a rule. */
  footer?: ReactNode;
  children?: ReactNode;
  /** Heading level for the page outline. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function Card({
  heading,
  description,
  actions,
  footer,
  children,
  headingLevel = 3,
  className,
}: CardProps) {
  const hasHeader = heading != null || description != null || actions != null;

  return (
    <section
      className={cn(
        "nise-card flex flex-col gap-[var(--card-gap)] p-[var(--card-padding)] bg-base-100 text-base-content border border-solid border-border rounded-[var(--card-radius,var(--radius-lg))] shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {hasHeader ? (
        <header className="nise-card__header flex items-start justify-between gap-[var(--space-4)]">
          <div className="nise-card__heading-group flex flex-col gap-[var(--space-1)] min-w-0">
            {heading != null
              ? createElement(
                  `h${headingLevel}`,
                  {
                    className:
                      "nise-card__heading m-0 font-serif text-[length:var(--font-size-xl)] font-[var(--font-weight-semibold)] leading-[var(--line-height-tight)] tracking-[var(--letter-spacing-tight)] text-base-content",
                  },
                  heading,
                )
              : null}
            {description != null ? (
              <p className="nise-card__description m-0 font-sans text-[length:var(--font-size-sm)] leading-[var(--line-height-normal)] text-text-muted">
                {description}
              </p>
            ) : null}
          </div>
          {actions != null ? (
            <div className="nise-card__actions flex items-center shrink-0 gap-[var(--space-2)]">
              {actions}
            </div>
          ) : null}
        </header>
      ) : null}

      {children != null ? (
        <div className="nise-card__body flex flex-col gap-[var(--card-gap)]">
          {children}
        </div>
      ) : null}

      {footer != null ? (
        <footer className="nise-card__footer flex items-center justify-end gap-[var(--space-3)] pt-[var(--space-4)] border-t border-solid border-border">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

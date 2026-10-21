/* =============================================================================
   Card
   -----------------------------------------------------------------------------
   A bordered surface that groups related content under a heading. It is a
   container, not an interactive control: if the whole card should be clickable,
   put a link or button inside it rather than making the surface one.

   Tokens consumed:
     --card-padding, --card-gap, --card-border-width
       → --space-6, --space-4, --border-width
     --color-surface, --color-text, --color-text-muted, --color-border,
     --shadow-sm, --font-serif, --font-size-{xl,sm}, --line-height-*, --letter-spacing-tight

   Radius is declared at the point of use: var(--card-radius, var(--radius-md)).
   The heading is an <h3> by default; pass a different level via `headingLevel`
   when the card sits deeper in the page outline.
   ============================================================================= */

import { createElement, type ReactNode } from "react";
import "./Card.css";

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
    <section className={["nise-card", className].filter(Boolean).join(" ")}>
      {hasHeader ? (
        <header className="nise-card__header">
          <div className="nise-card__heading-group">
            {heading != null
              ? createElement(
                  `h${headingLevel}`,
                  { className: "nise-card__heading" },
                  heading,
                )
              : null}
            {description != null ? (
              <p className="nise-card__description">{description}</p>
            ) : null}
          </div>
          {actions != null ? <div className="nise-card__actions">{actions}</div> : null}
        </header>
      ) : null}

      {children != null ? <div className="nise-card__body">{children}</div> : null}

      {footer != null ? <footer className="nise-card__footer">{footer}</footer> : null}
    </section>
  );
}

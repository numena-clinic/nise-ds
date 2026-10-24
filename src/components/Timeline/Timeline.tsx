/* =============================================================================
   Timeline
   -----------------------------------------------------------------------------
   A vertical history of system events on a record — session note saved, intake
   form completed, assessment scheduled. Native list semantics: <ol role="list">
   (the explicit role restores list announcement lost to list-style: none in
   some screen-reader/browser pairs), each <TimelineItem> an <li>.

   The item states are operational, machine-state vocabulary only (done,
   current, upcoming) — never a clinical reading of a tint (color.md §4). The
   rail connector is drawn between items in CSS so it stays token-parameterised
   and self-aligning; the dots are the state channel, and the title text is the
   other.

   Tokens consumed:
     --timeline-dot, --timeline-gap, --timeline-rail
       → 10px, --space-4, --border-width-strong
     --color-tint-purple, --color-primary, --color-border,
     --color-base-content, --color-text-muted, --border-width,
     --focus-ring-width, --focus-ring-offset
     --font-sans, --font-size-{sm,xs}, --font-weight-medium,
     --line-height-snug, --radius-full --space-{1,2,3} (point of use:
     var(--timeline-radius, var(--radius-full)))
   ============================================================================= */

import {
  forwardRef,
  type LiHTMLAttributes,
  type OlHTMLAttributes,
  type ReactNode,
} from "react";
import "./Timeline.css";

export type TimelineItemVariant = "done" | "current" | "upcoming";

export interface TimelineProps extends OlHTMLAttributes<HTMLOListElement> {
  children?: ReactNode;
}

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  function Timeline({ className, ...rest }, ref) {
    return (
      <ol
        {...rest}
        ref={ref}
        role="list"
        className={["nise-timeline", className].filter(Boolean).join(" ")}
      />
    );
  },
);

export interface TimelineItemProps
  extends Omit<LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** The event, in words — the state never rides on colour alone. */
  title: ReactNode;
  /** Right-aligned supplementary text, typically a time. */
  meta?: ReactNode;
  /** An optional description under the title. */
  children?: ReactNode;
  variant?: TimelineItemVariant;
}

export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  function TimelineItem(
    { title, meta, children, variant = "upcoming", className, ...rest },
    ref,
  ) {
    return (
      <li
        {...rest}
        ref={ref}
        className={[
          "nise-timeline__item",
          `nise-timeline__item--${variant}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="nise-timeline__header">
          <span className="nise-timeline__title">{title}</span>
          {meta != null ? (
            <span className="nise-timeline__meta">{meta}</span>
          ) : null}
        </span>
        {children != null ? (
          <p className="nise-timeline__body">{children}</p>
        ) : null}
      </li>
    );
  },
);

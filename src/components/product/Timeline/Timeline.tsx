/* =============================================================================
   Timeline
   -----------------------------------------------------------------------------
   A vertical history of system events on a record — session note saved, intake
   form completed, assessment scheduled.

   Tokens consumed:
     --timeline-dot, --timeline-gap, --timeline-rail
       → 10px, --space-4, --border-width-strong
     --color-tint-purple, --color-primary, --color-border,
     --color-base-content, --color-text-muted
   ============================================================================= */

import {
  forwardRef,
  type LiHTMLAttributes,
  type OlHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../../lib/cn";

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
        className={cn(
          "nise-timeline m-0 p-0 list-none flex flex-col font-sans text-base-content",
          className,
        )}
      />
    );
  },
);

export interface TimelineItemProps
  extends Omit<LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** The event, in words — the state never rides on color alone. */
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
        className={cn(
          "nise-timeline__item relative flex flex-col gap-[var(--space-1)] pl-[var(--space-6)] pb-[var(--timeline-gap)] last:pb-0",
          "before:content-[''] before:absolute before:left-[calc((var(--timeline-dot)-var(--timeline-rail))/2)] before:top-[var(--timeline-dot)] before:bottom-0 before:w-[var(--timeline-rail)] before:bg-border last:before:hidden",
          "after:content-[''] after:absolute after:left-0 after:top-[var(--space-1)] after:size-[var(--timeline-dot)] after:rounded-[var(--timeline-radius,var(--radius-full))] after:box-border",
          variant === "done" &&
            "nise-timeline__item--done after:bg-primary after:border-[length:var(--border-width-strong)] after:border-primary",
          variant === "current" &&
            "nise-timeline__item--current after:bg-tint-purple after:border-[length:var(--border-width-strong)] after:border-primary",
          variant === "upcoming" &&
            "nise-timeline__item--upcoming after:bg-base-100 after:border-[length:var(--border-width-strong)] after:border-border-strong",
          className,
        )}
      >
        <span className="nise-timeline__header flex items-baseline justify-between gap-[var(--space-3)]">
          <span className="nise-timeline__title text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-snug)] text-base-content">
            {title}
          </span>
          {meta != null ? (
            <span className="nise-timeline__meta shrink-0 text-[length:var(--font-size-xs)] tabular-nums text-text-muted">
              {meta}
            </span>
          ) : null}
        </span>
        {children != null ? (
          <p className="nise-timeline__body m-0 text-[length:var(--font-size-sm)] leading-[var(--line-height-normal)] text-text-muted">
            {children}
          </p>
        ) : null}
      </li>
    );
  },
);

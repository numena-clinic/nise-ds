/* =============================================================================
   Pagination
   -----------------------------------------------------------------------------
   Page navigation for a record list: sessions, assessments, anything paged.

   Tokens consumed:
     --pagination-gap → --space-1
     --button-height-sm, --button-padding-x-sm, --button-font-size-sm,
     --button-gap → --control-height-sm, --space-3, --font-size-sm, --space-2
   ============================================================================= */

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../icons";
import { cn } from "../../../lib/cn";

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination({ className, ...rest }, ref) {
    return (
      <nav
        {...rest}
        ref={ref}
        aria-label={rest["aria-label"] ?? "Pagination"}
        className={cn("nise-pagination flex items-center justify-center font-sans", className)}
      />
    );
  },
);

export interface PaginationContentProps
  extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
}

export const PaginationContent = forwardRef<
  HTMLUListElement,
  PaginationContentProps
>(function PaginationContent({ className, ...rest }, ref) {
  return (
    <ul
      {...rest}
      ref={ref}
      className={cn(
        "nise-pagination__content m-0 p-0 list-none flex flex-wrap items-center gap-[var(--pagination-gap)]",
        className,
      )}
    />
  );
});

export interface PaginationItemProps extends LiHTMLAttributes<HTMLLIElement> {
  children?: ReactNode;
}

export const PaginationItem = forwardRef<HTMLLIElement, PaginationItemProps>(
  function PaginationItem({ className, ...rest }, ref) {
    return (
      <li
        {...rest}
        ref={ref}
        className={cn("nise-pagination__item inline-flex items-center", className)}
      />
    );
  },
);

export interface PaginationEllipsisProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export const PaginationEllipsis = forwardRef<
  HTMLSpanElement,
  PaginationEllipsisProps
>(function PaginationEllipsis({ children, className, ...rest }, ref) {
  return (
    <span
      {...rest}
      ref={ref}
      aria-hidden="true"
      className={cn(
        "nise-pagination__item nise-pagination__ellipsis inline-flex items-center justify-center min-w-[var(--button-height-sm)] h-[var(--button-height-sm)] px-[var(--space-2)] text-[length:var(--button-font-size-sm)] text-text-muted select-none",
        className,
      )}
    >
      {children ?? "…"}
    </span>
  );
});

export interface PaginationLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: ReactNode;
  /** Shorthand for a page number; ignored when `children` is provided. */
  page?: number;
  /** Marks the link as the current page (aria-current="page"). */
  isActive?: boolean;
}

export const PaginationLink = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  function PaginationLink(
    { page, isActive, className, children, ...rest },
    ref,
  ) {
    return (
      <a
        {...rest}
        ref={ref}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "nise-pagination__link inline-flex items-center justify-center gap-[var(--button-gap)] min-w-[var(--button-height-sm)] h-[var(--button-height-sm)] px-[var(--button-padding-x-sm)] font-sans text-[length:var(--button-font-size-sm)] font-[var(--font-weight-medium)] text-base-content no-underline rounded-[var(--pagination-radius,var(--radius-md))] border border-solid border-transparent transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-base-hover",
          isActive &&
            "nise-pagination__link--active bg-selected-surface text-selected-text border-border-strong",
          className,
        )}
      >
        {children ?? page}
      </a>
    );
  },
);

export interface PaginationPreviousProps
  extends Omit<PaginationLinkProps, "children" | "page"> {
  "aria-label"?: string;
}

export const PaginationPrevious = forwardRef<
  HTMLAnchorElement,
  PaginationPreviousProps
>(function PaginationPrevious({ className, ...rest }, ref) {
  return (
    <PaginationLink {...rest} ref={ref} className={className}>
      <span className="nise-pagination__icon inline-flex items-center" aria-hidden="true">
        <ChevronLeftIcon size={16} />
      </span>
      <span className="nise-pagination__label">Previous</span>
    </PaginationLink>
  );
});

export interface PaginationNextProps
  extends Omit<PaginationLinkProps, "children" | "page"> {
  "aria-label"?: string;
}

export const PaginationNext = forwardRef<HTMLAnchorElement, PaginationNextProps>(
  function PaginationNext({ className, ...rest }, ref) {
    return (
      <PaginationLink {...rest} ref={ref} className={className}>
        <span className="nise-pagination__label">Next</span>
        <span className="nise-pagination__icon inline-flex items-center" aria-hidden="true">
          <ChevronRightIcon size={16} />
        </span>
      </PaginationLink>
    );
  },
);

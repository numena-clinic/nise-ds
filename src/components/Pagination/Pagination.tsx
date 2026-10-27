/* =============================================================================
   Pagination
   -----------------------------------------------------------------------------
   Page navigation for a record list: sessions, assessments, anything paged.
   Built as composable parts over plain HTML (nav > ul > li > a) — the pattern
   has no backing behaviour that would earn a Radix primitive, so the pieces
   stay native and styled.

   The active page link carries aria-current="page". The previous and next
   links pair their decorative chevron with a visible text label — the icon is
   aria-hidden and never the only accessible name (iconography.md §4).

   Tokens consumed:
     --pagination-gap → --space-1
     --button-height-sm, --button-padding-x-sm, --button-font-size-sm,
     --button-gap → --control-height-sm, --space-3, --font-size-sm, --space-2
     --color-text-muted, --color-base-hover, --color-base-content,
     --color-tint-purple, --color-focus-ring, --focus-ring-width,
     --focus-ring-offset
     --font-sans, --font-weight-{regular,medium}, --radius-md (point of use:
     var(--pagination-radius, var(--radius-md))), --duration-fast,
     --ease-standard
   ============================================================================= */

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import "./Pagination.css";

/* ---------------------------------------------------------------- nav ----- */

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
        className={["nise-pagination", className].filter(Boolean).join(" ")}
      />
    );
  },
);

/* ----------------------------------------------------------------- ul ----- */

export interface PaginationContentProps
  extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
}

export const PaginationContent = forwardRef<HTMLUListElement, PaginationContentProps>(
  function PaginationContent({ className, ...rest }, ref) {
    return (
      <ul
        {...rest}
        ref={ref}
        className={["nise-pagination__content", className].filter(Boolean).join(" ")}
      />
    );
  },
);

/* ----------------------------------------------------------------- li ----- */

export interface PaginationItemProps extends LiHTMLAttributes<HTMLLIElement> {
  children?: ReactNode;
}

export const PaginationItem = forwardRef<HTMLLIElement, PaginationItemProps>(
  function PaginationItem({ className, ...rest }, ref) {
    return (
      <li
        {...rest}
        ref={ref}
        className={["nise-pagination__item", className].filter(Boolean).join(" ")}
      />
    );
  },
);

/* ----------------------------------------------------------------- ell ---- */

export interface PaginationEllipsisProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

/* A presentational span inside its own PaginationItem: an <li> here would nest
   a list item inside a list item, which HTML forbids. The label is decorative
   ("color must not be the only signal" applies here as decoration), so it is
   hidden from the tree and the screen reader walks the plain pages only. */
export const PaginationEllipsis = forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  function PaginationEllipsis({ children, className, ...rest }, ref) {
    return (
      <span
        {...rest}
        ref={ref}
        aria-hidden="true"
        className={[
          "nise-pagination__item",
          "nise-pagination__ellipsis",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children ?? "…"}
      </span>
    );
  },
);

/* ----------------------------------------------------------------- link --- */

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
        className={[
          "nise-pagination__link",
          isActive ? "nise-pagination__link--active" : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children ?? page}
      </a>
    );
  },
);

/* ------------------------------------------------------------ previous ---- */

export interface PaginationPreviousProps
  extends Omit<PaginationLinkProps, "children" | "page"> {
  /** Overrides the accessible name, which defaults to the visible label. */
  "aria-label"?: string;
}

export const PaginationPrevious = forwardRef<HTMLAnchorElement, PaginationPreviousProps>(
  function PaginationPrevious({ className, ...rest }, ref) {
    return (
      <PaginationLink {...rest} ref={ref} className={className}>
        <span className="nise-pagination__icon" aria-hidden="true">
          <ChevronLeftIcon size={16} />
        </span>
        <span className="nise-pagination__label">Previous</span>
      </PaginationLink>
    );
  },
);

/* ---------------------------------------------------------------- next ---- */

export interface PaginationNextProps
  extends Omit<PaginationLinkProps, "children" | "page"> {
  /** Overrides the accessible name, which defaults to the visible label. */
  "aria-label"?: string;
}

export const PaginationNext = forwardRef<HTMLAnchorElement, PaginationNextProps>(
  function PaginationNext({ className, ...rest }, ref) {
    return (
      <PaginationLink {...rest} ref={ref} className={className}>
        <span className="nise-pagination__label">Next</span>
        <span className="nise-pagination__icon" aria-hidden="true">
          <ChevronRightIcon size={16} />
        </span>
      </PaginationLink>
    );
  },
);

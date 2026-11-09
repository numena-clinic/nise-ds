/* =============================================================================
   Breadcrumb
   -----------------------------------------------------------------------------
   The path trail above a page: where the clinician is and how to get back.

   Tokens consumed:
      --breadcrumb-gap, --breadcrumb-font-size → --space-2, --font-size-sm
      --color-text-muted, --color-base-content
   ============================================================================= */

import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { ChevronRightIcon } from "../../../icons";
import { cn } from "../../../lib/cn";

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Accessible name for the trail. Defaults to "Breadcrumb". */
  "aria-label"?: string;
  children?: ReactNode;
}

export function Breadcrumb({
  "aria-label": ariaLabel = "Breadcrumb",
  children,
  className,
  ...rest
}: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        "nise-breadcrumb font-sans text-[length:var(--breadcrumb-font-size)]",
        className,
      )}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </nav>
  );
}

export type BreadcrumbListProps = HTMLAttributes<HTMLOListElement>;

export function BreadcrumbList({ className, ...rest }: BreadcrumbListProps) {
  return (
    <ol
      className={cn(
        "nise-breadcrumb__list m-0 p-0 list-none flex flex-wrap items-center gap-[var(--breadcrumb-gap)] text-text-muted",
        className,
      )}
      {...rest}
    />
  );
}

export type BreadcrumbItemProps = HTMLAttributes<HTMLLIElement>;

export function BreadcrumbItem({ className, ...rest }: BreadcrumbItemProps) {
  return (
    <li
      className={cn(
        "nise-breadcrumb__item inline-flex items-center gap-[var(--breadcrumb-gap)]",
        className,
      )}
      {...rest}
    />
  );
}

export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ className, children, ...rest }, ref) {
    return (
      <a
        ref={ref}
        className={cn(
          "nise-breadcrumb__link text-text-muted no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-base-content hover:underline",
          className,
        )}
        {...rest}
      >
        {children}
      </a>
    );
  },
);

export type BreadcrumbPageProps = HTMLAttributes<HTMLSpanElement>;

export function BreadcrumbPage({ className, children, ...rest }: BreadcrumbPageProps) {
  return (
    <span
      className={cn(
        "nise-breadcrumb__page font-[var(--font-weight-medium)] text-base-content",
        className,
      )}
      aria-current="page"
      {...rest}
    >
      {children}
    </span>
  );
}

export type BreadcrumbSeparatorProps = HTMLAttributes<HTMLLIElement>;

export function BreadcrumbSeparator({
  className,
  children,
  ...rest
}: BreadcrumbSeparatorProps) {
  return (
    <li
      className={cn(
        "nise-breadcrumb__separator inline-flex items-center text-text-muted",
        className,
      )}
      aria-hidden="true"
      role="presentation"
      {...rest}
    >
      {children ?? <ChevronRightIcon size={16} />}
    </li>
  );
}

export type BreadcrumbEllipsisProps = HTMLAttributes<HTMLSpanElement>;

export function BreadcrumbEllipsis({
  className,
  children,
  ...rest
}: BreadcrumbEllipsisProps) {
  return (
    <span
      className={cn(
        "nise-breadcrumb__ellipsis inline-flex items-center justify-center text-text-muted",
        className,
      )}
      aria-hidden="true"
      {...rest}
    >
      {children ?? "…"}
    </span>
  );
}

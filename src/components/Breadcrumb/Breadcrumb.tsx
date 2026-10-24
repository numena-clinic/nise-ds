/* =============================================================================
   Breadcrumb
   -----------------------------------------------------------------------------
   The path trail above a page: where the clinician is and how to get back. It
   is pure navigation — every part is a link, a marker or a separator, and no
   part is an action. The current page is marked with `aria-current="page"` so
   assistive tech reads where the trail ends without colour or italics doing
   the work.

   It is composable, in the shape Radix established (D6: no extra dependency
   here): Breadcrumb (nav) > BreadcrumbList (ol) > BreadcrumbItem (li) with
   BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator and BreadcrumbEllipsis
   along the trail.

   Tokens consumed:
      --breadcrumb-gap, --breadcrumb-font-size → --space-2, --font-size-sm
      --color-text-muted, --color-base-content
   ============================================================================= */

import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { ChevronRightIcon } from "../../icons";
import "./Breadcrumb.css";

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
  const classes = ["nise-breadcrumb", className].filter(Boolean).join(" ");
  return (
    <nav className={classes} aria-label={ariaLabel} {...rest}>
      {children}
    </nav>
  );
}

export type BreadcrumbListProps = HTMLAttributes<HTMLOListElement>;

export function BreadcrumbList({ className, ...rest }: BreadcrumbListProps) {
  const classes = ["nise-breadcrumb__list", className].filter(Boolean).join(" ");
  return <ol className={classes} {...rest} />;
}

export type BreadcrumbItemProps = HTMLAttributes<HTMLLIElement>;

export function BreadcrumbItem({ className, ...rest }: BreadcrumbItemProps) {
  const classes = ["nise-breadcrumb__item", className].filter(Boolean).join(" ");
  return <li className={classes} {...rest} />;
}

export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ className, children, ...rest }, ref) {
    const classes = ["nise-breadcrumb__link", className].filter(Boolean).join(" ");
    return (
      <a ref={ref} className={classes} {...rest}>
        {children}
      </a>
    );
  },
);

export type BreadcrumbPageProps = HTMLAttributes<HTMLSpanElement>;

export function BreadcrumbPage({ className, children, ...rest }: BreadcrumbPageProps) {
  const classes = ["nise-breadcrumb__page", className].filter(Boolean).join(" ");
  return (
    <span className={classes} aria-current="page" {...rest}>
      {children}
    </span>
  );
}

export type BreadcrumbSeparatorProps = HTMLAttributes<HTMLLIElement>;

export function BreadcrumbSeparator({ className, children, ...rest }: BreadcrumbSeparatorProps) {
  const classes = ["nise-breadcrumb__separator", className].filter(Boolean).join(" ");
  return (
    <li className={classes} aria-hidden="true" role="presentation" {...rest}>
      {children ?? <ChevronRightIcon size={16} />}
    </li>
  );
}

export type BreadcrumbEllipsisProps = HTMLAttributes<HTMLSpanElement>;

export function BreadcrumbEllipsis({ className, children, ...rest }: BreadcrumbEllipsisProps) {
  const classes = ["nise-breadcrumb__ellipsis", className].filter(Boolean).join(" ");
  return (
    <span className={classes} aria-hidden="true" {...rest}>
      {children ?? "…"}
    </span>
  );
}

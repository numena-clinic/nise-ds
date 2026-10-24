/* =============================================================================
   Nise Design System — icons
   -----------------------------------------------------------------------------
   A deliberately small set drawn on the Iconoir grid that the brand uses
   (iconography.md §3): a 24 px frame, a 1.5 px stroke, regular outline only, no
   fills. This is the seed of an icon system, not a catalogue — add a glyph when
   a component needs one, keep it on the grid, and never mix in a filled or
   duotone form.

   Sizing follows iconography.md §3 exactly: four sizes only — 16, 20, 24
   (default), 32 — the 16 px size takes a heavier 1.75 stroke so line weight
   stays steady, every other size takes 1.5. The `size` prop is typed to those
   four values so an off-scale icon is a type error, not a review comment.

   Icons inherit `currentColor` (iconography.md §4), so an icon can never
   disagree with the text or control it sits in.

   Colour carries no verdict: no check marks, crosses or traffic-light metaphors
   on clinical content; a check is reserved for a system state such as "saved"
   (iconography.md §5). The one check here is the Select's selected-option mark.
   ============================================================================= */

import type { ReactNode, SVGProps } from "react";

/** The four sizes the brand allows (iconography.md §3). */
export type IconSize = 16 | 20 | 24 | 32;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** Accessible name. Omit to render the icon as decorative (aria-hidden). */
  title?: string;
  /** One of the four allowed sizes. Defaults to 24. */
  size?: IconSize;
  children?: ReactNode;
}

/** Base frame every icon is drawn inside. */
export function Icon({ title, size = 24, children, ...rest }: IconProps) {
  const labelled = title !== undefined;
  // A scaled SVG scales its stroke, so the smallest size is firmed up to keep a
  // steady line weight (iconography.md §3).
  const strokeWidth = size === 16 ? 1.75 : 1.5;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...rest}
    >
      {labelled ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </Icon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 6l-6 6 6 6" />
    </Icon>
  );
}

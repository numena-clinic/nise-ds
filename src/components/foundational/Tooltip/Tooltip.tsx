/* =============================================================================
   Tooltip
   -----------------------------------------------------------------------------
   Base UI tooltip. Supplemental information appears on hover or keyboard focus.
   Base UI owns timing, Escape and trigger-description association.
   Tokens: --tooltip-*, semantic surface/content and border roles.
   ============================================================================= */

import {
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "../../../lib/cn";

export function TooltipProvider({
  delayDuration = 700,
  children,
}: {
  delayDuration?: number;
  children?: ReactNode;
}) {
  return <BaseTooltip.Provider delay={delayDuration}>{children}</BaseTooltip.Provider>;
}

export interface TooltipRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function TooltipRoot({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: TooltipRootProps) {
  return (
    <BaseTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {children}
    </BaseTooltip.Root>
  );
}

export interface TooltipTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  asChild?: boolean;
  disabled?: boolean;
}

export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  function TooltipTrigger({ asChild, children, className, ...props }, ref) {
    if (asChild && isValidElement(children)) {
      return (
        <BaseTooltip.Trigger
          {...props}
          ref={ref}
          className={className}
          render={children as ReactElement}
        />
      );
    }
    return (
      <BaseTooltip.Trigger {...props} ref={ref} className={className}>
        {children}
      </BaseTooltip.Trigger>
    );
  },
);

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  container?: HTMLElement | null;
  sideOffset?: number;
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(
    { container, sideOffset = 8, className, children, ...props },
    ref,
  ) {
    return (
      <BaseTooltip.Portal container={container}>
        <BaseTooltip.Positioner sideOffset={sideOffset} className="z-50 outline-none">
          <BaseTooltip.Popup
            {...props}
            ref={ref}
            role="tooltip"
            className={cn(
              "nise-tooltip__content inline-flex items-center gap-[var(--tooltip-gap)] px-[var(--tooltip-padding-x)] py-[var(--tooltip-padding-y)] font-sans text-[length:var(--tooltip-font-size)] leading-[var(--line-height-snug)] text-neutral-content bg-neutral rounded-[var(--tooltip-radius,var(--radius-md))] shadow-[var(--shadow-sm)] max-w-[var(--measure-form)] transition-[opacity,scale] duration-[var(--duration-fast)] ease-[var(--ease-entrance)] data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
              className,
            )}
          >
            {children}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    );
  },
);

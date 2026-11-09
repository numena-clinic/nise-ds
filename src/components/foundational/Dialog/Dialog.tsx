/* =============================================================================
   Dialog
   -----------------------------------------------------------------------------
   Base UI modal composition. Focus containment, Escape, dismissal and trigger
   restoration belong to Base UI. Tokens: --dialog-* and semantic surface/scrim/
   focus roles.
   ============================================================================= */

import {
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "../../../lib/cn";

export interface DialogRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: DialogRootProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {children}
    </BaseDialog.Root>
  );
}

type ActionProps = Omit<HTMLAttributes<HTMLButtonElement>, "className"> & {
  asChild?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
};

export const DialogTrigger = forwardRef<HTMLButtonElement, ActionProps>(
  function DialogTrigger({ asChild, children, className, ...props }, ref) {
    if (asChild && isValidElement(children)) {
      return (
        <BaseDialog.Trigger
          {...props}
          ref={ref}
          className={className}
          render={children as ReactElement}
        />
      );
    }
    return (
      <BaseDialog.Trigger {...props} ref={ref} className={className}>
        {children}
      </BaseDialog.Trigger>
    );
  },
);

export const DialogClose = forwardRef<HTMLButtonElement, ActionProps>(
  function DialogClose({ asChild, children, className, ...props }, ref) {
    if (asChild && isValidElement(children)) {
      return (
        <BaseDialog.Close
          {...props}
          ref={ref}
          className={className}
          render={children as ReactElement}
        />
      );
    }
    return (
      <BaseDialog.Close {...props} ref={ref} className={className}>
        {children}
      </BaseDialog.Close>
    );
  },
);

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  container?: HTMLElement | null;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ container, className, children, ...props }, ref) {
    return (
      <BaseDialog.Portal container={container}>
        <BaseDialog.Backdrop className="nise-dialog__overlay fixed inset-0 z-50 bg-scrim transition-opacity duration-[var(--duration-medium)] ease-[var(--ease-standard)] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <BaseDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-[var(--space-4)]">
          <BaseDialog.Popup
            {...props}
            ref={ref}
            className={cn(
              "nise-dialog__content relative flex flex-col gap-[var(--dialog-gap)] w-full max-w-[var(--dialog-width)] p-[var(--dialog-padding)] bg-base-100 text-base-content border border-solid border-border rounded-[var(--dialog-radius,var(--radius-xl))] shadow-[var(--shadow-md)] outline-none transition-[opacity,scale] duration-[var(--duration-medium)] ease-[var(--ease-entrance)] data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
              className,
            )}
          >
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    );
  },
);

export function DialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("nise-dialog__header flex flex-col gap-[var(--space-2)]", className)}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "nise-dialog__footer flex items-center justify-end gap-[var(--space-3)] pt-[var(--space-2)]",
        className,
      )}
    />
  );
}

export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <BaseDialog.Title
      {...props}
      ref={ref}
      className={cn(
        "nise-dialog__title m-0 font-serif text-[length:var(--font-size-xl)] font-[var(--font-weight-semibold)] leading-[var(--line-height-tight)] text-base-content",
        className,
      )}
    />
  );
});

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <BaseDialog.Description
      {...props}
      ref={ref}
      className={cn(
        "nise-dialog__description m-0 font-sans text-[length:var(--font-size-sm)] leading-[var(--line-height-normal)] text-text-muted",
        className,
      )}
    />
  );
});

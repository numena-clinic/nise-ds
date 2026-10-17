/* =============================================================================
   Dialog
   -----------------------------------------------------------------------------
   A Radix-backed modal. Focus is trapped, ESC closes, the overlay dims the
   background, and the title+description are associated for screen readers (D6).
   The dialog must be labelled by a `DialogTitle`. `container` lets a scoped
   theme (the Theme Explorer preview) keep the popup inside its wrapper.

   Tokens consumed: --dialog-padding, --dialog-gap, --dialog-width, plus
   surface/border/shadow primitives.
   ============================================================================= */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import "./Dialog.css";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentProps<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={["nise-dialog__overlay", className].filter(Boolean).join(" ")}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  /** Where to mount the popup. Point it at a scoped theme wrapper, if any. */
  container?: React.ComponentProps<typeof DialogPrimitive.Portal>["container"];
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, container, ...props }, ref) => (
  <DialogPrimitive.Portal container={container}>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={["nise-dialog__content", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["nise-dialog__header", className].filter(Boolean).join(" ")} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["nise-dialog__footer", className].filter(Boolean).join(" ")} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentProps<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={["nise-dialog__title", className].filter(Boolean).join(" ")}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentProps<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={["nise-dialog__description", className].filter(Boolean).join(" ")}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};

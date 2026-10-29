/** React Aria modal composition. Focus containment, Escape, dismissal and
 * trigger restoration belong to React Aria. Tokens: --dialog-* and semantic
 * surface/scrim/focus roles. Heading/Text slots wire accessible relationships.
 * The asChild adapter preserves Nise's existing button composition API. */
import {
  cloneElement,
  forwardRef,
  isValidElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type Dispatch,
  type SetStateAction,
  type HTMLAttributes,
  type ReactElement,
  type ButtonHTMLAttributes,
} from "react";
import {
  DialogTrigger as AriaDialogTrigger,
  Dialog as AriaDialog,
  ModalOverlay,
  Modal,
  Button,
  Heading,
  Text,
  type DialogTriggerProps,
  type DialogProps,
  type ButtonProps,
} from "react-aria-components";
import "./Dialog.css";
const DescriptionContext = createContext<Dispatch<
  SetStateAction<string | undefined>
> | null>(null);
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: Omit<DialogTriggerProps, "isOpen" | "defaultOpen"> & {
  open?: boolean;
  defaultOpen?: boolean;
}) {
  return (
    <AriaDialogTrigger
      {...props}
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    />
  );
}
type ActionProps = Omit<ButtonProps, "children" | "className"> & {
  asChild?: boolean;
  children?: React.ReactNode;
  className?: string;
};
function renderChild(
  child: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>,
  domProps: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return cloneElement(child, {
    ...domProps,
    onClick: (event) => {
      child.props.onClick?.(event);
      if (!event.defaultPrevented) domProps.onClick?.(event);
    },
  });
}
export const DialogTrigger = forwardRef<HTMLButtonElement, ActionProps>(
  function DialogTrigger({ asChild, children, ...props }, ref) {
    return (
      <Button
        {...props}
        ref={ref}
        render={
          asChild &&
          isValidElement<ButtonHTMLAttributes<HTMLButtonElement>>(children)
            ? (domProps) => renderChild(children, domProps)
            : undefined
        }
      >
        {asChild &&
        isValidElement<ButtonHTMLAttributes<HTMLButtonElement>>(children)
          ? children.props.children
          : children}
      </Button>
    );
  },
);
export const DialogClose = forwardRef<HTMLButtonElement, ActionProps>(
  function DialogClose({ asChild, children, ...props }, ref) {
    return (
      <Button
        {...props}
        slot="close"
        ref={ref}
        render={
          asChild &&
          isValidElement<ButtonHTMLAttributes<HTMLButtonElement>>(children)
            ? (domProps) => renderChild(children, domProps)
            : undefined
        }
      >
        {asChild &&
        isValidElement<ButtonHTMLAttributes<HTMLButtonElement>>(children)
          ? children.props.children
          : children}
      </Button>
    );
  },
);
export interface DialogContentProps extends DialogProps {
  container?: Element | null;
}
export const DialogContent = forwardRef<HTMLElement, DialogContentProps>(
  function DialogContent({ container, className, ...props }, ref) {
    const [descriptionId, setDescriptionId] = useState<string>();
    return (
      <DescriptionContext.Provider value={setDescriptionId}>
        <ModalOverlay
          isDismissable
          UNSTABLE_portalContainer={container ?? undefined}
          className="nise-dialog__overlay"
        >
          <Modal className="nise-dialog__modal">
            <AriaDialog
              aria-describedby={descriptionId}
              {...props}
              ref={ref}
              className={["nise-dialog__content", className]
                .filter(Boolean)
                .join(" ")}
            />
          </Modal>
        </ModalOverlay>
      </DescriptionContext.Provider>
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
      className={["nise-dialog__header", className].filter(Boolean).join(" ")}
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
      className={["nise-dialog__footer", className].filter(Boolean).join(" ")}
    />
  );
}
export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <Heading
      {...props}
      ref={ref}
      slot="title"
      className={["nise-dialog__title", className].filter(Boolean).join(" ")}
    />
  );
});
export const DialogDescription = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement>
>(function DialogDescription({ className, id: suppliedId, ...props }, ref) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const register = useContext(DescriptionContext);
  useEffect(() => {
    register?.(id);
    return () => register?.(undefined);
  }, [id, register]);
  return (
    <Text
      {...props}
      id={id}
      ref={ref}
      slot="description"
      className={["nise-dialog__description", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
});

/** React Aria tooltip. Supplemental information appears on hover or keyboard
 * focus. React Aria owns timing, Escape and trigger-description association.
 * Tokens: --tooltip-*, semantic surface/content and border roles. */
import {
  createContext,
  useContext,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import {
  TooltipTrigger as AriaTooltipTrigger,
  Tooltip as AriaTooltip,
  Button,
  type TooltipProps,
  type TooltipTriggerComponentProps,
  type ButtonProps,
} from "react-aria-components";
import "./Tooltip.css";
const DelayContext = createContext(700);
export function TooltipProvider({
  delayDuration = 700,
  children,
}: {
  delayDuration?: number;
  children?: ReactNode;
}) {
  return (
    <DelayContext.Provider value={delayDuration}>
      {children}
    </DelayContext.Provider>
  );
}
export function TooltipRoot(
  props: Omit<TooltipTriggerComponentProps, "delay">,
) {
  const delay = useContext(DelayContext);
  return <AriaTooltipTrigger {...props} delay={delay} />;
}
export const TooltipTrigger = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "children"> & { children?: ReactNode; asChild?: boolean }
>(function TooltipTrigger({ asChild, children, ...props }, ref) {
  return (
    <Button
      {...props}
      ref={ref}
      render={
        asChild &&
        isValidElement<ButtonHTMLAttributes<HTMLButtonElement>>(children)
          ? (domProps) => cloneElement(children, domProps)
          : undefined
      }
    >
      {asChild &&
      isValidElement<ButtonHTMLAttributes<HTMLButtonElement>>(children)
        ? children.props.children
        : children}
    </Button>
  );
});
export interface TooltipContentProps extends Omit<TooltipProps, "className"> {
  className?: string;
  container?: Element | null;
  sideOffset?: number;
}
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(
    { container, sideOffset = 8, className, ...props },
    ref,
  ) {
    return (
      <AriaTooltip
        {...props}
        ref={ref}
        offset={sideOffset}
        UNSTABLE_portalContainer={container ?? undefined}
        className={["nise-tooltip__content", className]
          .filter(Boolean)
          .join(" ")}
      />
    );
  },
);

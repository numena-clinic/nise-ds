/* =============================================================================
   Tabs
   -----------------------------------------------------------------------------
   Nise tabs over Base UI. Tokens: --tabs-gap, --tab-height, --tab-padding-x and
   semantic surface/focus roles. Base UI owns selection, roving focus and panel
   relationships; Nise retains its value-based API and animated indicator.
   ============================================================================= */

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "../../../lib/cn";

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  return (
    <BaseTabs.Root
      {...props}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(val) => {
        if (val != null) onValueChange?.(String(val));
      }}
      className={cn("nise-tabs flex flex-col gap-[var(--space-4)] font-sans", className)}
    >
      {children}
    </BaseTabs.Root>
  );
}

export const TabsList = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function TabsList({ className, children, ...props }, ref) {
  return (
    <BaseTabs.List
      {...props}
      ref={ref}
      activateOnFocus
      className={cn(
        "nise-tabs__list relative inline-flex items-center gap-[var(--tabs-gap)] p-[var(--space-1)] bg-base-200 border border-solid border-border rounded-[var(--radius-lg)] w-fit max-w-full overflow-x-auto",
        className,
      )}
    >
      {children}
      <BaseTabs.Indicator
        className="nise-tabs__indicator absolute left-0 top-0 z-0 h-[var(--active-tab-height)] w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] translate-y-[var(--active-tab-top)] rounded-[var(--tab-radius,var(--radius-md))] bg-base-100 shadow-[var(--shadow-sm)] border border-solid border-border pointer-events-none transition-[translate,width,height] duration-[var(--duration-medium)] ease-[var(--ease-standard)] motion-reduce:transition-none"
        aria-hidden="true"
      />
    </BaseTabs.List>
  );
});

export interface TabsTriggerProps extends Omit<HTMLAttributes<HTMLButtonElement>, "id"> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ value, disabled, className, children, ...props }, ref) {
    return (
      <BaseTabs.Tab
        {...props}
        value={value}
        disabled={disabled}
        ref={ref}
        className={cn(
          "nise-tabs__trigger relative z-10 inline-flex items-center justify-center h-[var(--tab-height)] px-[var(--tab-padding-x)] font-sans text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] text-text-muted rounded-[var(--tab-radius,var(--radius-md))] bg-transparent border-none cursor-pointer select-none whitespace-nowrap transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:not-disabled:text-base-content data-[active]:text-base-content disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed",
          className,
        )}
      >
        <span className="relative z-10">{children}</span>
      </BaseTabs.Tab>
    );
  },
);

export interface TabsContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "id"> {
  value: string;
  children?: ReactNode;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ value, className, children, ...props }, ref) {
    return (
      <BaseTabs.Panel
        {...props}
        value={value}
        ref={ref}
        className={cn("nise-tabs__content text-base-content outline-none", className)}
      >
        {children}
      </BaseTabs.Panel>
    );
  },
);

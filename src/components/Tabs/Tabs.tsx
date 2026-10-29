/** Nise tabs over React Aria. Tokens: --tabs-gap, --tab-height,
 * --tab-padding-x and semantic surface/focus roles. React Aria owns selection,
 * roving focus and panel relationships; Nise retains its value-based API. */
import { forwardRef } from "react";
import {
  Tabs as AriaTabs,
  TabList,
  Tab,
  TabPanel,
  SelectionIndicator,
  composeRenderProps,
  type TabsProps,
  type TabListProps,
  type TabProps,
  type TabPanelProps,
} from "react-aria-components";
import "./Tabs.css";
export function Tabs({
  value,
  defaultValue,
  onValueChange,
  ...props
}: Omit<
  TabsProps,
  "selectedKey" | "defaultSelectedKey" | "onSelectionChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <AriaTabs
      {...props}
      selectedKey={value}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(key) => onValueChange?.(String(key))}
    />
  );
}
export const TabsList = forwardRef<
  HTMLDivElement,
  Omit<TabListProps<object>, "className"> & { className?: string }
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabList
      {...props}
      ref={ref}
      className={["nise-tabs__list", className].filter(Boolean).join(" ")}
    />
  );
});
export const TabsTrigger = forwardRef<
  HTMLDivElement,
  Omit<TabProps, "id" | "className"> & {
    value: string;
    disabled?: boolean;
    className?: string;
  }
>(function TabsTrigger(
  { value, disabled, className, children, ...props },
  ref,
) {
  return (
    <Tab
      {...props}
      id={value}
      isDisabled={disabled}
      ref={ref}
      className={["nise-tabs__trigger", className].filter(Boolean).join(" ")}
    >
      {composeRenderProps(children, (content) => (
        <>
          <SelectionIndicator
            className="nise-tabs__indicator"
            aria-hidden="true"
          />
          {content}
        </>
      ))}
    </Tab>
  );
});
export const TabsContent = forwardRef<
  HTMLDivElement,
  Omit<TabPanelProps, "id" | "className"> & {
    value: string;
    className?: string;
  }
>(function TabsContent({ value, className, ...props }, ref) {
  return (
    <TabPanel
      {...props}
      id={value}
      ref={ref}
      className={["nise-tabs__content", className].filter(Boolean).join(" ")}
    />
  );
});

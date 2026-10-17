/* Nise Design System — public surface.
   Import components from the package root so a future move to separate entry
   points does not change call sites. */

export { Button } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button";

export { TextField } from "./components/TextField";
export type { TextFieldProps } from "./components/TextField";

export { Select } from "./components/Select";
export type { SelectProps, SelectOption } from "./components/Select";

export { Badge } from "./components/Badge";
export type { BadgeProps, BadgeTone, BadgeSize } from "./components/Badge";

export { Checkbox } from "./components/Checkbox";
export type { CheckboxProps } from "./components/Checkbox";

export { Radio } from "./components/Radio";
export type { RadioProps } from "./components/Radio";

export { Switch } from "./components/Switch";
export type { SwitchProps } from "./components/Switch";

export { Slider } from "./components/Slider";
export type { SliderProps } from "./components/Slider";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/Tabs";
export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "./components/Tooltip";
export type { TooltipContentProps } from "./components/Tooltip";
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./components/Dialog";
export type { DialogContentProps } from "./components/Dialog";

export { Table } from "./components/Table";
export type { TableProps, TableRow } from "./components/Table";

export { Card } from "./components/Card";
export type { CardProps } from "./components/Card";

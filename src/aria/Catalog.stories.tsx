import type { Meta, StoryObj } from "@storybook/react-vite";
import { AriaCatalog, CatalogExample } from "./Catalog";
import { AriaScope } from "./index";

const meta = {
  title: "React Aria/Catalog",
  component: CatalogExample,
  tags: ["autodocs"],
  parameters: { layout: "padded", chromatic: { viewports: [390, 1440] } },
} satisfies Meta<typeof CatalogExample>;
export default meta;
export const ScopedTheme = {
  render: () => (
    <AriaScope data-theme="dark">
      <CatalogExample family="Popover" />
    </AriaScope>
  ),
};
type Story = StoryObj<typeof meta>;
export const AllComponents = {
  render: () => <AriaCatalog />,
  parameters: { layout: "fullscreen" },
};
export const DarkCatalog = { ...AllComponents, globals: { theme: "dark" } };
export const Autocomplete: Story = { args: { family: "Autocomplete" } };
export const Breadcrumbs: Story = { args: { family: "Breadcrumbs" } };
export const Button: Story = { args: { family: "Button" } };
export const Calendar: Story = { args: { family: "Calendar" } };
export const Checkbox: Story = { args: { family: "Checkbox" } };
export const CheckboxGroup: Story = { args: { family: "CheckboxGroup" } };
export const ColorArea: Story = { args: { family: "ColorArea" } };
export const ColorField: Story = { args: { family: "ColorField" } };
export const ColorPicker: Story = { args: { family: "ColorPicker" } };
export const ColorSlider: Story = { args: { family: "ColorSlider" } };
export const ColorSwatch: Story = { args: { family: "ColorSwatch" } };
export const ColorSwatchPicker: Story = {
  args: { family: "ColorSwatchPicker" },
};
export const ColorWheel: Story = { args: { family: "ColorWheel" } };
export const ComboBox: Story = { args: { family: "ComboBox" } };
export const DateField: Story = { args: { family: "DateField" } };
export const DatePicker: Story = { args: { family: "DatePicker" } };
export const DateRangePicker: Story = { args: { family: "DateRangePicker" } };
export const Dialog: Story = { args: { family: "Dialog" } };
export const Disclosure: Story = { args: { family: "Disclosure" } };
export const DisclosureGroup: Story = { args: { family: "DisclosureGroup" } };
export const DropZone: Story = { args: { family: "DropZone" } };
export const FileTrigger: Story = { args: { family: "FileTrigger" } };
export const Form: Story = { args: { family: "Form" } };
export const GridList: Story = { args: { family: "GridList" } };
export const Group: Story = { args: { family: "Group" } };
export const Link: Story = { args: { family: "Link" } };
export const ListBox: Story = { args: { family: "ListBox" } };
export const Menu: Story = { args: { family: "Menu" } };
export const Meter: Story = { args: { family: "Meter" } };
export const Modal: Story = { args: { family: "Modal" } };
export const NavigationTree: Story = { args: { family: "NavigationTree" } };
export const NumberField: Story = { args: { family: "NumberField" } };
export const Popover: Story = { args: { family: "Popover" } };
export const PreviewTrigger: Story = { args: { family: "PreviewTrigger" } };
export const ProgressBar: Story = { args: { family: "ProgressBar" } };
export const RadioGroup: Story = { args: { family: "RadioGroup" } };
export const RangeCalendar: Story = { args: { family: "RangeCalendar" } };
export const SearchField: Story = { args: { family: "SearchField" } };
export const Select: Story = { args: { family: "Select" } };
export const Separator: Story = { args: { family: "Separator" } };
export const Sheet: Story = { args: { family: "Sheet" } };
export const Slider: Story = { args: { family: "Slider" } };
export const Switch: Story = { args: { family: "Switch" } };
export const Table: Story = { args: { family: "Table" } };
export const Tabs: Story = { args: { family: "Tabs" } };
export const TagGroup: Story = { args: { family: "TagGroup" } };
export const TextField: Story = { args: { family: "TextField" } };
export const TimeField: Story = { args: { family: "TimeField" } };
export const Toast: Story = { args: { family: "Toast" } };
export const ToggleButton: Story = { args: { family: "ToggleButton" } };
export const ToggleButtonGroup: Story = {
  args: { family: "ToggleButtonGroup" },
};
export const TokenField: Story = { args: { family: "TokenField" } };
export const Toolbar: Story = { args: { family: "Toolbar" } };
export const Tooltip: Story = { args: { family: "Tooltip" } };
export const Tree: Story = { args: { family: "Tree" } };
export const Virtualizer: Story = { args: { family: "Virtualizer" } };
export const DragAndDrop: Story = { args: { family: "DragAndDrop" } };

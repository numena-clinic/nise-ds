/** Executable catalog recipes. Synthetic data only; upstream owns interaction.
 * Dates use ISO strings parsed by @internationalized/date. Color sample values
 * are read from the authored brand anchors rather than a second palette. */
import { useState } from "react";
import type { ReactNode } from "react";
import { parseDate, parseTime } from "@internationalized/date";
import { Aria as A } from "./index";

const options = ["Observation", "Client report", "Working hypothesis"];
const items = options.map((name, id) => ({ id: String(id), name }));
const day = parseDate("2026-10-28");

const choices = items.map((item) => (
  <A.ListBoxItem id={item.id} key={item.id}>
    {item.name}
  </A.ListBoxItem>
));
function CalendarGrid() {
  return (
    <>
      <header className="nise-aria__calendar-header">
        <A.Button slot="previous" aria-label="Previous month">
          ←
        </A.Button>
        <A.Heading />
        <A.Button slot="next" aria-label="Next month">
          →
        </A.Button>
      </header>
      <A.CalendarGrid>
        <A.CalendarGridHeader>
          {(day) => <A.CalendarHeaderCell>{day}</A.CalendarHeaderCell>}
        </A.CalendarGridHeader>
        <A.CalendarGridBody>
          {(date) => <A.CalendarCell date={date} />}
        </A.CalendarGridBody>
      </A.CalendarGrid>
    </>
  );
}
function DateSegments() {
  return (
    <A.DateInput>
      {(segment) => <A.DateSegment segment={segment} />}
    </A.DateInput>
  );
}
function DisclosureItem({ title }: { title: string }) {
  return (
    <A.Disclosure>
      <A.Heading level={3}>
        <A.Button slot="trigger">{title}</A.Button>
      </A.Heading>
      <A.DisclosurePanel>
        Record the source and keep interpretation separate from observation.
      </A.DisclosurePanel>
    </A.Disclosure>
  );
}
function Check({ children, value }: { children: ReactNode; value?: string }) {
  return (
    <A.Checkbox value={value}>
      {({ isSelected, isIndeterminate }) => (
        <>
          <span className="nise-aria__indicator" aria-hidden="true">
            {isIndeterminate ? "−" : isSelected ? "✓" : ""}
          </span>
          {children}
        </>
      )}
    </A.Checkbox>
  );
}
function ToggleSwitch() {
  return (
    <A.Switch>
      <span className="nise-aria__indicator" aria-hidden="true" />
      Notifications
    </A.Switch>
  );
}
function Range() {
  return (
    <A.Slider defaultValue={[20, 70]}>
      <A.Label>Duration range</A.Label>
      <A.SliderOutput>{({ state }) => state.values.join(" – ")}</A.SliderOutput>
      <A.SliderTrack>
        <A.SliderFill />
        <A.SliderThumb index={0} aria-label="Minimum duration" />
        <A.SliderThumb index={1} aria-label="Maximum duration" />
      </A.SliderTrack>
    </A.Slider>
  );
}
function Progress({ meter = false }: { meter?: boolean }) {
  const Component = meter ? A.Meter : A.ProgressBar;
  return (
    <Component value={60}>
      <A.Label>{meter ? "Storage used" : "Export progress"}</A.Label>
      <span>60%</span>
      <div className="nise-aria__bar">
        <div className="nise-aria__fill" style={{ width: "60%" }} />
      </div>
    </Component>
  );
}
function DialogContent() {
  return (
    <A.Dialog>
      <A.Heading slot="title">Review sources</A.Heading>
      <p>This is a fictional catalog example.</p>
      <A.Button slot="close">Close review</A.Button>
    </A.Dialog>
  );
}
function Tags() {
  const [tags, setTags] = useState(items);
  return (
    <A.TagGroup
      onRemove={(keys) => setTags(tags.filter((tag) => !keys.has(tag.id)))}
    >
      <A.Label>Sources</A.Label>
      <A.TagList items={tags}>
        {(tag) => (
          <A.Tag id={tag.id} textValue={tag.name}>
            {tag.name}
            <A.Button slot="remove" aria-label={`Remove ${tag.name}`}>
              ×
            </A.Button>
          </A.Tag>
        )}
      </A.TagList>
    </A.TagGroup>
  );
}
function Upload({ drop = false }: { drop?: boolean }) {
  const [name, setName] = useState("No file selected");
  const trigger = (
    <A.FileTrigger
      onSelect={(files) => setName(files?.[0]?.name ?? "No file selected")}
    >
      <A.Button>Choose a file</A.Button>
    </A.FileTrigger>
  );
  return (
    <>
      {drop ? (
        <A.DropZone
          aria-label="Upload source"
          onDrop={(event) => setName(`${event.items.length} item(s) dropped`)}
        >
          <p>Drop a source file</p>
          {trigger}
        </A.DropZone>
      ) : (
        trigger
      )}
      <p role="status">{name}</p>
    </>
  );
}
function FormExample() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <A.Form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <A.TextField name="email" type="email" isRequired>
        <A.Label>Work email</A.Label>
        <A.Input />
        <div className="nise-aria__error">
          <A.FieldError />
        </div>
      </A.TextField>
      <A.Button type="submit">Subscribe</A.Button>
      {submitted && <p role="status">Submitted locally. Nothing was sent.</p>}
    </A.Form>
  );
}
function AutocompleteExample() {
  const { contains } = A.useFilter({ sensitivity: "base" });
  return (
    <A.Autocomplete filter={contains}>
      <A.SearchField>
        <A.Label>Filter sources</A.Label>
        <A.Input />
      </A.SearchField>
      <A.ListBox
        aria-label="Filtered sources"
        selectionMode="single"
        items={items}
      >
        {(item) => <A.ListBoxItem>{item.name}</A.ListBoxItem>}
      </A.ListBox>
    </A.Autocomplete>
  );
}
function TableExample() {
  return (
    <A.Table aria-label="Source register" selectionMode="single">
      <A.TableHeader>
        <A.Column id="source" isRowHeader>
          Source
        </A.Column>
        <A.Column id="state">State</A.Column>
      </A.TableHeader>
      <A.TableBody>
        <A.Row id="report">
          <A.Cell>Client report</A.Cell>
          <A.Cell>Reviewed</A.Cell>
        </A.Row>
        <A.Row id="note">
          <A.Cell>Session note</A.Cell>
          <A.Cell>Draft</A.Cell>
        </A.Row>
      </A.TableBody>
    </A.Table>
  );
}
function TreeExample() {
  return (
    <A.Tree aria-label="Source folders" selectionMode="single">
      <A.TreeItem id="sessions" textValue="Sessions">
        <A.TreeItemContent>
          <A.Button slot="chevron" aria-label="Toggle Sessions">
            ›
          </A.Button>
          <A.Text slot="label">Sessions</A.Text>
        </A.TreeItemContent>
        <A.TreeItem id="october" textValue="October">
          <A.TreeItemContent>
            <A.Text slot="label">October</A.Text>
          </A.TreeItemContent>
        </A.TreeItem>
      </A.TreeItem>
    </A.Tree>
  );
}
function NavigationExample() {
  return (
    <A.NavigationTree
      aria-label="Documentation"
      selectedRoute="#overview"
      defaultExpandedKeys={["guide"]}
    >
      <A.NavigationTreeItem id="guide" textValue="Guide">
        <A.NavigationTreeItemContent>
          <A.Button slot="chevron" aria-label="Toggle Guide">
            ›
          </A.Button>
          <A.Text slot="label">Guide</A.Text>
        </A.NavigationTreeItemContent>
        <A.NavigationTreeItem
          id="overview"
          href="#overview"
          textValue="Overview"
        >
          <A.NavigationTreeItemContent>
            <A.Text slot="label">Overview</A.Text>
          </A.NavigationTreeItemContent>
        </A.NavigationTreeItem>
      </A.NavigationTreeItem>
    </A.NavigationTree>
  );
}
function TokenExample() {
  return (
    <A.TokenField
      defaultValue={
        new A.TokenFieldValue([
          { type: "text", text: "Review " },
          { type: "token", text: "Client report", value: "report" },
          { type: "text", text: " " },
        ])
      }
    >
      <A.Label>Structured note</A.Label>
      <A.TokenInput>
        {(segment) => <A.Token>{segment.text}</A.Token>}
      </A.TokenInput>
    </A.TokenField>
  );
}
function ToastExample() {
  const [queue] = useState(
    () => new A.UNSTABLE_ToastQueue<string>({ maxVisibleToasts: 3 }),
  );
  return (
    <>
      <A.Button onPress={() => queue.add("Draft saved locally.")}>
        Show notification
      </A.Button>
      <A.UNSTABLE_ToastRegion queue={queue}>
        {({ toast }) => (
          <A.UNSTABLE_Toast toast={toast}>
            <A.UNSTABLE_ToastContent>
              <A.Text slot="title">{toast.content}</A.Text>
            </A.UNSTABLE_ToastContent>
            <A.Button slot="close" aria-label="Dismiss notification">
              ×
            </A.Button>
          </A.UNSTABLE_Toast>
        )}
      </A.UNSTABLE_ToastRegion>
    </>
  );
}
function ColorExample({ kind }: { kind: string }) {
  // Read on mount in the browser: these are immutable authored hex anchors.
  const [colors] = useState(() =>
    ["--deep-purple", "--vibrant-cyan", "--vibrant-tangerine"].map((token) =>
      getComputedStyle(document.documentElement).getPropertyValue(token).trim(),
    ),
  );
  const color = colors[0]!;
  if (kind === "ColorSwatch") return <A.ColorSwatch color={color} />;
  if (kind === "ColorSwatchPicker")
    return (
      <A.ColorSwatchPicker aria-label="Brand anchor" defaultValue={color}>
        {colors.map((value) => (
          <A.ColorSwatchPickerItem key={value} color={value}>
            <A.ColorSwatch />
          </A.ColorSwatchPickerItem>
        ))}
      </A.ColorSwatchPicker>
    );
  if (kind === "ColorField")
    return (
      <A.ColorField defaultValue={color}>
        <A.Label>Custom color</A.Label>
        <A.Input />
      </A.ColorField>
    );
  if (kind === "ColorArea")
    return (
      <A.ColorArea
        defaultValue={color}
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
      >
        <A.ColorThumb />
      </A.ColorArea>
    );
  if (kind === "ColorWheel")
    return (
      <A.ColorWheel defaultValue={color} outerRadius={96} innerRadius={64}>
        <A.ColorWheelTrack />
        <A.ColorThumb />
      </A.ColorWheel>
    );
  if (kind === "ColorSlider")
    return (
      <A.ColorSlider
        channel="hue"
        defaultValue={A.parseColor(color).toFormat("hsl")}
      >
        <A.Label>Hue</A.Label>
        <A.SliderTrack>
          <A.ColorThumb />
        </A.SliderTrack>
      </A.ColorSlider>
    );
  return (
    <A.ColorPicker defaultValue={color}>
      <A.DialogTrigger>
        <A.Button>
          Choose color <A.ColorSwatch />
        </A.Button>
        <A.Popover>
          <A.Dialog>
            <A.Heading slot="title">Custom color</A.Heading>
            <A.ColorArea
              colorSpace="hsb"
              xChannel="saturation"
              yChannel="brightness"
            >
              <A.ColorThumb />
            </A.ColorArea>
            <A.ColorField>
              <A.Label>Color value</A.Label>
              <A.Input />
            </A.ColorField>
            <A.Button slot="close">Done</A.Button>
          </A.Dialog>
        </A.Popover>
      </A.DialogTrigger>
    </A.ColorPicker>
  );
}
function VirtualizedExample() {
  const rows = Array.from({ length: 1000 }, (_, id) => ({
    id,
    name: `Source ${id + 1}`,
  }));
  return (
    <A.Virtualizer layout={A.ListLayout} layoutOptions={{ rowSize: 44 }}>
      <A.ListBox
        aria-label="Thousand sources"
        items={rows}
        selectionMode="single"
        style={{ height: "16rem", display: "block", padding: 0 }}
      >
        {(row) => (
          <A.ListBoxItem style={{ height: "100%", minHeight: 0 }}>
            {row.name}
          </A.ListBoxItem>
        )}
      </A.ListBox>
    </A.Virtualizer>
  );
}
function DragExample() {
  const list = A.useListData({ initialItems: items });
  const { dragAndDropHooks } = A.useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({ "text/plain": list.getItem(key)!.name })),
    onReorder: (event) => {
      if (event.target.dropPosition === "before")
        list.moveBefore(event.target.key, event.keys);
      else if (event.target.dropPosition === "after")
        list.moveAfter(event.target.key, event.keys);
    },
  });
  return (
    <A.GridList
      aria-label="Reorder sources"
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
      selectionMode="single"
    >
      {(item) => (
        <A.GridListItem textValue={item.name}>
          <A.Button slot="drag" aria-label={`Reorder ${item.name}`}>
            ↕
          </A.Button>
          {item.name}
        </A.GridListItem>
      )}
    </A.GridList>
  );
}

export const examples = {
  Autocomplete: AutocompleteExample,
  Breadcrumbs: () => (
    <A.Breadcrumbs>
      <A.Breadcrumb>
        <A.Link href="#catalog">Catalog</A.Link>
      </A.Breadcrumb>
      <A.Breadcrumb>
        <A.Link>Sources</A.Link>
      </A.Breadcrumb>
    </A.Breadcrumbs>
  ),
  Button: () => {
    const [count, setCount] = useState(0);
    return (
      <A.Button onPress={() => setCount(count + 1)}>
        Pressed {count} times
      </A.Button>
    );
  },
  Calendar: () => (
    <A.Calendar aria-label="Session date" defaultValue={day}>
      <CalendarGrid />
    </A.Calendar>
  ),
  Checkbox: () => <Check>Reviewed source</Check>,
  CheckboxGroup: () => (
    <A.CheckboxGroup>
      <A.Label>Include sources</A.Label>
      <Check value="report">Client report</Check>
      <Check value="note">Session note</Check>
    </A.CheckboxGroup>
  ),
  ColorArea: () => <ColorExample kind="ColorArea" />,
  ColorField: () => <ColorExample kind="ColorField" />,
  ColorPicker: () => <ColorExample kind="ColorPicker" />,
  ColorSlider: () => <ColorExample kind="ColorSlider" />,
  ColorSwatch: () => <ColorExample kind="ColorSwatch" />,
  ColorSwatchPicker: () => <ColorExample kind="ColorSwatchPicker" />,
  ColorWheel: () => <ColorExample kind="ColorWheel" />,
  ComboBox: () => (
    <A.ComboBox<(typeof items)[number]> defaultItems={items}>
      <A.Label>Source type</A.Label>
      <A.Group>
        <A.Input />
        <A.Button aria-label="Show source types">⌄</A.Button>
      </A.Group>
      <A.Popover>
        <A.ListBox<(typeof items)[number]>>
          {(item) => <A.ListBoxItem>{item.name}</A.ListBoxItem>}
        </A.ListBox>
      </A.Popover>
    </A.ComboBox>
  ),
  DateField: () => (
    <A.DateField defaultValue={day}>
      <A.Label>Session date</A.Label>
      <DateSegments />
    </A.DateField>
  ),
  DatePicker: () => (
    <A.DatePicker defaultValue={day}>
      <A.Label>Appointment</A.Label>
      <A.Group>
        <DateSegments />
        <A.Button aria-label="Open appointment calendar">▦</A.Button>
      </A.Group>
      <A.Popover>
        <A.Dialog>
          <A.Calendar>
            <CalendarGrid />
          </A.Calendar>
        </A.Dialog>
      </A.Popover>
    </A.DatePicker>
  ),
  DateRangePicker: () => (
    <A.DateRangePicker defaultValue={{ start: day, end: day.add({ days: 3 }) }}>
      <A.Label>Review period</A.Label>
      <A.Group>
        <A.DateInput slot="start">
          {(segment) => <A.DateSegment segment={segment} />}
        </A.DateInput>
        <span aria-hidden="true">–</span>
        <A.DateInput slot="end">
          {(segment) => <A.DateSegment segment={segment} />}
        </A.DateInput>
        <A.Button aria-label="Open review period calendar">▦</A.Button>
      </A.Group>
      <A.Popover>
        <A.Dialog>
          <A.RangeCalendar>
            <CalendarGrid />
          </A.RangeCalendar>
        </A.Dialog>
      </A.Popover>
    </A.DateRangePicker>
  ),
  Dialog: () => (
    <A.DialogTrigger>
      <A.Button>Review sources</A.Button>
      <A.ModalOverlay isDismissable>
        <A.Modal>
          <DialogContent />
        </A.Modal>
      </A.ModalOverlay>
    </A.DialogTrigger>
  ),
  Disclosure: () => <DisclosureItem title="Source guidance" />,
  DisclosureGroup: () => (
    <A.DisclosureGroup>
      <DisclosureItem title="Observation" />
      <DisclosureItem title="Interpretation" />
    </A.DisclosureGroup>
  ),
  DropZone: () => <Upload drop />,
  FileTrigger: () => <Upload />,
  Form: FormExample,
  GridList: () => (
    <A.GridList aria-label="Sources" selectionMode="multiple" items={items}>
      {(item) => <A.GridListItem>{item.name}</A.GridListItem>}
    </A.GridList>
  ),
  Group: () => (
    <A.Group aria-label="Review actions">
      <A.Button>Previous</A.Button>
      <A.Button>Next</A.Button>
    </A.Group>
  ),
  Link: () => (
    <A.Link
      href="https://react-aria.adobe.com/"
      target="_blank"
      rel="noreferrer"
    >
      React Aria documentation
    </A.Link>
  ),
  ListBox: () => (
    <A.ListBox aria-label="Source types" selectionMode="single">
      {choices}
    </A.ListBox>
  ),
  Menu: () => (
    <A.MenuTrigger>
      <A.Button>Source actions</A.Button>
      <A.Popover>
        <A.Menu aria-label="Source actions">
          <A.MenuItem id="review">Mark reviewed</A.MenuItem>
          <A.SubmenuTrigger>
            <A.MenuItem id="export">Export</A.MenuItem>
            <A.Popover>
              <A.Menu aria-label="Export format">
                <A.MenuItem id="text">Plain text</A.MenuItem>
                <A.MenuItem id="json">JSON</A.MenuItem>
              </A.Menu>
            </A.Popover>
          </A.SubmenuTrigger>
        </A.Menu>
      </A.Popover>
    </A.MenuTrigger>
  ),
  Meter: () => <Progress meter />,
  Modal: () => (
    <A.DialogTrigger>
      <A.Button>Open modal</A.Button>
      <A.ModalOverlay isDismissable>
        <A.Modal>
          <DialogContent />
        </A.Modal>
      </A.ModalOverlay>
    </A.DialogTrigger>
  ),
  NavigationTree: NavigationExample,
  NumberField: () => (
    <A.NumberField defaultValue={50} minValue={10} maxValue={120} step={5}>
      <A.Label>Session minutes</A.Label>
      <A.Group>
        <A.Button slot="decrement" aria-label="Decrease minutes">
          −
        </A.Button>
        <A.Input />
        <A.Button slot="increment" aria-label="Increase minutes">
          +
        </A.Button>
      </A.Group>
    </A.NumberField>
  ),
  Popover: () => (
    <A.DialogTrigger>
      <A.Button>Source details</A.Button>
      <A.Popover>
        <A.Dialog>
          <A.Heading slot="title">Client report</A.Heading>
          <p>Recorded during the fictional session.</p>
          <A.Button slot="close">Close details</A.Button>
        </A.Dialog>
      </A.Popover>
    </A.DialogTrigger>
  ),
  PreviewTrigger: () => (
    <A.PreviewTrigger>
      <A.Link href="#source">Preview source</A.Link>
      <A.Popover>
        <A.Dialog>
          <A.Heading slot="title">Source preview</A.Heading>
          <p>Read supporting information before following the link.</p>
          <A.Button slot="close">Close preview</A.Button>
        </A.Dialog>
      </A.Popover>
    </A.PreviewTrigger>
  ),
  ProgressBar: () => <Progress />,
  RadioGroup: () => (
    <A.RadioGroup defaultValue="0">
      <A.Label>Primary source</A.Label>
      {items.map((item) => (
        <A.Radio key={item.id} value={item.id}>
          <span className="nise-aria__indicator" aria-hidden="true" />
          {item.name}
        </A.Radio>
      ))}
    </A.RadioGroup>
  ),
  RangeCalendar: () => (
    <A.RangeCalendar
      aria-label="Review dates"
      defaultValue={{ start: day, end: day.add({ days: 3 }) }}
    >
      <CalendarGrid />
    </A.RangeCalendar>
  ),
  SearchField: () => (
    <A.SearchField>
      <A.Label>Search notes</A.Label>
      <A.Group>
        <A.Input />
        <A.Button aria-label="Clear search">×</A.Button>
      </A.Group>
    </A.SearchField>
  ),
  Select: () => (
    <A.Select defaultSelectedKey="0">
      <A.Label>Information source</A.Label>
      <A.Button>
        <A.SelectValue />
        <span aria-hidden="true">⌄</span>
      </A.Button>
      <A.Popover>
        <A.ListBox>{choices}</A.ListBox>
      </A.Popover>
    </A.Select>
  ),
  Separator: () => (
    <>
      <p>Observation</p>
      <A.Separator />
      <p>Interpretation</p>
    </>
  ),
  Sheet: () => (
    <A.SheetTrigger>
      <A.Button>Open review sheet</A.Button>
      <A.SheetOverlay
        UNSTABLE_portalContainer={document.body}
        className="react-aria-SheetOverlay nise-aria-sheet nise-aria"
      >
        <A.SheetBackdrop />
        <A.Sheet>
          <A.SheetContent>
            <A.Heading slot="title">Review sheet</A.Heading>
            <p>Supplementary source details.</p>
            <A.Button slot="close">Close sheet</A.Button>
          </A.SheetContent>
        </A.Sheet>
      </A.SheetOverlay>
    </A.SheetTrigger>
  ),
  Slider: Range,
  Switch: ToggleSwitch,
  Table: TableExample,
  Tabs: () => (
    <A.Tabs>
      <A.TabList aria-label="Note sections">
        <A.Tab id="observation">Observation</A.Tab>
        <A.Tab id="interpretation">Interpretation</A.Tab>
      </A.TabList>
      <A.TabPanel id="observation">What was reported or observed.</A.TabPanel>
      <A.TabPanel id="interpretation">
        A provisional explanation, kept separate.
      </A.TabPanel>
    </A.Tabs>
  ),
  TagGroup: Tags,
  TextField: () => (
    <A.TextField>
      <A.Label>Note title</A.Label>
      <A.Input />
      <A.Text slot="description">Use a short, descriptive title.</A.Text>
    </A.TextField>
  ),
  TimeField: () => (
    <A.TimeField defaultValue={parseTime("14:30")}>
      <A.Label>Session time</A.Label>
      <DateSegments />
    </A.TimeField>
  ),
  Toast: ToastExample,
  ToggleButton: () => <A.ToggleButton>Pin note</A.ToggleButton>,
  ToggleButtonGroup: () => (
    <A.ToggleButtonGroup
      selectionMode="single"
      aria-label="Note layout"
      defaultSelectedKeys={["list"]}
    >
      <A.ToggleButton id="list">List</A.ToggleButton>
      <A.ToggleButton id="grid">Grid</A.ToggleButton>
    </A.ToggleButtonGroup>
  ),
  TokenField: TokenExample,
  Toolbar: () => (
    <A.Toolbar aria-label="Note tools">
      <A.ToggleButton aria-label="Bold">B</A.ToggleButton>
      <A.ToggleButton aria-label="Italic">I</A.ToggleButton>
      <A.Button>Insert source</A.Button>
    </A.Toolbar>
  ),
  Tooltip: () => (
    <A.TooltipTrigger delay={0}>
      <A.Button>About sources</A.Button>
      <A.Tooltip>Sources describe where information came from.</A.Tooltip>
    </A.TooltipTrigger>
  ),
  Tree: TreeExample,
  Virtualizer: VirtualizedExample,
  DragAndDrop: DragExample,
} satisfies Record<string, () => ReactNode>;

export type CatalogFamily = keyof typeof examples;

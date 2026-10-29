# React Aria catalog

Nise exposes the complete **React Aria Components 1.22.1 composition API** as
`Aria`, alongside the original 30 Nise component families. `AriaScope` applies a
shared token-based skin. This is an upstream integration, not a claim that Nise
independently implemented or exhaustively tested Adobe's components.

```tsx
import { Aria, AriaScope } from "./src";

<AriaScope>
  <Aria.NumberField defaultValue={50} minValue={10} step={5}>
    <Aria.Label>Session minutes</Aria.Label>
    <Aria.Group>
      <Aria.Button slot="decrement" aria-label="Decrease minutes">−</Aria.Button>
      <Aria.Input />
      <Aria.Button slot="increment" aria-label="Increase minutes">+</Aria.Button>
    </Aria.Group>
  </Aria.NumberField>
</AriaScope>
```

Load `src/styles/globals.css` once. The public entry imports the catalog skin,
which only applies inside `.nise-aria`. The original Nise API is unchanged. Use
it for existing product controls and `Aria` for advanced composition. Do not mix
the two APIs' subparts: `Aria.Select` requires the upstream Button, ListBox and
ListBoxItem composition, rather than Nise's compact Select props. React Aria uses
`onPress`, `isDisabled` and collection keys; Nise retains its documented props.

## Coverage

Storybook → **React Aria / Catalog** has 57 recipes and complete light/dark
grids. The inventory follows the official component navigation, adds an explicit
Dialog recipe, and includes collection drag and drop. These are 57 recipes,
not 57 newly authored Nise components. Helpers such as Label, CalendarCell and
FieldError are demonstrated within their owning composition.

The namespace preserves upstream types, refs, collection generics, contexts,
hooks and render props. Nonvisual helpers are also available. Toast retains its
`UNSTABLE_` prefix and is experimental. Future Adobe additions are not
automatically considered styled or verified; review this inventory on upgrade.

| Area | Recipes |
| --- | --- |
| Actions and navigation | Button, Link, Breadcrumbs, ToggleButton, ToggleButtonGroup, Toolbar, NavigationTree |
| Fields and forms | TextField, SearchField, NumberField, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, Form, Group, TokenField |
| Dates and times | Calendar, RangeCalendar, DateField, TimeField, DatePicker, DateRangePicker |
| Collections | Autocomplete, ComboBox, Select, ListBox, GridList, Table, Tree, TagGroup, Virtualizer, DragAndDrop |
| Disclosure and overlays | Disclosure, DisclosureGroup, Tabs, Dialog, Modal, Popover, PreviewTrigger, Tooltip, Sheet, Menu |
| Feedback and files | ProgressBar, Meter, Separator, Toast (unstable), FileTrigger, DropZone |
| Color | ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch, ColorSwatchPicker, ColorWheel |

## Styling and portals

Preserve React Aria's default `react-aria-*` class names. Replacing `className`
replaces the skin unless you include the default class. Checkbox/radio/switch
recipes include a decorative `.nise-aria__indicator`; React Aria supplies the
hidden native input and behavior.

AriaScope uses Adobe's documented `UNSAFE_PortalProvider` to route overlay portals into its DOM boundary,
so nested themes and token overrides also apply to those overlays. Avoid
ancestors with clipping or transforms that change overlay positioning. If you
override the portal container, apply the same theme to the new overlay root.

The upstream UNSAFE name is intentional: arbitrary portal locations can break
stacking, clipping or accessibility. This integration is opt-in and the scoped
overlay behavior is browser-tested; it is not a guarantee for arbitrary app
layouts. Keep the scope at the application surface rather than a clipped panel.
See <https://react-aria.adobe.com/PortalProvider>.

Sheet has no exported context equivalent. Its recipe portals to document.body
and applies `nise-aria-sheet nise-aria` to SheetOverlay. It follows the document
theme; nested scope overrides are not copied to that body portal. Only the
bottom placement is styled here. Other placements, snap points and stacking
need application-specific styling and tests.

Color controls start at authored brand anchors and allow arbitrary user colors.
Their local state never writes design tokens. File selection shows metadata;
it does not upload anything. Virtualized collections need block layout, fixed
row size and a bounded scroll viewport. Collection drag and drop uses upstream
useDragAndDrop and useListData rather than another drag library.

## Verification and limits

The browser suite audits both complete grids for runtime errors, WCAG-tagged
axe violations and horizontal overflow at 390px. Interaction tests cover number
entry, filtering, removable tags, date navigation, dialog dismissal and focus
restoration, notifications, sheets, and a 1,000-item virtualized list. The
existing portfolio remains a separate regression gate.

This verifies representative Chromium recipes, not all upstream props/states,
full WCAG conformance, or a cross-browser and screen-reader matrix. Test new
production compositions in their actual product context.

## Agent discovery and upgrades

Use the existing official Storybook MCP addon to discover React Aria/Catalog.
Its stories share a CatalogExample component with a typed family prop. Read the
matching recipe in `src/aria/examples.tsx` and the upstream types before composing.
Authoritative API documentation: <https://react-aria.adobe.com/>.

On upgrades, compare Adobe's component navigation with the recipe inventory,
review release notes, rebuild Storybook, run `npm run verify` and
`npm run test:browser`. Add tests for any new product behavior.

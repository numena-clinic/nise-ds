# Collapsible

An interactive component that expands/collapses a panel. Backed by [React Aria Components (`Disclosure`)](https://react-aria.adobe.com/Disclosure.html) as the headless foundation.

## Architectural Rationale (Decision D6)

Prior implementations relied on custom state synchronization and fragile `asChild` / `cloneElement` wrappers to mimic Radix UI APIs. This led to repeated bugs:
1. **Hidden content leakage**: Inline styles (such as `display: flex` on nested file tree items) inadvertently overrode closed state styles.
2. **Fragile trigger composition**: Wrapping child elements via `asChild` created ref-forwarding errors and prevented standard keyboard event propagation.
3. **Repeated accessibility plumbing**: ARIA attributes (`aria-expanded`, `aria-controls`), focus rings, and Space/Enter key handlers had to be maintained and debugged by hand.

By migrating to **React Aria Components (`Disclosure`)**:
- **Zero custom ARIA state machines**: RAC handles keyboard interaction, touch normalization, focus-visible states, and accessibility relationships natively.
- **Robust content hiding**: Panels use standard HTML `hidden` attributes backed by scoped `!important` display rules, ensuring closed panels remain hidden even with inline flex/grid styles.
- **Nise design ownership**: Nise continues to own 100% of tokens, plain CSS, visual states, and button variants (`variant="ghost"`, `size="sm"` directly on `CollapsibleTrigger`).

## When to use

Use Collapsible for optional supplemental content that most users skip but some need: expandable lists, detail cards, directory trees, and secondary controls.

## Composition

### Repository Starred List

```tsx
<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: "var(--space-4)" }}>
    <h4>@peduarte starred 3 repositories</h4>
    <CollapsibleTrigger
      variant="ghost"
      size="sm"
      aria-label="Toggle repository list"
      style={{ width: 32, height: 32, padding: 0 }}
    >
      <ChevronsUpDownIcon size={16} />
    </CollapsibleTrigger>
  </div>
  <div style={{ padding: "var(--space-2) var(--space-4)" }}>@radix-ui/primitives</div>
  <CollapsibleContent>
    <div style={{ padding: "var(--space-2) var(--space-4)" }}>@radix-ui/colors</div>
    <div style={{ padding: "var(--space-2) var(--space-4)" }}>@stitches/react</div>
  </CollapsibleContent>
</Collapsible>
```

### Card Details (Basic pattern)

```tsx
<Card>
  <Collapsible open={isOpen} onOpenChange={setIsOpen}>
    <CollapsibleTrigger
      variant="ghost"
      style={{ width: "100%", justifyContent: "space-between" }}
    >
      <span>Product details</span>
      <ChevronDownIcon size={16} />
    </CollapsibleTrigger>
    <CollapsibleContent>
      An open-source UI component library for building high-quality design systems.
    </CollapsibleContent>
  </Collapsible>
</Card>
```

### File Tree (nested collapsibles)

```tsx
<Card style={{ maxWidth: 300 }}>
  <Tabs defaultValue="explorer">
    <TabsList style={{ width: "100%" }}>
      <TabsTrigger value="explorer" style={{ flex: 1 }}>Explorer</TabsTrigger>
      <TabsTrigger value="outline" style={{ flex: 1 }}>Outline</TabsTrigger>
    </TabsList>
    <TabsContent value="explorer">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <Collapsible defaultOpen>
          <CollapsibleTrigger
            variant="ghost"
            size="sm"
            className="nise-collapsible__tree-item"
          >
            <ChevronRightIcon size={16} className="nise-collapsible__chevron" />
            <FolderIcon size={16} />
            <span>components</span>
          </CollapsibleTrigger>
          <CollapsibleContent style={{ paddingLeft: "var(--space-4)" }}>
            <Button variant="ghost" size="sm" className="nise-collapsible__tree-item">
              <FileIcon size={16} />
              <span>Button.tsx</span>
            </Button>
          </CollapsibleContent>
        </Collapsible>

        <Button variant="ghost" size="sm" className="nise-collapsible__tree-item nise-collapsible__tree-item--root-file">
          <FileIcon size={16} />
          <span>package.json</span>
        </Button>
      </div>
    </TabsContent>
  </Tabs>
</Card>
```

## Props

### Collapsible

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` / `isExpanded` | `boolean` | — | Controlled open state |
| `defaultOpen` / `defaultExpanded` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onOpenChange` / `onExpandedChange` | `(open: boolean) => void` | — | Callback fired when open state changes |
| `disabled` / `isDisabled` | `boolean` | `false` | Disables interaction |
| `className` | `string` | — | Custom CSS classes |

### CollapsibleTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "ghost"` | — | Optional Nise Button visual variant |
| `size` | `"sm" \| "md" \| "lg"` | — | Optional Nise Button size |
| `children` | `ReactNode` | — | Label, icons, and trigger content |

### CollapsibleContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `role` | `"region" \| "group"` | `"region"` | Accessible role for the panel |
| `children` | `ReactNode` | — | Panel content revealed when open |

## Tokens consumed

```
--color-base-content    trigger and content text
--color-base-hover      trigger hover background
--color-focus-ring      focus outline
--focus-ring-width      focus outline width
--focus-ring-offset     focus outline offset
--font-sans             typography family
--font-weight-medium    trigger label weight
--font-size-sm          font size
--radius-sm             trigger border-radius
--duration-fast         transition duration
--ease-standard         transition easing
```


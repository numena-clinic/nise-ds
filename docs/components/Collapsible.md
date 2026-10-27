# Collapsible

An interactive component that expands/collapses a panel. Matches the [shadcn/ui and Radix Collapsible](https://ui.shadcn.com/docs/components/base/collapsible) design pattern and API.

## When to use

Use Collapsible for optional supplemental content that most users skip but some need: expandable lists, detail cards, and secondary controls.

## Composition

### Repository Starred List (canonical shadcn pattern)

```tsx
<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: "var(--space-4)" }}>
    <h4>@peduarte starred 3 repositories</h4>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm" aria-label="Toggle repository list">
        <ChevronsUpDownIcon size={16} />
      </Button>
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
    <CollapsibleTrigger asChild>
      <Button variant="ghost" style={{ width: "100%", justifyContent: "space-between" }}>
        <span>Product details</span>
        <ChevronDownIcon size={16} />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      An open-source UI component library for building high-quality design systems.
    </CollapsibleContent>
  </Collapsible>
</Card>
```

## Props

### Collapsible

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | — | Callback fired when open state changes |
| `disabled` | `boolean` | `false` | Disables interaction |
| `asChild` | `boolean` | `false` | Clones child element and merges root container attributes |

### CollapsibleTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Clones child element and merges trigger behavior |

### CollapsibleContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Clones child element and merges content attributes |
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


# Breadcrumb

Navigational hierarchy — where the user is inside the product, expressed as a list of links leading to the current page.

## When to use

Use Breadcrumb in main content areas where users navigate more than two levels deep. Do not use it in dialogs, drawers, or settings panels where depth is shallow and context is clear from the heading.

## Composition

Breadcrumb is composable — assemble it from its parts:

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/workspace">Workspace</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/clients/maya">Maya Calderón</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Session 4</BreadcrumbPage>
    </BreadcrumbPage>
  </BreadcrumbList>
</Breadcrumb>
```

Use `BreadcrumbEllipsis` in place of collapsed middle items when the path is long.

## Accessibility

- `Breadcrumb` renders `<nav aria-label="Breadcrumb">`.
- `BreadcrumbList` renders `<ol>`.
- `BreadcrumbPage` renders `<span aria-current="page">` — no link because the current page is not navigable.
- `BreadcrumbSeparator` is `aria-hidden`.

## Parts

| Component | Element | Notes |
|-----------|---------|-------|
| `Breadcrumb` | `<nav>` | Required wrapper |
| `BreadcrumbList` | `<ol>` | Required list |
| `BreadcrumbItem` | `<li>` | Required list item |
| `BreadcrumbLink` | `<a>` | Ancestor link; pass `href` |
| `BreadcrumbPage` | `<span>` | Current page; no href |
| `BreadcrumbSeparator` | decorative `<li>` | Chevron, `aria-hidden` |
| `BreadcrumbEllipsis` | `<span>` | Collapsed items placeholder |

## Tokens consumed

```
--color-link          ancestor link color
--color-link-hover    ancestor link hover
--color-text-muted    separator and ellipsis
--color-base-content  current page text
--font-size-sm        text size
```

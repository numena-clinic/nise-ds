# Pagination

Page navigation for a record list — sessions, assessments, anything paged. Built as composable parts over plain HTML (`nav > ol > li > a`).

## When to use

Use Pagination when a data list spans more than one page and the user needs to move between pages explicitly. For infinite scroll or load-more, build a custom control with `Button`.

## Accessibility

- `Pagination` renders `<nav aria-label="Pagination">`.
- The active page link carries `aria-current="page"`.
- Previous and Next links pair a decorative chevron (`aria-hidden`) with visible text — never the icon alone.

## Composition

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
    <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
    <PaginationItem><PaginationEllipsis /></PaginationItem>
    <PaginationItem><PaginationLink href="#">12</PaginationLink></PaginationItem>
    <PaginationItem><PaginationNext href="#" /></PaginationItem>
  </PaginationContent>
</Pagination>
```

## Parts

| Component | Notes |
|-----------|-------|
| `Pagination` | `<nav>` wrapper |
| `PaginationContent` | `<ol>` list |
| `PaginationItem` | `<li>` |
| `PaginationLink` | Page number link; pass `isActive` for the current page |
| `PaginationPrevious` | "Previous" link with chevron |
| `PaginationNext` | "Next" link with chevron |
| `PaginationEllipsis` | Gap indicator, `aria-hidden` |

## Tokens consumed

```
--pagination-gap          → --space-1
--button-height-sm        page link height
--button-padding-x-sm     page link padding
--button-font-size-sm     page link text size
--color-text-muted        ellipsis and muted links
--color-base-hover        link hover background
--color-base-content      link text
--color-tint-purple       active page background
--color-focus-ring        focus outline
--radius-sm               link border-radius
```

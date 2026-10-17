# Dialog

Radix modal with overlay, focus trap and ESC to close. Provide a `DialogTitle`
and `DialogDescription`.

## Usage
```tsx
<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>...</DialogFooter>
  </DialogContent>
</Dialog>
```

## Tokens
`--dialog-padding`, `--dialog-gap`, `--dialog-width`.

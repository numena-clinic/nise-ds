# Tabs

Radix-backed horizontal tabs. Roving tabindex and keyboard navigation are
provided by Radix.

## Usage
```tsx
<Tabs defaultValue="a">
  <TabsList>
    <TabsTrigger value="a">Notes</TabsTrigger>
    <TabsTrigger value="b">Attachments</TabsTrigger>
  </TabsList>
  <TabsContent value="a">...</TabsContent>
  <TabsContent value="b">...</TabsContent>
</Tabs>
```

## Tokens
`--tabs-gap`, `--tab-padding-x`, `--tab-height`.

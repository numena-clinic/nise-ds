# Tabs

`Tabs`, `TabsList`, `TabsTrigger` and `TabsContent` wrap React Aria Tabs, TabList,
Tab and TabPanel. Nise maps string `value`/`defaultValue`/`onValueChange` to
React Aria selection keys. Give each trigger and panel the same `value`.

Label `TabsList` when its purpose is not otherwise clear. React Aria owns
selection, focus navigation and panel relationships. Selected styling uses its
`data-selected` attribute. A Tab is a focusable tab element; callers should use
roles rather than assume a native button. See the session workspace composition.

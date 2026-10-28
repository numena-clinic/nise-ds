# Select

A labelled single-selection field over React Aria Select, Button, Popover and
ListBox. React Aria owns keyboard navigation, typeahead, dismissal, hidden form
submission and selection semantics. The trigger is a button, not a text combobox.

Use `label`, `options: { value, label, disabled? }[]`, and either `defaultValue`
or controlled `value`/`onValueChange`. `hint` is replaced by `error` when invalid.
`name`, `required` and `disabled` map to the headless control. `portalContainer`
keeps a popup inside a scoped theme; the default portal is the document body.

Use radios for a few visible alternatives. A searchable combobox is not part
of this release. See Select stories and the gallery for actual examples.

# Dialog

A modal built from React Aria DialogTrigger, ModalOverlay, Modal and Dialog.
`Dialog` supports `open`, `defaultOpen` and `onOpenChange`. Compose it with
`DialogTrigger`, `DialogContent`, `DialogTitle`, optional `DialogDescription`,
`DialogHeader`, `DialogFooter` and `DialogClose`.

Always supply a title. A rendered description is associated by ID. React Aria
owns focus containment, Escape, outside dismissal and trigger focus restoration.
`container` on content supports scoped themes. `asChild` supports an existing
Nise Button that forwards its ref and native attributes. Use `onPress` on
DialogClose for actions coupled to dismissal; the workspace demonstrates saving
from a review dialog. Essential information should remain in the main interface.

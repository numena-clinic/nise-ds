# Slider

A single-thumb React Aria slider. Nise retains array-shaped `value`,
`defaultValue` and `onValueChange`, with `min`, `max` and `step`. Only one value
is supported. Use `label` or an accessible name and provide a `hint` when helpful.

React Aria renders a native range input inside its positioned thumb. The input
carries its value and description; Arrow keys and Home/End use the primitive's
behavior. Browser tests measure thumb centering and keyboard value changes.
The visual track and thumb read `--slider-*` and semantic roles.

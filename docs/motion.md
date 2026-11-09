# Motion

Nise uses CSS transitions and keyframes with React Aria's existing state and
geometry support. This release adds no animation dependency. Motion and Animate
UI remain options for future choreography that the current stack cannot express
cleanly; they are not required for these interactions.

## Behaviors

- Tabs use React Aria's SelectionIndicator. React Aria measures the old/new
  selection; CSS transitions translate and dimensions. Labels, keyboard selection
  and panel semantics stay unchanged. Initial selection appears at rest.
- Accordion and Collapsible use the upstream `--disclosure-panel-height` CSS
  variable. React Aria measures content and applies the hidden state after the
  transition; CSS does not force the closed state to disappear prematurely.
- Dialogs fade with a small entrance offset. The individual translate property
  composes with the existing centering transform, so the dialog remains centered.
  React Aria owns presence, dismissal, focus containment and restoration.
- The workspace draws a decorative check when a draft has been saved. The text
  status remains the accessible feedback. No fake loading time, timeout, repeated
  pulse or animation is added to the clinical content.

## Timing and accessibility

All durations and easing use existing motion tokens: fast 120ms, medium 200ms,
standard easing, and entrance easing. No second motion scale is introduced.
`prefers-reduced-motion: reduce` removes the added movement and check animation;
selection, content visibility, save feedback and dismissal still work.

Animate only in response to a state change. Do not delay actions for an effect,
move focus to decorative elements, or communicate a state using motion alone.

## Verification

`tests/browser/motion.spec.ts` verifies keyboard selection and the tab indicator's
final geometry, disclosure visibility, save feedback, centered dialogs and focus
restoration with normal and reduced motion. Existing browser tests remain the
interaction regression gate. jsdom cannot run animations; its getAnimations
polyfill reports none, and real motion is checked in Chromium.

Build comparison against the standalone-site baseline added approximately 1 KB
gzip across all generated JS/CSS assets, summed per file. No runtime dependency
was added. This is a build measurement, not a per-route network-transfer promise
or a cross-browser performance benchmark.

For manual review: switch between unequal-width tabs with the keyboard, rapidly
open/close a disclosure and a dialog, resize after changing selection, and repeat
with the operating system's reduced-motion preference enabled.

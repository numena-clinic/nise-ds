# Portfolio release: scope and technical explanation

## What this project demonstrates

A consistent visual language translated into code, reusable component APIs,
real composition, and a repeatable review workflow. The evidence is the public
source, Storybook specimens, interactive workspace and executed checks.

## Architectural decisions to explain

- **Brand → tokens → components → compositions.** Brand identity is input. Token
  aliases encode visual roles, components own reusable UI behavior, and the
  showcase owns fictional product state. A theme swaps mappings without giving
  every component a new API.
- **React Aria for complex interaction.** Nise owns styling and its public API;
  the dependency owns difficult keyboard, focus and overlay behavior. The
  wrappers still need integration testing. A simple native checkbox does not
  need a new state machine just to fit a brand.
- **Plain CSS.** Custom properties allow runtime themes and inspectable styles.
  Generated tokens have one source and a reproducibility check. The source
  scanner catches a defined set of token-usage mistakes; it is not a full CSS
  parser or proof that every visual property is tokenized.
- **A standalone webpage as the portfolio surface.** The workspace, component
  collection and Aria catalog have real HTML routes and share source components.
  Storybook documents and tests components; it is a supporting technical link.
  The experimental theme-authoring application is separate from both.
- **CI and Chromatic have separate roles.** CI checks types, token integrity,
  behavior and browser interactions. Chromatic publishes Storybook and compares
  rendered snapshots. Reviewers accept intentional visual changes.
- **MCP provides discoverability.** The official Storybook addon exposes component
  documentation to an agent. It reduces invented APIs; enforcement still comes
  from types, checks and review. No custom MCP service is claimed.

## Honest boundaries

- This is a portfolio prototype, not a deployed clinical product.
- The records are fictional. Save writes to React state, not a backend.
- In the original 30-family Nise API, nine complex families use React Aria and
  the others use native HTML. The separate `Aria` namespace exposes the full
  upstream composition API with 57 Nise-styled recipes. This is integration,
  not 57 independently authored components. Toast is experimental; see
  `react-aria-catalog.md` for the tested surface and remaining limits.
- Automated axe tests and analytical contrast checks do not prove WCAG
  conformance. Manual assistive-technology and device testing remains future work.
- Tiempos requires a consumer license; the demo uses the documented Georgia fallback.
- React 19 is exercised. React 18 compatibility and registry distribution are not claimed.
- The MCP addon is an upstream preview feature and can change.
- Use a real Chromatic build URL as publication evidence. A workflow file alone
  is only configuration.

## Interview preparation

Be ready to locate a token's source and trace its use in a component, explain
why a control uses React Aria, demonstrate a failing regression test and its fix,
and walk through a reviewed visual change. Explain what you delegated to AI and
how you checked the result. Only claim decisions and code you can explain.

A useful five-minute walkthrough:

1. Open the gallery in light and dark mode.
2. Edit a workspace note; discard, save and review it with the keyboard.
3. Trace `--color-primary` from token data to Button CSS.
4. Show the token validator, one component regression and one browser test.
5. Show the component manifest/MCP documentation and a Chromatic review once connected.

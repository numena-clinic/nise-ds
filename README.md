# Nise Design System

Nise is the code-first interface system for **Numena**, a clinical reasoning
workspace concept. The brand owns identity; Nise turns it into tokens,
components, usage guidance and compositions.

## Start here

```sh
npm ci
npm run storybook
```

Open **Portfolio → Session workspace** for the interactive product composition,
or **Component collection** for all 30 shipped component families. Both have
light and dark stories. The workspace uses fictional records and local browser
memory: it has no backend, authentication or clinical decision logic.

The demo supports editing, saving/discarding a draft, switching sessions, tabs,
source selection and a review dialog. Unsaved changes are discarded when switching
sessions. A reload resets all demo data.

## What is implemented

- **221 tokens** in primitive, semantic and component layers, with authored dark
  mappings. Generated CSS is checked against its source.
- **30 component families**: React Aria supplies the complex behavior for Select,
  Slider, Tabs, Dialog, Tooltip, Accordion, Collapsible, Toggle and ToggleGroup.
  Simple and presentational components use native HTML.
- **Storybook** stories, controls, generated prop documentation and an axe panel.
- **Chromatic workflow** for publishing Storybook and reviewing visual changes.
  Activation requires a project token; a configured workflow is not proof of a
  published build.
- **Agent integration** through the official Storybook MCP addon and component
  manifest, plus repository instructions and enforced token boundaries.

This is a React 19 portfolio release. It does not implement the entire React
Aria catalog. Date inputs, comboboxes, menus, advanced tables and drag-and-drop
are future additions, rather than implied capabilities of this release.

## Verification

```sh
npm run verify             # tokens, token usage, lint, TypeScript, unit/axe tests
npm run build-storybook    # builds the actual published surface
npx playwright install chromium  # once per local machine
npm run test:browser       # interactions, themes, mobile reflow, slider geometry
```

CI repeats those commands on a clean checkout. Browser tests serve the built
Storybook and exercise real stories. Chromatic captures visual baselines and
requires review of changes; it does not replace interaction or accessibility
checks. Automated checks do not establish complete WCAG conformance.

## Publish through Chromatic

1. Create a Chromatic project connected to this GitHub repository.
2. Add its project token as the repository Actions secret
   `CHROMATIC_PROJECT_TOKEN`.
3. Run the **Chromatic** workflow. Review and accept the initial baseline in
   Chromatic, then use its public Storybook URL in your portfolio.

The workflow never automatically accepts visual changes. If the token is
missing it reports that no publication occurred. Do not commit tokens.

## Build with an agent

Start Storybook and configure your MCP-capable client with an HTTP server at
`http://localhost:6006/mcp`. The official addon exposes documentation and story
tools; its API is currently a Storybook preview feature.

Ask the agent to list the documented components, inspect their props and examples,
then compose a screen using the public API. Run verification and review the
resulting story. MCP provides context; TypeScript and CI provide checks. Neither
can guarantee that every generated interface is correct.

See [agent usage](docs/agent-usage.md), [architecture and interview notes](docs/portfolio-release.md),
and [decisions](docs/decisions.md).

## Repository map

| Path | Responsibility |
| --- | --- |
| `tokens/*.mjs` | Canonical token data, generation and validation |
| `src/components/` | Components, plain CSS and individual stories |
| `src/showcase/` | Portfolio workspace and full component gallery |
| `src/index.ts` | Public source API |
| `tests/` | Behavior, accessibility and token checks |
| `tests/browser/` | Playwright checks against built Storybook |
| `.storybook/` | Documentation, theme toolbar and official MCP integration |

## Experimental tools

The existing Theme Explorer (`npm run dev`), candidate promotion, OpenPencil
export and local library build remain available for exploration. They are
outside the portfolio release path. Publishing a registry package and supporting
multiple React versions are deferred.

Brand reference: [numena-clinic/numena-brand](https://github.com/numena-clinic/numena-brand).
Albert Sans is bundled from its OFL-licensed package. Tiempos Text is not
redistributed; the serif falls back to Georgia until a licensed consumer supplies it.

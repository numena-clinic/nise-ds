# Nise Design System

Nise is the code-first interface system for **Numena**, a clinical reasoning
workspace concept. The brand owns identity; Nise turns it into tokens,
components, usage guidance and compositions.

## Start here

The full upstream React Aria composition API is available through `Aria` and
`AriaScope`, with 57 token-styled recipes under **React Aria → Catalog**.
See [catalog API, coverage and limits](docs/react-aria-catalog.md). This extends
the original Nise components without changing their APIs. Toast is experimental.

```sh
npm ci
npm run dev
```

Open **http://localhost:5173** for the standalone interface demo. Visit
`/components/` for the 30-family grid and `/aria/` for the full React Aria recipe
catalog. The site has its own navigation and light/dark toggle. It does not use
Storybook or an iframe. The workspace uses fictional records and local memory;
it has no backend, authentication or clinical decision logic.

Run `npm run storybook` separately at http://localhost:6006 for component
documentation, accessibility inspection, Chromatic snapshots and MCP.

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

The separate `Aria` namespace exposes the upstream catalog, with 57 runnable
recipes. This is framework integration, not 57 independently authored Nise
components. See the catalog guide for tested behavior and limitations.

## Verification

```sh
npm run verify             # tokens, token usage, lint, TypeScript, unit/axe tests
npm run build:site         # builds the standalone webpage
npm run build-storybook    # builds component documentation
npx playwright install chromium  # once per local machine
npm run test:browser       # interactions, themes, mobile reflow, slider geometry
```

CI repeats those commands on a clean checkout. Browser tests serve the built
standalone site and the component Storybook. Chromatic captures visual baselines and
requires review of changes; it does not replace interaction or accessibility
checks. Automated checks do not establish complete WCAG conformance.

## Publish through Chromatic

1. Create a Chromatic project connected to this GitHub repository.
2. Add its project token as the repository Actions secret
   `CHROMATIC_PROJECT_TOKEN`.
3. Run the **Chromatic** workflow. Review and accept the initial baseline in
   Chromatic. Use the standalone site URL as the primary portfolio link,
   with Storybook as supporting component documentation.

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
| `src/showcase/` | Reusable workspace and component gallery compositions |
| `src/site/`, `site/` | Standalone webpage shell and HTML routes |
| `src/index.ts` | Public source API |
| `tests/` | Behavior, accessibility and token checks |
| `tests/browser/` | Playwright checks against the built site and Storybook |
| `.storybook/` | Documentation, theme toolbar and official MCP integration |

## Experimental tools

The existing Theme Explorer (`npm run dev:explorer`), candidate promotion, OpenPencil
export and local library build remain available for exploration. They are
outside the portfolio release path. Publishing a registry package and supporting
multiple React versions are deferred.

Brand reference: [numena-clinic/numena-brand](https://github.com/numena-clinic/numena-brand).
Albert Sans is bundled from its OFL-licensed package. Tiempos Text is not
redistributed; the serif falls back to Georgia until a licensed consumer supplies it.

## Publish the webpage

Run `npm run build:site` and deploy `dist-site/` to a static web host. The
output includes `index.html`, `components/index.html`, and `aria/index.html`,
so these routes need no SPA fallback. For a host under a path prefix, build with
`npm run build:site -- --base /nise-ds/`. Preview the result locally with
`npm run preview:site` at http://localhost:5175. Storybook and the Theme Explorer
are separate builds and do not need to be deployed with the webpage.

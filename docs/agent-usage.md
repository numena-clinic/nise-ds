# Building with Nise

## Discover before composing

Run `npm run storybook`. The official `@storybook/addon-mcp` server is available
at `http://localhost:6006/mcp`. Add that HTTP endpoint in your agent client's MCP
configuration. Server configuration is client-specific; it is not installed into
your account by this repository.

Use `docs-list` to discover components and `docs-show` for the relevant component
API. Read its story to see concrete composition. When MCP is unavailable, inspect
`src/index.ts`, the component types and its `*.stories.tsx` file directly.

## Rules

1. Import existing controls through `src/index.ts` in this repository.
2. Use documented props. Do not assume APIs from shadcn, Radix or another system.
3. Use semantic color roles and existing spacing/type/radius tokens.
4. Supply visible labels. Keep error and hint relationships intact.
5. Keep interaction behavior in the components; compositions own product state.
6. Use synthetic content in examples, clearly marked as such.
7. Add a story and tests for the behavior you introduce. Run verification.

## Reproducible exercise

> Inspect the Nise TextField, Select, Textarea, Button and Dialog documentation.
> Create a fictional session-review form using those components. Keep state in
> browser memory. Include a visible saved/unsaved status, discard changes and an
> accessible review dialog. Use only Nise tokens for styling. Add a Storybook story
> and verify save, discard, keyboard dismissal and focus restoration.

`src/showcase/SessionWorkspace.tsx` is a reference implementation of this kind
of composition. `tests/browser/portfolio.spec.ts` verifies the observable
behavior against the built stories. This is an example workflow, not evidence
that an autonomous agent always follows the system correctly.

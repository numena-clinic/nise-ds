// The token source is authored as plain ESM (.mjs) and shared verbatim with the
// Node tooling, so the Theme Explorer and the generator read the SAME token
// graph and can never disagree about it. TypeScript has no types for those
// modules; the boundary is typed once here and re-shaped by the wrappers in
// ./theme/tokens.ts.
declare module "*.mjs";

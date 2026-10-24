import type { ReactNode } from "react";

export interface PageRenderContext {
  /**
   * Where portalled popups (Select, Tooltip, Dialog) should mount. Points at
   * the preview wrapper so the popup inherits the experimental custom
   * properties.
   */
  portalContainer?: HTMLElement | null;
  /** The experimental token map for the current overrides + mode. */
  map: Readonly<Record<string, string>>;
}

export interface SpecimenPage {
  id: string;
  label: string;
  title: string;
  note?: string;
  render: (ctx: PageRenderContext) => ReactNode;
}

export type FoundationId =
  | "found-colour"
  | "found-type"
  | "found-space"
  | "found-shape"
  | "found-motion";

export interface FoundationPage {
  id: FoundationId;
  label: string;
  title: string;
  render: (ctx: PageRenderContext) => ReactNode;
}

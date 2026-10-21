// The explorer's sidebar — a docs-style index over the page registry.
//
// Three groups: Foundations (the token editor sections plus the full token
// graph), Components (one page per family) and Patterns (composed
// combinations). Selection is a single page id owned by App; the active item
// carries aria-current="page".

import { COMPONENT_PAGES, FOUNDATION_PAGES, PATTERN_PAGES } from "./pages";

export const TOKEN_GRAPH_PAGE = "found-graph";

export const FOUNDATION_TAB_MAP: Record<string, "color" | "typography" | "space" | "shape" | "motion"> = {
  "found-colour": "color",
  "found-type": "typography",
  "found-space": "space",
  "found-shape": "shape",
  "found-motion": "motion",
};

interface Props {
  pageId: string;
  onSelect: (pageId: string) => void;
}

interface Group {
  title: string;
  items: { id: string; label: string }[];
}

export function Sidebar({ pageId, onSelect }: Props) {
  const groups: Group[] = [
    {
      title: "Foundations",
      items: [
        ...FOUNDATION_PAGES.map((p) => ({ id: p.id, label: p.label })),
        { id: TOKEN_GRAPH_PAGE, label: "Token graph" },
      ],
    },
    { title: "Components", items: COMPONENT_PAGES.map((p) => ({ id: p.id, label: p.label })) },
    { title: "Patterns", items: PATTERN_PAGES.map((p) => ({ id: p.id, label: p.label })) },
  ];

  return (
    <nav className="nise-explorer__sidebar" aria-label="Explorer sections">
      {groups.map((group) => (
        <div key={group.title} className="nise-explorer__sidebar-group">
          <h2 className="nise-explorer__sidebar-title">{group.title}</h2>
          <ul className="nise-explorer__sidebar-list">
            {group.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="nise-explorer__sidebar-link"
                  aria-current={pageId === item.id ? "page" : undefined}
                  onClick={() => onSelect(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

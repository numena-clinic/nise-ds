// The token reference: the graph, with your experimental values resolved.
//
// Three columns matching the three layers, drawn straight from the source graph
// (there is no second list). A row shows the token, its raw value and the value
// it resolves to right now, so a palette edit is traceable all the way down to
// the component layer. Derived tokens are marked, because you change them by
// changing what they are derived from.

import { LAYERS, IMMUTABLE_PRIMITIVES, type LayerId, type TokenInfo } from "../theme/tokens";
import { experimentalTokens, resolve, type Overrides, type ThemeMode } from "../theme/theme";
import { INFO_BY_NAME } from "../theme/tokens";

const LAYER_LABEL: Record<LayerId, string> = {
  primitive: "Primitive",
  semantic: "Semantic",
  component: "Component",
};

const LAYER_NOTE: Record<LayerId, string> = {
  primitive: "authored",
  semantic: "roles",
  component: "consumed",
};

interface Props {
  overrides: Overrides;
  query: string;
  /** Which theme mapping the resolved column reads (the wrapper's preview). */
  mode: ThemeMode;
}

function Row({
  info,
  tokens,
  baseline,
}: {
  info: TokenInfo;
  tokens: Record<string, string>;
  baseline: Record<string, string>;
}) {
  const resolved = resolve(info.name, tokens);
  // "live" means changed BY YOUR EDITS — compared against the same theme with
  // no overrides, so flipping the preview to dark does not flag every role.
  const changed = resolve(info.name, baseline) !== resolved;
  return (
    <li className="nise-ref__row">
      <code className="nise-ref__name">{info.name}</code>
      <code className="nise-ref__raw">{info.raw}</code>
      <span className="nise-ref__resolved" title={resolved}>
        {resolved}
      </span>
      {info.form === "derived" ? (
        <span className="nise-ref__tag nise-ref__tag--derived">derived</span>
      ) : null}
      {info.form === "alias" ? (
        <span className="nise-ref__tag">→ {info.ref?.replace(/^--/, "")}</span>
      ) : null}
      {changed ? <span className="nise-ref__tag nise-ref__tag--live">live</span> : null}
    </li>
  );
}

export function TokenReference({ overrides, query, mode }: Props) {
  const tokens = experimentalTokens(overrides, mode);
  const baseline = experimentalTokens({}, mode);
  const q = query.trim().toLowerCase();

  return (
    <div className="nise-ref">
      <p className="nise-ref__intro">
        Every token in the source, with the value it resolves to under your current edits and the{" "}
        {mode} mapping. Nothing here is authored twice — it is the same graph the validator and the
        generator read.
      </p>
      <div className="nise-ref__grid">
        {LAYERS.map((layer) => {
          const all = layer.groups.flatMap((g) =>
            Object.entries(g.tokens).map(([name, raw]) => ({
              name,
              raw,
              group: g.label,
            })),
          );
          const shown = all.filter(
            (t) => q === "" || t.name.toLowerCase().includes(q) || t.group.toLowerCase().includes(q),
          );
          return (
            <section key={layer.id} className="nise-ref__col" aria-labelledby={`ref-${layer.id}`}>
              <h3 id={`ref-${layer.id}`} className="nise-ref__col-title">
                {LAYER_LABEL[layer.id]}
                <span className="nise-ref__col-note">
                  {LAYER_NOTE[layer.id]} · {shown.length}
                </span>
              </h3>
              <ul className="nise-ref__list">
                {shown.map((t) => {
                  const info = INFO_BY_NAME[t.name];
                  return (
                    <Row
                      key={t.name}
                      tokens={tokens}
                      baseline={baseline}
                      info={
                        info ?? {
                          name: t.name,
                          layer: layer.id,
                          group: t.group,
                          section: "shape",
                          raw: t.raw,
                          form: "value",
                          primitive: layer.id === "primitive",
                          immutable: IMMUTABLE_PRIMITIVES.has(t.name),
                        }
                      }
                    />
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

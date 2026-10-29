/** Complete upstream component-family index, pinned to RAC 1.22.1.
 * Helpers and subparts are demonstrated within their owning composition.
 * Toast deliberately keeps its upstream unstable status visible. */
import { Aria, AriaScope } from "./index";
import { examples } from "./examples";
import type { CatalogFamily } from "./examples";

export function CatalogExample({ family }: { family: CatalogFamily }) {
  const Example = examples[family];
  return (
    <Aria.I18nProvider locale="en-US">
      <AriaScope>
        <Example />
      </AriaScope>
    </Aria.I18nProvider>
  );
}

export function AriaCatalog() {
  return (
    <main className="nise-aria-catalog" id="catalog">
      <header className="nise-aria-catalog__intro">
        <p>NUMENA / NISE</p>
        <h1>React Aria catalog</h1>
        <p>
          Composable React Aria patterns, styled with Nise tokens. These recipes
          preserve Adobe’s API; the original Nise components remain available
          for common product tasks.
        </p>
        <p>
          React Aria Components 1.22.1 · {Object.keys(examples).length} recipes
          · Toast is experimental. All data is fictional.
        </p>
      </header>
      <div className="nise-aria-catalog__grid">
        {(Object.keys(examples) as CatalogFamily[]).map((family) => (
          <section
            key={family}
            className="nise-aria-catalog__tile"
            aria-label={`${family} recipe`}
          >
            <header>
              <h2>{family}</h2>
              <small>
                {family === "Toast" ? "Unstable upstream API" : "React Aria"}
              </small>
            </header>
            <CatalogExample family={family} />
          </section>
        ))}
      </div>
    </main>
  );
}

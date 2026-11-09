/* =============================================================================
   Table
   -----------------------------------------------------------------------------
   A plain, readable table for structured data with tabular numerals on numbers.

   Tokens consumed: --table-cell-padding-x, --table-cell-padding-y,
   --table-font-size, --table-header-font-size, plus surface/border/text tokens.
   ============================================================================= */

import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";

export interface TableRow {
  key?: string | number;
  cells: ReactNode[];
}

export interface TableProps {
  header: ReactNode[];
  rows: TableRow[];
  caption?: ReactNode;
  className?: string;
}

export function Table({ header, rows, caption, className }: TableProps) {
  return (
    <div
      className={cn(
        "nise-table__container w-full overflow-x-auto border border-solid border-border rounded-[var(--radius-lg)] bg-base-100",
        className,
      )}
    >
      <table className="nise-table w-full border-collapse font-sans text-[length:var(--table-font-size)] text-base-content">
        {caption ? (
          <caption className="nise-table__caption px-[var(--table-cell-padding-x)] py-[var(--space-2)] text-left text-[length:var(--font-size-xs)] text-text-muted border-b border-solid border-border">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr className="nise-table__row nise-table__row--header bg-base-200 border-b border-solid border-border">
            {header.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="nise-table__cell nise-table__cell--header px-[var(--table-cell-padding-x)] py-[var(--table-cell-padding-y)] text-left text-[length:var(--table-header-font-size)] font-[var(--font-weight-semibold)] uppercase tracking-[var(--letter-spacing-wide)] text-text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, r) => (
            <tr
              key={row.key ?? r}
              className="nise-table__row transition-colors duration-[var(--duration-fast)] hover:bg-base-hover"
            >
              {row.cells.map((c, i) => {
                const isNumeric = typeof c === "number";
                return (
                  <td
                    key={i}
                    className={cn(
                      "nise-table__cell px-[var(--table-cell-padding-x)] py-[var(--table-cell-padding-y)] align-middle",
                      isNumeric &&
                        "nise-table__cell--numeric text-right tabular-nums",
                    )}
                  >
                    {c}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

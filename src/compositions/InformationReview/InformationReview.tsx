/* =============================================================================
   Composition — Information review
   -----------------------------------------------------------------------------
   The reference composition: how the pieces fit together on a real surface, in
   this case the panel where a psychologist reviews the information behind a
   formulation. It exists to prove the system composes — it is UI only and holds
   no clinical logic.

   Two constraints from the brand shape it:
   · Colour never carries a verdict (color.md §4). The source-type badges are
     categorical; confidence is a neutral Select; nothing is tinted good or bad.
   · The serif does the reading, the sans does the interface (typography.md
     §3–§4): headings are serif, every control is sans.

   The content is synthetic. It is not a real person and must not be reused as
   sample clinical text.
   ============================================================================= */

import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Select } from "../../components/Select";
import { TextField } from "../../components/TextField";
import "./InformationReview.css";

export function InformationReview() {
  return (
    <div className="nise-info-review">
      <header className="nise-info-review__header">
        <h2 className="nise-info-review__title">Information review</h2>
        <p className="nise-info-review__note">
          Synthetic sample data for layout only — not a real client. No clinical
          logic runs on this surface.
        </p>
      </header>

      <div className="nise-info-review__grid">
        <Card
          heading="Session 4 · 12 May"
          description="Fortnightly review. Client described improved sleep onset."
          actions={<Badge tone="cyan">Collateral</Badge>}
        >
          <div className="nise-info-review__sources">
            <Badge tone="purple">Client report</Badge>
            <Badge tone="cyan">Collateral</Badge>
            <Badge tone="neutral">Observation</Badge>
          </div>

          <TextField
            label="Presenting concern"
            defaultValue="Sleep onset"
            name="presenting-concern"
          />

          <TextField
            label="Client's own words"
            defaultValue="I lie awake for about an hour most nights."
            name="client-words"
          />

          <Select
            label="Confidence"
            hint="Your confidence in this reading, not the client's."
            defaultValue="moderate"
            name="confidence"
            options={[
              { value: "low", label: "Low" },
              { value: "moderate", label: "Moderate" },
              { value: "high", label: "High" },
            ]}
          />
        </Card>

        <Card
          heading="Working formulation"
          description="Provisional. Revise as new information arrives."
          footer={
            <>
              <Button variant="ghost">Discard</Button>
              <Button variant="primary">Save draft</Button>
            </>
          }
        >
          <p className="nise-info-review__body">
            Sleep onset difficulty appears linked to anticipatory worry about the
            following day, which the client reports as most acute on weeknights.
          </p>

          <TextField
            label="Next question"
            placeholder="What to ask next session…"
            name="next-question"
          />
        </Card>
      </div>
    </div>
  );
}

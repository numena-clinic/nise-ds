/* =============================================================================
   Composition — Information review
   -----------------------------------------------------------------------------
   The reference composition: how the pieces fit together on a real surface, in
   this case the panel where a psychologist reviews the information behind a
   formulation. It exists to prove the system composes — it is UI only and holds
   no clinical logic.
   ============================================================================= */

import { Badge, Button, Card, Select, TextField } from "../../index";

export function InformationReview() {
  return (
    <div className="nise-info-review flex flex-col gap-[var(--space-6)] max-w-[var(--measure-prose)] p-[var(--space-8)] font-sans text-base-content bg-base-100">
      <header className="nise-info-review__header flex flex-col gap-[var(--field-label-gap)]">
        <h2 className="nise-info-review__title m-0 font-serif text-[length:var(--font-size-3xl)] font-[var(--font-weight-semibold)] leading-[var(--line-height-tight)] tracking-[var(--letter-spacing-tight)]">
          Information review
        </h2>
        <p className="nise-info-review__note m-0 text-[length:var(--font-size-sm)] leading-[var(--line-height-normal)] text-text-muted">
          Synthetic sample data for layout only — not a real client. No clinical
          logic runs on this surface.
        </p>
      </header>

      <div className="nise-info-review__grid grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-[var(--space-6)] items-start">
        <Card
          heading="Session 4 · 12 May"
          description="Fortnightly review. Client described improved sleep onset."
          actions={<Badge tone="cyan">Collateral</Badge>}
        >
          <div className="nise-info-review__sources flex flex-wrap gap-[var(--space-2)]">
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
          <p className="nise-info-review__body m-0 text-[length:var(--font-size-md)] leading-[var(--line-height-relaxed)]">
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

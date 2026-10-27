import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./Collapsible";
import { Button } from "../Button";
import { Card } from "../Card";
import { ChevronsUpDownIcon, ChevronDownIcon } from "../../icons";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  argTypes: {
    defaultOpen: { control: "boolean" },
    open: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "An interactive component which expands/collapses a panel. Matches the " +
          "shadcn/ui and Radix Collapsible API, supporting both controlled and " +
          "uncontrolled states, disabled state, and trigger composition with `asChild`.",
      },
    },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Demonstrates the canonical shadcn/ui collapsible pattern:
 * A header row with title and a compact trigger button using `asChild`,
 * an always-visible primary item, and hidden secondary items in `CollapsibleContent`.
 */
function ShadcnCardDemoExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ maxWidth: 350 }}>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: "var(--space-4)",
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-base-content)",
            }}
          >
            @peduarte starred 3 repositories
          </h4>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Toggle repository list"
              style={{
                width: 32,
                height: 32,
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronsUpDownIcon size={16} />
            </Button>
          </CollapsibleTrigger>
        </div>

        <div
          style={{
            padding: "var(--space-2) var(--space-4)",
            border: "var(--border-width) solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-base-100)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-mono, monospace)",
            color: "var(--color-base-content)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          @radix-ui/primitives
        </div>

        <CollapsibleContent
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
        >
          <div
            style={{
              padding: "var(--space-2) var(--space-4)",
              border: "var(--border-width) solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-base-100)",
              fontSize: "var(--font-size-sm)",
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--color-base-content)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            @radix-ui/colors
          </div>
          <div
            style={{
              padding: "var(--space-2) var(--space-4)",
              border: "var(--border-width) solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-base-100)",
              fontSize: "var(--font-size-sm)",
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--color-base-content)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export const Default: Story = {
  render: () => <ShadcnCardDemoExample />,
};

function ProductDetailsExample() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ maxWidth: 350 }}>
      <Card>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingInline: "var(--space-3)",
              }}
            >
              <span>Product details</span>
              <ChevronDownIcon
                size={16}
                style={{
                  transition: "transform var(--duration-fast) var(--ease-standard)",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  color: "var(--color-text-muted)",
                }}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent
            style={{
              paddingTop: "var(--space-2)",
              paddingInline: "var(--space-3)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            An open-source UI component library for building high-quality,
            accessible design systems and web apps.
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

export const ProductDetailsCard: Story = {
  render: () => <ProductDetailsExample />,
};

export const StandaloneTrigger: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Collapsible {...args} defaultOpen>
        <CollapsibleTrigger
          style={{
            color: "var(--color-primary)",
            fontWeight: "var(--font-weight-medium)",
            fontSize: "var(--font-size-sm)",
            cursor: "pointer",
          }}
        >
          Toggle session configuration notes
        </CollapsibleTrigger>
        <CollapsibleContent
          style={{
            paddingTop: "var(--space-2)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
          }}
        >
          Three templates ship with the clinic configuration: intake review,
          progress review and discharge session. Supervisors can edit the fields
          each template exposes.
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};

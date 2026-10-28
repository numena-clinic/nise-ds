/** All 30 shipped component families, composed from the public API.
 * Each tile is a live specimen. Modal, tooltip, accordion and form behavior
 * remains owned by the components, with no parallel showcase implementation.
 */
import { useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Alert,
  AspectRatio,
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  Checkbox,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Empty,
  Kbd,
  Label,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  Progress,
  Radio,
  Select,
  Separator,
  Skeleton,
  Slider,
  Switch,
  Table,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TextField,
  Textarea,
  Timeline,
  TimelineItem,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "../index";
import { CheckIcon, InfoIcon } from "../icons";
import "./showcase.css";

function Tile({
  name,
  number,
  wide,
  children,
}: {
  name: string;
  number: number;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`nise-gallery__tile ${wide ? "nise-gallery__tile--wide" : ""}`}
      aria-label={`${name} specimen`}
    >
      <header>
        <h2>{name}</h2>
        <span>{String(number).padStart(2, "0")}</span>
      </header>
      <div className="nise-gallery__specimen">{children}</div>
    </section>
  );
}
export function ComponentGallery() {
  const [slider, setSlider] = useState([60]);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  return (
    <TooltipProvider>
      <main className="nise-gallery">
        <header className="nise-gallery__header">
          <div className="nise-gallery__masthead">
            <span className="nise-workspace__brand">
              <img
                className="nise-workspace__symbol"
                src="./numena-symbol.svg"
                alt=""
              />
              nise
            </span>
            <span className="nise-showcase__eyebrow">
              Numena / Design system
            </span>
          </div>
          <div className="nise-gallery__intro">
            <div>
              <span className="nise-showcase__eyebrow">
                The component collection
              </span>
              <h1>
                Consistent by design.
                <br />
                <em>Considered in every detail.</em>
              </h1>
            </div>
            <p>
              A shared language for clinical tools.
              <br />
              Thirty component families, built with semantic tokens, accessible
              foundations, and room to compose.
            </p>
          </div>
          <div className="nise-gallery__legend">
            <span>
              <i />
              Live, interactive specimens
            </span>
            <span>01—30 / Nise v0.1</span>
          </div>
        </header>
        <div className="nise-gallery__grid">
          <Tile name="Button" number={1}>
            <div className="nise-gallery__row">
              <Button
                onClick={() => setMessage("Draft saved.")}
                leftIcon={<CheckIcon size={16} />}
              >
                Save draft
              </Button>
              <Button
                variant="secondary"
                onClick={() => setMessage("Review opened.")}
              >
                Review
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMessage("Changes discarded.")}
              >
                Discard
              </Button>
            </div>
            <p role="status" className="nise-gallery__muted">
              {message || "A clear hierarchy of actions."}
            </p>
          </Tile>
          <Tile name="Text field" number={2}>
            <TextField
              label="Session title"
              defaultValue="Making room for rest"
              hint="A useful point of reference."
            />
          </Tile>
          <Tile name="Select" number={3}>
            <Select
              label="Information source"
              defaultValue="client"
              options={[
                { value: "client", label: "Client report" },
                { value: "observation", label: "Observation" },
                { value: "collateral", label: "Collateral" },
              ]}
            />
          </Tile>
          <Tile name="Badge" number={4}>
            <div className="nise-gallery__row">
              <Badge tone="purple">Client report</Badge>
              <Badge tone="cyan">Collateral</Badge>
              <Badge tone="tangerine">Observation</Badge>
              <Badge tone="neutral">Draft</Badge>
            </div>
          </Tile>
          <Tile name="Card" number={5}>
            <Card
              heading="Room to reflect"
              description="A quiet container for related information."
            >
              <p className="nise-gallery__muted">
                Content, context, and a clear next step.
              </p>
            </Card>
          </Tile>
          <Tile name="Checkbox" number={6}>
            <Checkbox
              label="Include session summary"
              hint="Attach to the review copy."
              defaultChecked
            />
            <Checkbox label="Add follow-up questions" />
          </Tile>
          <Tile name="Radio" number={7}>
            <fieldset className="nise-gallery__fieldset">
              <legend>Session format</legend>
              <Radio name="gallery-format" label="In person" defaultChecked />
              <Radio name="gallery-format" label="Video call" />
            </fieldset>
          </Tile>
          <Tile name="Switch" number={8}>
            <Switch
              label="Appointment reminders"
              hint="A gentle nudge before each session."
              defaultChecked
            />
          </Tile>
          <Tile name="Slider" number={9}>
            <Slider
              label="Interface density"
              value={slider}
              onValueChange={setSlider}
              hint={`${slider[0]} of 100`}
            />
          </Tile>
          <Tile name="Tabs" number={10}>
            <Tabs defaultValue="overview">
              <TabsList aria-label="Gallery record sections">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <p className="nise-gallery__muted">
                  The whole picture, in one place.
                </p>
              </TabsContent>
              <TabsContent value="notes">
                <p className="nise-gallery__muted">
                  Details worth returning to.
                </p>
              </TabsContent>
            </Tabs>
          </Tile>
          <Tile name="Dialog" number={11}>
            <Dialog>
              <DialogTrigger className="nise-gallery__trigger">
                Review your draft <InfoIcon size={16} />
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>A moment to review</DialogTitle>
                <DialogDescription>
                  Your changes stay in this browser preview.
                </DialogDescription>
                <p>
                  Is the source clear? Have you separated observation from
                  interpretation?
                </p>
                <DialogClose asChild>
                  <Button>Back to collection</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </Tile>
          <Tile name="Tooltip" number={12}>
            <TooltipRoot>
              <TooltipTrigger className="nise-gallery__trigger">
                About information sources <InfoIcon size={16} />
              </TooltipTrigger>
              <TooltipContent>
                Sources describe where information came from.
              </TooltipContent>
            </TooltipRoot>
            <p className="nise-gallery__muted">
              Hover or focus for supporting detail.
            </p>
          </Tile>
          <Tile name="Table" number={13} wide>
            <Table
              caption="Recent sessions"
              header={["Session", "Date", "Format", "Record"]}
              rows={[
                {
                  key: "4",
                  cells: [
                    "04 · Making room for rest",
                    "28 Oct 2026",
                    "In person",
                    <Badge key="draft">Draft</Badge>,
                  ],
                },
                {
                  key: "3",
                  cells: [
                    "03 · Finding a steady rhythm",
                    "14 Oct 2026",
                    "Video call",
                    "Saved",
                  ],
                },
              ]}
            />
          </Tile>
          <Tile name="Alert" number={14}>
            <Alert variant="info" title="Your draft is private">
              Changes are visible only in this preview.
            </Alert>
          </Tile>
          <Tile name="Avatar" number={15}>
            <div className="nise-gallery__row">
              <Avatar fallback="MC" size="lg" />
              <Avatar fallback="AR" />
              <Avatar fallback="JL" size="sm" />
              <span className="nise-gallery__muted">
                A human point of reference.
              </span>
            </div>
          </Tile>
          <Tile name="Breadcrumb" number={16}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="./index.html?path=/story/portfolio-session-workspace--default"
                    target="_top"
                  >
                    Workspace
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Session 04</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Tile>
          <Tile name="Aspect ratio" number={17}>
            <AspectRatio ratio={16 / 9}>
              <div className="nise-gallery__ratio">
                <img
                  className="nise-workspace__symbol"
                  src="./numena-symbol.svg"
                  alt=""
                />
                <span>Space for what matters.</span>
                <small>16 : 9</small>
              </div>
            </AspectRatio>
          </Tile>
          <Tile name="Collapsible" number={18}>
            <Collapsible>
              <CollapsibleTrigger>Show supporting details</CollapsibleTrigger>
              <CollapsibleContent>
                <p className="nise-gallery__muted">
                  Context stays close without competing with the main content.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </Tile>
          <Tile name="Accordion" number={19}>
            <Accordion defaultValue="source">
              <AccordionItem value="source">
                <AccordionTrigger>What is a source?</AccordionTrigger>
                <AccordionContent>
                  Where a piece of information came from.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="context">
                <AccordionTrigger>Why keep context?</AccordionTrigger>
                <AccordionContent>
                  Meaning can change as a conversation develops.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Tile>
          <Tile name="Textarea" number={20}>
            <Textarea
              label="A note for next time"
              defaultValue="Return to what made the evenings feel different."
              rows={3}
            />
          </Tile>
          <Tile name="Toggle" number={21}>
            <Toggle>Show annotations</Toggle>
          </Tile>
          <Tile name="Toggle group" number={22}>
            <ToggleGroup label="Reading view" defaultValue="summary">
              <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
              <ToggleGroupItem value="detail">Detail</ToggleGroupItem>
            </ToggleGroup>
          </Tile>
          <Tile name="Progress" number={23}>
            <div className="nise-gallery__row">
              <span>Preparing export</span>
              <span className="nise-gallery__muted">68%</span>
            </div>
            <Progress value={68} aria-label="Preparing export" />
          </Tile>
          <Tile name="Skeleton" number={24}>
            <div
              className="nise-gallery__skeleton"
              aria-label="Decorative loading example"
            >
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </div>
            <p className="nise-gallery__muted">
              A steady layout while content arrives.
            </p>
          </Tile>
          <Tile name="Separator" number={25}>
            <p>Session context</p>
            <Separator />
            <p className="nise-gallery__muted">Supporting information</p>
          </Tile>
          <Tile name="Pagination" number={26}>
            <Pagination>
              <PaginationContent>
                {[1, 2, 3].map((value) => (
                  <PaginationItem key={value}>
                    <PaginationLink
                      href="#gallery-pages"
                      isActive={page === value}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(value);
                      }}
                    >
                      {value}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
            <p id="gallery-pages" className="nise-gallery__muted">
              Showing page {page} of 3.
            </p>
          </Tile>
          <Tile name="Empty" number={27}>
            <Empty
              title="A fresh page"
              description="Your next session will appear here."
            />
          </Tile>
          <Tile name="Timeline" number={28}>
            <Timeline aria-label="Record history">
              <TimelineItem
                title="Session completed"
                meta="10:50"
                variant="done"
              />
              <TimelineItem title="Draft saved" meta="11:02" variant="done" />
              <TimelineItem title="Review when ready" meta="Next step" />
            </Timeline>
          </Tile>
          <Tile name="Label" number={29}>
            <Label htmlFor="gallery-labelled-input">
              A visible starting point
            </Label>
            <input
              id="gallery-labelled-input"
              className="nise-gallery__native-input"
              placeholder="Labels stay when you type"
            />
          </Tile>
          <Tile name="Keyboard" number={30}>
            <div className="nise-gallery__row">
              <Kbd>Tab</Kbd>
              <span className="nise-gallery__muted">to move focus</span>
              <Kbd>Esc</Kbd>
              <span className="nise-gallery__muted">to dismiss</span>
            </div>
          </Tile>
        </div>
        <footer className="nise-gallery__footer">
          <span>One system. Many possibilities.</span>
          <span>Designed for Numena · Built with Nise</span>
        </footer>
      </main>
    </TooltipProvider>
  );
}

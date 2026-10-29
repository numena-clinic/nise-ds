/** Portfolio composition. Synthetic records; local UI state only.
 * Uses Nise's public component API and semantic tokens. Save/reset, session
 * selection and the review dialog are interactive; nothing leaves the browser.
 */
import { useState } from "react";
import {
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  Button,
  Checkbox,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TextField,
  Textarea,
  Timeline,
  TimelineItem,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "../index";
import { CheckIcon, InfoIcon, ChevronRightIcon } from "../icons";
import "./showcase.css";
import { numenaSymbol } from "./assets";

const INITIAL_NOTE =
  "Alex described a more settled evening routine this week. We explored which parts felt useful and which were difficult to sustain.";
const SESSIONS = [
  {
    number: "04",
    date: "28 October",
    title: "Making room for rest",
    time: "10:00–10:50",
    note: INITIAL_NOTE,
  },
  {
    number: "03",
    date: "14 October",
    title: "Finding a steady rhythm",
    time: "10:00–10:50",
    note: "We mapped the current weekly routine and identified opportunities to make space for rest.",
  },
  {
    number: "02",
    date: "30 September",
    title: "Understanding the everyday",
    time: "10:00–10:50",
    note: "Alex shared examples of everyday situations they would like to explore in future sessions.",
  },
];

interface Draft {
  note: string;
  nextStep: string;
  source: string;
  followUp: boolean;
}
const INITIAL_DRAFTS: Draft[] = SESSIONS.map((session) => ({
  note: session.note,
  nextStep: "Return to the evening routine",
  source: "session",
  followUp: false,
}));

export function SessionWorkspace() {
  const [sessionIndex, setSessionIndex] = useState(0);
  const session = SESSIONS[sessionIndex]!;
  const [savedDrafts, setSavedDrafts] = useState(INITIAL_DRAFTS);
  const [draft, setDraft] = useState(INITIAL_DRAFTS[0]!);
  const [announcement, setAnnouncement] = useState("");
  const { note, nextStep, source, followUp } = draft;
  const savedDraft = savedDrafts[sessionIndex]!;
  const dirty =
    note !== savedDraft.note ||
    nextStep !== savedDraft.nextStep ||
    source !== savedDraft.source ||
    followUp !== savedDraft.followUp;
  function updateDraft(change: Partial<Draft>) {
    setDraft((previous) => ({ ...previous, ...change }));
    setAnnouncement("");
  }
  function selectSession(index: number) {
    setSessionIndex(index);
    setDraft(savedDrafts[index]!);
    setAnnouncement("");
  }
  function save() {
    setSavedDrafts((previous) =>
      previous.map((saved, index) => (index === sessionIndex ? draft : saved)),
    );
    setAnnouncement("Draft saved for this preview.");
  }
  return (
    <TooltipProvider>
      <div className="nise-workspace">
        <header className="nise-workspace__top">
          <a className="nise-workspace__brand" href="#workspace-main">
            <img className="nise-workspace__symbol" src={numenaSymbol} alt="" />
            numena <span className="nise-workspace__edition">workspace</span>
          </a>
          <span className="nise-workspace__sample">
            Interactive preview · synthetic data
          </span>
          <div className="nise-workspace__profile">
            <span>Dr. Maya Chen</span>
            <Avatar fallback="MC" size="sm" />
          </div>
        </header>
        <div className="nise-workspace__layout">
          <aside
            className="nise-workspace__sidebar"
            aria-label="Client and sessions"
          >
            <span className="nise-showcase__eyebrow">Client workspace</span>
            <div className="nise-workspace__client">
              <Avatar fallback="AR" size="lg" />
              <div>
                <h2>Alex Rivera</h2>
                <p>Sample client · N–024</p>
              </div>
            </div>
            <div className="nise-workspace__side-heading">
              <h3>Sessions</h3>
              <span>2026</span>
            </div>
            <nav aria-label="Sessions" className="nise-workspace__sessions">
              {SESSIONS.map((item, index) => (
                <button
                  key={item.number}
                  type="button"
                  className={`nise-workspace__session ${sessionIndex === index ? "nise-workspace__session--active" : ""}`}
                  aria-current={sessionIndex === index ? "page" : undefined}
                  onClick={() => selectSession(index)}
                >
                  <span className="nise-workspace__session-number">
                    {item.number}
                  </span>
                  <span>
                    <strong>{item.date}</strong>
                    <small>{item.title}</small>
                  </span>
                  <ChevronRightIcon size={16} />
                </button>
              ))}
            </nav>
            <div className="nise-workspace__sidebar-note">
              <InfoIcon size={20} />
              <p>A little space to see the whole picture.</p>
            </div>
            <p className="nise-workspace__privacy">
              Demo only. Drafts reset when you reload. Switching sessions
              discards unsaved edits.
            </p>
          </aside>
          <main id="workspace-main" className="nise-workspace__main">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    Alex Rivera / Session {session.number}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="nise-workspace__page-heading">
              <div>
                <span className="nise-showcase__eyebrow">
                  Session {session.number} · {session.date} 2026
                </span>
                <h1>{session.title}</h1>
                <p>
                  A place for what was said, what you noticed, and what comes
                  next.
                </p>
              </div>
              <Badge tone="purple">Individual session</Badge>
            </div>
            <Tabs defaultValue="notes">
              <TabsList aria-label="Session sections">
                <TabsTrigger value="notes">Session notes</TabsTrigger>
                <TabsTrigger value="context">Client context</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="notes">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    save();
                  }}
                >
                  <section
                    className="nise-workspace__document"
                    aria-labelledby="note-heading"
                  >
                    <div className="nise-workspace__document-heading">
                      <div>
                        <span className="nise-showcase__eyebrow">
                          01 / Capture
                        </span>
                        <h2 id="note-heading">In their own words</h2>
                      </div>
                      <TooltipRoot>
                        <TooltipTrigger
                          aria-label="About session notes"
                          className="nise-workspace__info"
                        >
                          <InfoIcon size={20} />
                        </TooltipTrigger>
                        <TooltipContent>
                          Separate the client's account from your
                          interpretation.
                        </TooltipContent>
                      </TooltipRoot>
                    </div>
                    <p className="nise-workspace__instruction">
                      Keep the detail that matters. Leave room for uncertainty.
                    </p>
                    <Textarea
                      label="Session summary"
                      value={note}
                      onChange={(event) => {
                        updateDraft({ note: event.target.value });
                        setAnnouncement("");
                      }}
                      rows={7}
                    />
                    <div className="nise-workspace__form-row">
                      <Select
                        label="Information source"
                        value={source}
                        onValueChange={(source) => updateDraft({ source })}
                        options={[
                          { value: "session", label: "Client report" },
                          {
                            value: "observation",
                            label: "Session observation",
                          },
                          {
                            value: "collateral",
                            label: "Collateral information",
                          },
                        ]}
                      />
                      <TextField
                        label="Next session focus"
                        value={nextStep}
                        onChange={(event) =>
                          updateDraft({ nextStep: event.target.value })
                        }
                      />
                    </div>
                    <Checkbox
                      label="Bring this focus into the next session"
                      checked={followUp}
                      onChange={(event) =>
                        updateDraft({ followUp: event.target.checked })
                      }
                    />
                    <footer className="nise-workspace__save-bar">
                      <div
                        className="nise-workspace__save-state"
                        role="status"
                        data-saved={
                          announcement === "Draft saved for this preview." ||
                          undefined
                        }
                      >
                        {announcement === "Draft saved for this preview." && (
                          <CheckIcon
                            className="nise-workspace__saved-check"
                            size={16}
                          />
                        )}
                        {announcement ||
                          (dirty ? "Unsaved changes" : "Draft up to date")}
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          disabled={!dirty}
                          onClick={() => {
                            setDraft(savedDraft);
                            setAnnouncement("Changes discarded.");
                          }}
                        >
                          Discard changes
                        </Button>
                        <Button
                          type="submit"
                          disabled={!dirty}
                          leftIcon={<CheckIcon size={16} />}
                        >
                          Save draft
                        </Button>
                      </div>
                    </footer>
                  </section>
                </form>
              </TabsContent>
              <TabsContent value="context">
                <section className="nise-workspace__document">
                  <span className="nise-showcase__eyebrow">Client context</span>
                  <h2>A conversation in progress</h2>
                  <p>
                    Alex is exploring the relationship between their daily
                    routine and opportunities for rest. This fictional record
                    illustrates information hierarchy; it makes no clinical
                    assessment.
                  </p>
                  <h3>What matters to Alex</h3>
                  <p>
                    More time with family. A sustainable pace at work. Evenings
                    with fewer obligations.
                  </p>
                </section>
              </TabsContent>
              <TabsContent value="activity">
                <section className="nise-workspace__document">
                  <h2>Session activity</h2>
                  <Timeline aria-label="Session activity">
                    <TimelineItem
                      title="Session started"
                      meta="10:00"
                      variant="done"
                    />
                    <TimelineItem
                      title="Notes opened"
                      meta="10:04"
                      variant="done"
                    />
                    <TimelineItem title="Review draft" meta="Next step" />
                  </Timeline>
                </section>
              </TabsContent>
            </Tabs>
          </main>
          <aside className="nise-workspace__rail" aria-label="Session context">
            <section>
              <span className="nise-showcase__eyebrow">At a glance</span>
              <h2>Today's session</h2>
              <dl className="nise-workspace__facts">
                <div>
                  <dt>Time</dt>
                  <dd>{session.time}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>In person</dd>
                </div>
                <div>
                  <dt>Record</dt>
                  <dd>Private draft</dd>
                </div>
              </dl>
            </section>
            <section className="nise-workspace__quote">
              <span className="nise-showcase__eyebrow">A thread to follow</span>
              <blockquote>
                “I want my evenings to feel like my own again.”
              </blockquote>
              <p>Fictional client quote · Session 03</p>
            </section>
            <section>
              <span className="nise-showcase__eyebrow">02 / Reflect</span>
              <h2>Before you finish</h2>
              <p>
                What changed? What remains unclear? What would be useful to
                return to?
              </p>
              <Dialog>
                <DialogTrigger className="nise-workspace__review-link">
                  Review session <ChevronRightIcon size={16} />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review session {session.number}</DialogTitle>
                    <DialogDescription>
                      This preview keeps changes in browser memory only.
                    </DialogDescription>
                  </DialogHeader>
                  <p>{note || "No summary added yet."}</p>
                  <p>
                    <strong>Next focus:</strong> {nextStep || "Not set"}
                  </p>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">Back to notes</Button>
                    </DialogClose>
                    <DialogClose asChild onPress={save}>
                      <Button>Save draft</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </section>
          </aside>
        </div>
        <footer className="nise-workspace__bottom">
          <span>Built with Nise Design System</span>
          <span>Thoughtful tools for thoughtful practice.</span>
        </footer>
      </div>
    </TooltipProvider>
  );
}

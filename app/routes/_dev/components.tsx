import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  Card,
  ColorPicker,
  Input,
  ProgressBar,
  Select,
  Slider,
  Tabs,
  Textarea,
  Toggle,
  ToggleGroup,
  Tooltip,
} from "~/components/ui";

export const Route = createFileRoute("/_dev/components")({
  component: ComponentsPage,
  head: () => ({ meta: [{ title: "Brand-It — Component Gallery" }] }),
});

function ComponentsPage() {
  const [toggle, setToggle] = useState(false);
  const [toneGroup, setToneGroup] = useState("professional");
  const [color, setColor] = useState("#ff4801");
  const [slider, setSlider] = useState(60);
  const [inputVal, setInputVal] = useState("");
  const [textareaVal, setTextareaVal] = useState("");

  return (
    <div className="max-w-5xl mx-auto px-8 py-12 space-y-16">
      <header className="space-y-2">
        <h1>Brand-It Component Gallery</h1>
        <p className="text-cf-text-muted">
          Visual baseline for the CF Workers design system. Every primitive in every state.
        </p>
      </header>

      {/* ── Buttons ───────────────────────────────────────────── */}
      <Section title="Buttons">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" loading>
            Loading
          </Button>
          <Button variant="ghost" disabled>
            Disabled
          </Button>
        </Row>
        <Row>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </Row>
      </Section>

      {/* ── Cards ─────────────────────────────────────────────── */}
      <Section title="Cards">
        <Row wrap>
          <Card className="w-64">
            <h6 className="mb-1">Default Card</h6>
            <p className="text-sm text-cf-text-muted">
              Corner brackets auto-inject at the four outer corners.
            </p>
          </Card>
          <Card interactive className="w-64">
            <h6 className="mb-1">Interactive Card</h6>
            <p className="text-sm text-cf-text-muted">
              Hover to see border go dashed. No scale, no shadow lift.
            </p>
          </Card>
          <Card padding="lg" className="w-64">
            <h6 className="mb-1">Large Padding</h6>
            <p className="text-sm text-cf-text-muted">p-8 padding variant.</p>
          </Card>
        </Row>
      </Section>

      {/* ── Form Inputs ───────────────────────────────────────── */}
      <Section title="Form Inputs">
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <Input
            label="Company name"
            placeholder="Acme Corp"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <Input label="Website" placeholder="https://example.com" type="url" />
          <Input label="With error" placeholder="..." error="This field is required" />
          <Input label="With hint" placeholder="..." hint="Used in co-branded assets" />
        </div>
        <div className="max-w-xl mt-6">
          <Textarea
            label="Boilerplate copy"
            placeholder="Enter your company description…"
            maxLength={800}
            rows={5}
            value={textareaVal}
            onChange={(e) => setTextareaVal(e.target.value)}
          />
        </div>
        <div className="max-w-xs mt-6">
          <Select
            label="Asset type"
            options={[
              { value: "one-pager", label: "One-pager" },
              { value: "solution-brief", label: "Solution brief" },
              { value: "email-banner", label: "Email banner" },
              { value: "announcement", label: "Announcement" },
            ]}
          />
        </div>
      </Section>

      {/* ── Colour ────────────────────────────────────────────── */}
      <Section title="Colour Picker">
        <ColorPicker label="Primary colour" value={color} onChange={setColor} />
      </Section>

      {/* ── Toggle + ToggleGroup ──────────────────────────────── */}
      <Section title="Toggle &amp; Toggle Group">
        <Row>
          <Toggle label="Auto-save" checked={toggle} onChange={setToggle} />
          <Toggle label="Disabled (on)" checked={true} onChange={() => {}} disabled />
          <Toggle label="Disabled (off)" checked={false} onChange={() => {}} disabled />
        </Row>
        <ToggleGroup
          label="Tone"
          value={toneGroup}
          onChange={setToneGroup}
          items={[
            { value: "professional", label: "Professional" },
            { value: "conversational", label: "Conversational" },
            { value: "technical", label: "Technical" },
            { value: "executive", label: "Executive" },
          ]}
        />
      </Section>

      {/* ── Slider ────────────────────────────────────────────── */}
      <Section title="Slider">
        <div className="max-w-sm">
          <Slider label="AI budget" value={slider} onChange={setSlider} />
        </div>
      </Section>

      {/* ── Progress bar ──────────────────────────────────────── */}
      <Section title="Progress Bar">
        <div className="max-w-sm space-y-4">
          <ProgressBar label="Export progress" value={75} showValue />
          <ProgressBar value={30} size="sm" />
          <ProgressBar value={100} label="Complete" showValue />
        </div>
      </Section>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <Section title="Tabs">
        <Tabs defaultValue="form" className="max-w-lg">
          <Tabs.List>
            <Tabs.Trigger value="form">Form</Tabs.Trigger>
            <Tabs.Trigger value="chat">Chat</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="form" className="pt-6">
            <p className="text-sm text-cf-text-muted">Form tab content goes here.</p>
          </Tabs.Content>
          <Tabs.Content value="chat" className="pt-6">
            <p className="text-sm text-cf-text-muted">Chat tab content goes here.</p>
          </Tabs.Content>
        </Tabs>
      </Section>

      {/* ── Tooltip ───────────────────────────────────────────── */}
      <Section title="Tooltip">
        <Row>
          <Tooltip content="Saved 2s ago">
            <Button variant="ghost" size="sm">
              Hover me (top)
            </Button>
          </Tooltip>
          <Tooltip content="Export to PDF or PNG" side="bottom">
            <Button variant="ghost" size="sm">
              Hover me (bottom)
            </Button>
          </Tooltip>
          <Tooltip content="Opens colour palette" side="right">
            <Button variant="ghost" size="sm">
              Hover me (right)
            </Button>
          </Tooltip>
        </Row>
      </Section>

      {/* ── Typography ────────────────────────────────────────── */}
      <Section title="Typography">
        <div className="space-y-4">
          <h1>Page heading (h1) — 36 px / 500 / -0.035em</h1>
          <h2>Section heading (h2) — 36 px / 500 / -0.035em</h2>
          <h3>Sub-section (h3) — 30 px / 500 / -0.02em</h3>
          <h6>Card title (h6) — 18 px / 500</h6>
          <p>Body copy — 16 px / 500 / -0.03em. The quick brown fox jumps over the lazy dog.</p>
          <p className="text-cf-text-muted text-sm">Muted body — text-cf-text-muted.</p>
          <p className="text-cf-text-subtle text-xs">Subtle — placeholders, tertiary.</p>
          <p className="font-mono text-sm">Mono — Saved 2s ago · 800/800 chars · v1.2.3</p>
          <p className="font-mono text-xs uppercase tracking-widest text-cf-orange">RECOMMENDED</p>
        </div>
      </Section>

      {/* ── Colour tokens ─────────────────────────────────────── */}
      <Section title="Colour Tokens">
        <div className="flex flex-wrap gap-3">
          {[
            ["bg-cf-orange", "#FF4801"],
            ["bg-cf-bg-page", "#F5F1EB"],
            ["bg-cf-bg-100", "#FFFBF5"],
            ["bg-cf-bg-200", "#FFFDFB"],
            ["bg-cf-bg-300", "#FEF7ED"],
          ].map(([cls, hex]) => (
            <div key={cls} className="flex flex-col items-center gap-1.5">
              <div className={`h-12 w-24 rounded-input border border-cf-border ${cls}`} />
              <span className="font-mono text-xs text-cf-text-muted">{cls}</span>
              <span className="font-mono text-xs text-cf-text-subtle">{hex}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h3 className="border-b border-cf-border pb-3">{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function Row({ children, wrap = false }: { children: React.ReactNode; wrap?: boolean }) {
  return (
    <div className={`flex items-center gap-4 ${wrap ? "flex-wrap" : ""} mb-4 last:mb-0`}>
      {children}
    </div>
  );
}

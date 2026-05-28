# Brand-It — MVP Build Plan

**Repo:** `https://gitlab.cfdata.org/tim.seiffert/brand-it` (single repo, SSH push, `main` is the trunk)
**Owners:** Cara Maguire (Global Partner Marketing) · Tim Seiffert (Solutions Engineering — technical lead)
**Status:** MVP scope locked
**Platform:** Cloudflare Developer Platform — end to end. No third-party services in the runtime path.
**Deploys:** Cloudflare Workers Builds Integration. Every push to `main` builds and deploys automatically; feature branches get preview URLs.

---

## 1. What Brand-It Is

Brand-It is a self-service web tool that lets Cloudflare channel partners produce co-branded marketing assets — one-pagers, solution briefs, email banners — without designer help.

A partner logs in, picks a template, fills a structured form (brand kit values auto-populate), optionally asks the in-app AI to refine copy, then exports a finished PDF or PNG.

The MVP bar is deliberately narrow:

> **A new partner can land on the site, complete their brand kit, pick a template, customise it with AI help, and download a polished PDF — in under 10 minutes, with output they would be proud to send to a customer.**

Everything in this document serves that sentence. If a feature does not, it is in §15 (Post-MVP).

---

## 2. Product Principles (UX-First)

These are non-negotiable. Every implementation choice below traces back to one of them.

1. **It must feel like a designer-built marketing product, not an internal tool.** Same visual language as `workers.cloudflare.com` and `r2-calculator.cloudflare.com` — warm cream backgrounds, warm brown text, orange accent, generous whitespace, FT Kunst Grotesk typography, signature corner-bracket decorations on cards, pill-shaped buttons, dashed-border hover states. Never pure white, never pure black, never grey-on-grey IT-tooling vibe.
2. **The first 60 seconds decide everything.** Login → brand kit → first asset preview. No empty states without a next action. No dead-end errors.
3. **Auto-save and auto-fill, always.** Partners never lose work. They never re-enter what the system already knows.
4. **AI is one click away, never in the way.** Chat is a tab, not the default. Tone-rewrite is a small sparkle next to each field. The form is the primary surface.
5. **WYSIWYG between editor preview and export.** The preview is the same React render that produces the PDF. No surprises at download time.
6. **Brand-safe by construction.** Partners cannot accidentally produce off-brand output. Cloudflare product names are preserved verbatim by the AI. The output dimensions are template-fixed.

---

## 3. MVP Scope

### In scope

- 3 to 5 hand-built templates authored via the **dual-layer contract** (Markdown content + TSX layout — see §7)
- A simple co-brandable PDF as the first template
- Brand kit: logo, three colours, boilerplate, tagline, contact info
- Form-driven editor with live preview
- AI chat assistant + per-field tone rewrite — **Workers AI only**
- Translation: English → German, French, Spanish (one-click, glossary-preserved)
- PDF and PNG export
- Cloudflare Access (OTP email) authentication
- Single light theme
- **Workers Builds Integration** wired to the GitLab repo for automatic deploys on push to `main`

### Explicitly out of scope (see §17)

Real-time multi-user collaboration · approval workflows · drag-and-drop canvas editor · in-app template authoring UI · AI-generated TSX templates (deferred to v2) · knowledge file upload · per-partner AI Search · Salesforce/CRM integration · dark mode · mobile editor · PPTX export · 9-language expansion · personalised catalog thumbnails

---

## 4. Architecture

One main Worker handles the SSR frontend, API routes, and WebSocket connections. A second small Worker handles export rendering inside a Container. That is the entire deployment.

```
┌────────────────────────────────────────────────────────────┐
│                   brand-it (Worker)                         │
│  TanStack Start  ·  Hono API routes  ·  Agents SDK WS      │
│                                                             │
│   PartnerSession DO        EditorSession DO                 │
│   (1 per partner)          (1 per draft)                    │
│   · brand kit cache        · chat history                   │
│   · AI budget counter      · BrandVars draft                │
│   · draft index            · WS broadcast                   │
│   · monthly reset alarm    · 24h idle flush alarm           │
│                                                             │
│  Bindings:                                                  │
│   D1 · R2 (assets, exports) · KV (caches) · Workers AI     │
│   AI Gateway · Queues · Analytics Engine · Flagship · Access│
└──────────┬───────────────────────────┬─────────────────────┘
           │ Queue                       │ Service binding
           ▼                             ▼
  ┌──────────────────────┐    ┌──────────────────────────┐
  │  brand-it-export     │    │  D1 · R2                  │
  │  Container (2/2/5)   │    │                           │
  │  Vite SSR →           │    │  Customisations,         │
  │  Browser Rendering   │    │  partners, brand kits,    │
  │  → PDF / PNG         │    │  exported assets          │
  │  SSE progress to DO  │    │                           │
  └──────────────────────┘    └──────────────────────────┘
```

### Why two Durable Object classes

| DO | Purpose | Lifetime |
|---|---|---|
| **PartnerSession** (one per partner) | Owns partner-scoped hot state: brand kit cache, AI budget counter, Flagship gate evaluation, draft index. Single source of truth for "what is true about this partner right now." | Hibernates between requests. Monthly cron alarm resets AI budget. |
| **EditorSession** (one per draft) | Owns one customisation's working state: chat history, BrandVars draft, WebSocket connections from any open editor tabs. Streams AI tokens directly to the client. | Hibernates between turns. 24h idle alarm flushes draft to D1 and self-destructs. |

This split keeps per-request work cheap (no need to load every draft to check the AI budget) and isolates editor concurrency cleanly.

---

## 5. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **TanStack Start** ^1.132 | SSR on Workers via `@cloudflare/vite-plugin` |
| UI approach | **Tailwind v4 + CF Workers design tokens** | No component library. Custom thin component layer (`Button`, `Card`, `Input`, etc.) built on the design tokens in §5a. The aesthetic must match `workers.cloudflare.com`. |
| React | 19.x | |
| Styling | **Tailwind CSS v4** | Via `@tailwindcss/vite`. Tokens declared in `styles.css` under `@theme { ... }` and as CSS custom properties. **No `tailwind.config.js`.** |
| Motion | `motion` ^12 | Tree-shakable (~15 KB). Used for page entrance, stagger, button press, progress fills |
| Icons | `lucide-react` or `@phosphor-icons/react` | 20px or 24px, stroke-width 1.5. Match outline style |
| Routing | TanStack Router (file-based) | Server loaders for auth-gated data |
| Fonts | Self-hosted `.woff2` | FT Kunst Grotesk 400/500, Apercu Mono Pro 400. **No Google Fonts CDN.** |
| Lint/Format | **Biome** ^2 | Single tool, Rust-fast |
| Build | Vite ^7 | `@cloudflare/vite-plugin` |
| Runtime | Cloudflare Workers | Single Worker for app + API + WS |
| Database | **D1** | Relational metadata |
| Object storage | **R2** | Logos, exports |
| Cache | **KV** | Translation cache, R2 presigned-URL cache |
| AI | **Workers AI via AI Gateway** | `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. Gateway ID `brand-it`. **Workers AI is the only LLM provider.** No Anthropic, no OpenAI, no partner-supplied keys. |
| Queues | Cloudflare Queues | Export jobs |
| Containers | `@cloudflare/sandbox` | Export Worker only, `standard-1` instance type (1 vCPU / 2 GB / 4 GB disk) |
| Browser Rendering | `BROWSER` binding | PDF/PNG capture in export Worker |
| Real-time | **Agents SDK** (`agents` pkg) | `EditorSession extends Agent`, `@callable()` typed RPC, hibernation, alarms |
| Auth | **Cloudflare Access** | OTP email policy |
| Analytics | **Workers Analytics Engine** | Typed event classes |
| Feature flags | **Flagship** | `FLAGS` binding from day one |

---

## 5a. Design System — CF Workers Aesthetic

Brand-It uses the same visual language as `workers.cloudflare.com` and `r2-calculator.cloudflare.com`. This is the source of polish — adhered to strictly, the product reads as designer-built; deviated from, it reads as another internal tool.

### Core rules (non-negotiable)

1. **Never pure white** (`#FFFFFF`). Always warm cream (`#FFFBF5`).
2. **Never pure black** (`#000000`). Always warm brown (`#521000`).
3. **Buttons are always fully rounded** — `border-radius: 9999px`. No exceptions.
4. **Cards carry corner-bracket decorations** — four 8 × 8 px rounded squares at the outer corners (top-left, top-right, bottom-left, bottom-right), offset `-4px`, bordered `1px solid #EBD5C1`, filled `#FFFBF5`.
5. **Hover state on interactive borders is dashed**, not solid colour change. Buttons, cards, and use-case tiles all swap `border-style: solid` → `dashed` on hover.
6. **Headings use `font-medium` (500), never bold (700).**
7. **Body uses `font-weight: 500` with `letter-spacing: -0.03em`** as default — the design's "tight grotesk" feel.

### Color tokens

```css
:root {
  /* Primary */
  --cf-orange:        #FF4801;
  --cf-orange-hover:  #FF7038;
  --cf-orange-light:  rgba(255, 72, 1, 0.1);

  /* Text */
  --cf-text:          #521000;             /* primary */
  --cf-text-muted:    rgba(82, 16, 0, 0.6); /* secondary */
  --cf-text-subtle:   rgba(82, 16, 0, 0.38); /* placeholders, tertiary */

  /* Backgrounds */
  --cf-bg-page:       #F5F1EB;             /* outer/page */
  --cf-bg-100:        #FFFBF5;             /* primary surface */
  --cf-bg-200:        #FFFDFB;             /* cards */
  --cf-bg-300:        #FEF7ED;             /* hover */

  /* Borders */
  --cf-border:        #EBD5C1;
  --cf-border-light:  rgba(235, 213, 193, 0.5);

  /* Semantic */
  --cf-success:       #16A34A;
  --cf-warning:       #EAB308;
  --cf-error:         #DC2626;

  /* Shadows */
  --shadow-card:      0 1px 3px rgba(82,16,0,0.04), 0 4px 12px rgba(82,16,0,0.02);
  --shadow-focus:     0 0 0 3px rgba(255, 72, 1, 0.2);

  /* Motion */
  --ease-button:      cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-entrance:    cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast:    150ms;
  --duration-normal:  200ms;
}
```

A dark-mode token set is defined in `styles.css` for post-MVP. Light theme only ships at MVP.

### Typography

```css
--font-sans: 'FT Kunst Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Apercu Mono Pro', 'SF Mono', 'Fira Code', monospace;
```

| Role | Size | Weight | Tracking | Where |
|---|---|---|---|---|
| Page heading (`h1`/`h2`) | 30 – 36 px | 500 | `-0.035em` | Page hero, editor asset title |
| Section heading (`h3`) | 24 – 30 px | 500 | `-0.02em` | Brand kit section headings |
| Card title (`h6`) | 18 px | 500 | normal | Asset card titles, panel headings |
| Body | 14 – 16 px | 400 – 500 | `-0.03em` default | Everything else |
| Mono | 12 – 14 px | 400 | normal | Numeric values, character counts, "Saved 2s ago" |
| Uppercase label | 12 px | 500 | `0.05em` | "RECOMMENDED", category chips |

### Spacing (4 px base)

```
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 96
```

| Context | Value |
|---|---|
| Section gap (parent flex `gap-section`) | 48 / 64 / 80 (mobile / lg / xl) |
| Horizontal page padding (`px-section`) | 8 / 16 / 24 / 32 (sm / md / lg / xl) |
| Card padding | 24 (`p-6`) to 32 (`p-8`) |
| Form-field gap | 24 |
| Label → input gap | 8 |
| Button padding | 12 × 24 (py-3 px-6) |

### Border radius

| Element | Value |
|---|---|
| Buttons, pills, badges, progress bars | `9999px` (full) |
| Cards, panels | `12px` |
| Inputs, selects | `8px` |
| Hero sections (desktop) | `16px` |

### Signature decorative elements

| Element | Description |
|---|---|
| **Corner brackets** | Four `8 × 8 px` rounded squares (`border-radius: 1.5px`) at the corners of every elevated container. Position absolute, offset `-4px`. Border `1px solid var(--cf-border)`. Fill `var(--cf-bg-100)`. Place on the outer wrapper, never on individual nested cards. |
| **Dot pattern** | `12 × 12 px` SVG grid of `0.75px`-radius circles in `var(--cf-border)`. Used as page background gutter texture, ~10% opacity. |
| **Dashed vertical guide lines** | `1px` wide, `linear-gradient` with `1px × 32px` repeat for the dash. Pinned at 1200 px (inner) and 1480 px (outer) container edges on desktop. |
| **Dashed-border hover** | Cards and outline buttons swap `border-style: solid` → `dashed` on hover. No colour change, no scale, no shadow lift. |

### Component vocabulary (Brand-It surfaces)

| Component | Default | Hover | Active | Focus |
|---|---|---|---|---|
| Primary button | `bg-#FFFBF5 / text-#FF4801 / border-#FFFBF5` | `bg-transparent / border-dashed-#FF4801` | `scale(0.98) + translateY(1px)` | `box-shadow: 0 0 0 3px rgba(255,72,1,0.3)` |
| Secondary button (on orange) | `bg-#FF4801 / text-white` | `opacity-95 / border-dashed-white/50` | `scale(0.98) + translateY(1px)` | ring 3 px |
| Ghost button | `bg-transparent / text-#FF4801 / border-#EBD5C1` | `border-dashed-#FF4801 / text-#521000` | `scale(0.98)` | ring 3 px |
| Card | `bg-#FFFDFB / border-#EBD5C1 / radius-12 / shadow-card` + corner brackets | optional `bg-#FEF7ED` | — | — |
| Input | `bg-#FFFDFB / border-#EBD5C1 / radius-8` | — | — | `border-#FF4801 / shadow-focus` |
| Slider track | `linear-gradient(to right, #FF4801 [value]%, #EBD5C1 [value]%)` | — | thumb `cursor: grab` → `grabbing` | thumb shadow lift |
| Toggle group (segmented) | unselected: `bg-#FFFDFB / text-#521000`. selected: `bg-#FF4801 / text-white` | unselected hover: `bg-#FEF7ED` | — | ring 3 px |

### Motion presets

```ts
export const pageEntrance = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export const sectionSlideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const buttonInteraction = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.98, y: 1, transition: { duration: 0.16, ease: [0.55, 0.085, 0.68, 0.53] } },
};
```

Rules: no magnetic-follow effects, no tilt, no glow borders, no shimmer overlays, no heavy drop shadows. Motion is direct and physical — a button feels pressed; a card never "grows."

### File layout

```
app/src/styles/
├── tokens.css       # CSS custom properties (light theme + dark theme tokens declared)
├── base.css         # Reset, body defaults, focus-visible, ::selection
└── app.css          # Tailwind v4 @theme block + imports above

app/src/components/ui/
├── Button.tsx
├── Card.tsx           # Wraps content + auto-injects four corner brackets
├── Input.tsx
├── Textarea.tsx
├── Select.tsx
├── ColorPicker.tsx
├── Slider.tsx
├── Toggle.tsx
├── ToggleGroup.tsx
├── ProgressBar.tsx
├── Tabs.tsx
└── Tooltip.tsx
```

The `ui/` layer is intentionally thin — each component is 30–80 lines of TSX. There is no third-party component library to maintain, version, or theme-skin. The tokens are the source of truth; components are uniformly styled consumers of those tokens.

---

## 6. Data Model (D1)

```sql
CREATE TABLE partners (
  id            TEXT PRIMARY KEY,
  company_name  TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  access_emails TEXT NOT NULL,                -- JSON array
  tier          TEXT NOT NULL DEFAULT 'standard',
  ai_budget     INTEGER NOT NULL DEFAULT 500, -- per-month AI call ceiling
  ai_used       INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE brand_kits (
  id              TEXT PRIMARY KEY,
  partner_id      TEXT NOT NULL UNIQUE REFERENCES partners(id),
  logo_key        TEXT,                       -- R2 key
  primary_color   TEXT DEFAULT '#FF4801',
  secondary_color TEXT DEFAULT '#000000',
  accent_color    TEXT DEFAULT '#FFFFFF',
  boilerplate     TEXT,
  tagline         TEXT,
  contact_name    TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  website_url     TEXT,
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE assets (
  id                TEXT PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  description       TEXT,
  type              TEXT NOT NULL,            -- 'one-pager' | 'solution-brief' | 'email-banner' | 'announcement'
  tags              TEXT,                     -- JSON array
  template_key      TEXT NOT NULL,            -- maps to templates/ directory
  thumbnail_key     TEXT,                     -- R2 key, static for MVP
  brand_vars_schema TEXT NOT NULL,            -- JSON-serialised Zod schema
  status            TEXT NOT NULL DEFAULT 'active',
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE customisations (
  id              TEXT PRIMARY KEY,
  partner_id      TEXT NOT NULL REFERENCES partners(id),
  asset_id        TEXT NOT NULL REFERENCES assets(id),
  brand_vars_json TEXT NOT NULL,              -- current draft state
  status          TEXT NOT NULL DEFAULT 'draft',
  last_export_key TEXT,
  renderer_version TEXT,                      -- bumped to invalidate export cache atomically
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE translation_cache (
  source_hash TEXT NOT NULL,                  -- sha256(source)
  source_lang TEXT NOT NULL DEFAULT 'en',
  target_lang TEXT NOT NULL,
  translated  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (source_hash, source_lang, target_lang)
);

CREATE TABLE events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id  TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  payload     TEXT,                           -- JSON
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX events_partner_time ON events(partner_id, created_at);
```

---

## 7. Template Authoring Contract — Dual-Layer

Brand-It separates **content** (what a marketer edits) from **design** (what a developer or AI produces). Each template is two co-located files:

| Layer | File | Editor | Concerns |
|---|---|---|---|
| **Content** | `content.md` | Content creators, marketers | Field schema · default copy · labels · validation rules · brand-kit auto-fill mappings |
| **Design** | `Template.tsx` | Engineers (MVP), AI (post-MVP) | Layout · alignment · typography · spacing · brand application |

Plus two static files:

| File | Purpose |
|---|---|
| `meta.json` | `{ title, description, type, tags[], defaultLanguage }` |
| `thumbnail.png` | 600 × 400 static catalog thumbnail |

A build-time compiler (`scripts/compile-templates.ts`) reads each `content.md` and produces a generated `brand-vars.ts` next to it. The TSX imports the types and defaults from this generated file — it never sees the Markdown directly. This keeps the runtime fast and fully typed.

### Why two layers

Content creators want to change wording without touching code. Engineers want to control layout without renegotiating copy every iteration. AI (post-MVP, §17) wants a stable, structured target to generate against. The split solves all three:

- **You edit `content.md`** → wording changes, defaults update, types regenerate, TSX still renders. Workers Builds deploys on push.
- **An engineer edits `Template.tsx`** → layout changes, content schema is unchanged.
- **AI v2 generates `Template.tsx`** from the `content.md` + a design brief, against the shared CF Workers design tokens (§5a). The Markdown layer is the durable interface.

### `content.md` schema

```markdown
---
title: "Cloudflare One Solution Brief"
type: one-pager                    # one-pager | solution-brief | email-banner | announcement
format: pdf                        # output format hint for the catalog
size: A4                           # A4 | Letter | Custom
orientation: portrait              # portrait | landscape
tags: [zero-trust, sase, partner]
brandVars:
  headline:
    type: string
    label: "Headline"
    maxLength: 60
    required: true
  subheadline:
    type: string
    label: "Sub-headline"
    maxLength: 120
  bodyText:
    type: text                     # multi-line
    label: "Body copy"
    maxLength: 800
  partnerLogo:
    type: image
    fromBrandKit: "logo"           # auto-populated from brand kit
  partnerColor:
    type: color
    fromBrandKit: "primary_color"
  partnerName:
    type: string
    fromBrandKit: "company_name"
  contactEmail:
    type: string
    fromBrandKit: "contact_email"
---

# Default headline text

Default sub-headline copy.

Default body paragraph one.

Default body paragraph two.
```

The Markdown body provides default values for each text/textarea field, in declaration order. Image and colour defaults come from `fromBrandKit` mappings; literal defaults can also be supplied in the frontmatter as `default: "..."`.

Supported `type` values: `string`, `text`, `enum` (with `options: [...]`), `color`, `image`, `boolean`.

### `Template.tsx` contract

```tsx
import type { BrandVars } from './brand-vars';   // generated from content.md

export default function Template({ vars }: { vars: BrandVars }) {
  return (
    <article className="a4-portrait flex flex-col items-center px-16 py-20 bg-cf-bg-100">
      <header className="w-full flex justify-between items-center mb-12">
        <img data-var="partnerLogo" src={vars.partnerLogo} className="h-12" />
        <CFLogo className="h-10" />
      </header>

      <h1 data-var="headline"
          className="text-5xl font-medium text-cf-text text-center mb-4"
          style={{ letterSpacing: '-0.035em' }}>
        {vars.headline}
      </h1>

      <p data-var="subheadline"
         className="text-xl text-cf-text-muted text-center mb-12 max-w-2xl">
        {vars.subheadline}
      </p>

      <p data-var="bodyText"
         className="text-base text-cf-text whitespace-pre-wrap leading-relaxed">
        {vars.bodyText}
      </p>

      <footer className="mt-auto w-full flex justify-between text-sm text-cf-text-muted">
        <span data-var="partnerName">{vars.partnerName}</span>
        <span data-var="contactEmail">{vars.contactEmail}</span>
      </footer>
    </article>
  );
}
```

### Data-var contract (validated in CI)

Every editable element in `Template.tsx` carries `data-var="<key>"` matching a key in the `content.md` `brandVars` schema. The compiler enforces:

1. Every `data-var` references a declared schema key
2. Every required schema key has at least one `data-var` element in the TSX
3. The TSX renders cleanly against the Markdown-derived `defaultBrandVars` (smoke render in jsdom)
4. No element uses raw Tailwind colour classes — all colours come through CF design tokens (`text-cf-text`, etc.) — see §15

This contract is the foundation for the v2 overlay editor (click an element on the preview to edit it) and for AI-assisted TSX generation, without locking the MVP into either.

### Workflow per template (MVP)

You — or anyone with repo access — adds a new template by:

1. `git checkout -b template/cf-one-partner-brief`
2. Create `templates/cf-one-partner-brief/content.md` with the frontmatter + default body copy
3. Create `templates/cf-one-partner-brief/Template.tsx` with the layout
4. Add a `meta.json` and a `thumbnail.png`
5. Run `pnpm dev` locally — preview at `/_dev/templates/cf-one-partner-brief`
6. `git push` → Workers Builds deploys a preview URL within ~60 seconds
7. Merge to `main` → live on the partner-facing app

No database seed, no admin UI, no out-of-band step. The repo is the source of truth for what templates exist.

---

## 8. EditorSession DO (Agents SDK)

```typescript
import { Agent, callable } from "agents";

interface EditorState {
  customisationId: string;
  chatHistory: ChatMessage[];
  brandVarsDraft: BrandVars | null;
}

export class EditorSession extends Agent<Env, EditorState> {

  @callable()
  async updateBrandVars(patch: Partial<BrandVars>): Promise<BrandVars> {
    const merged = { ...this.state.brandVarsDraft, ...patch } as BrandVars;
    this.setState({ ...this.state, brandVarsDraft: merged });
    this.broadcast({ type: "VARS_UPDATED", vars: merged });
    return merged;
  }

  @callable()
  async sendChatMessage(content: string): Promise<void> {
    // Streams Workers AI tokens via this.broadcast()
    // Extracts structured BrandVars patches from the final response
    // for one-click "Apply"
  }

  @callable()
  async saveDraft(): Promise<void> {
    await this.flushToD1();
    this.broadcast({ type: "SAVED", at: new Date().toISOString() });
  }

  async onAlarm(): Promise<void> {
    await this.flushToD1();   // 24h idle flush
  }
}
```

### Chat system prompt — layered, deterministic

1. **Role:** "You are a marketing copywriter helping a Cloudflare channel partner customise a co-branded asset."
2. **Locked glossary** (see §13) — Cloudflare product names that must be preserved verbatim.
3. **Asset context:** template type, title, description.
4. **Current BrandVars:** so the AI knows what is already filled.
5. **Partner context:** company name, boilerplate, tagline.
6. **Output contract:** "When suggesting text changes, return them as a JSON object whose keys are BrandVars field names. Only include keys you are changing."

The output contract turns natural-language suggestions into structured patches. The client renders an "Apply" button per suggested field — one click and the form + preview update.

---

## 9. AI — Workers AI Only

Brand-It uses **Cloudflare Workers AI exclusively**. No external LLM providers. No partner-supplied API keys. Every model call is one binding away and one wrangler edit from swapping models.

```jsonc
"ai": {
  "binding": "AI",
  "gateway": { "id": "brand-it" }
}
```

AI Gateway is enabled from day one:

- Logs every request (debugging + cost visibility)
- Caches identical `(text, tone)` and translation inputs (20–40% call reduction in practice)
- Provides a fallback model slot if the primary is briefly unavailable

### Model selection (MVP)

| Use case | Model | Why |
|---|---|---|
| Chat, tone-rewrite, translation | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Strong copywriting quality, fast inference, fp8 keeps cost low |
| Fallback | `@cf/meta/llama-3.1-70b-instruct-fast` | One-line swap if primary degrades |

### Three AI surfaces

1. **Chat tab** — streamed via `EditorSession` over WebSocket. Suggests structured field patches.
2. **Tone rewrite** — sparkle icon next to each text field. Tone picker: Professional / Conversational / Technical / Executive. Endpoint: `POST /api/ai/tone-rewrite`.
3. **Translate** — language picker in the top bar. Translates every text field in BrandVars in one request, preserving glossary terms. Endpoint: `POST /api/ai/translate`. Cached in D1 + KV; AI Gateway adds a third cache layer.

### Budget enforcement

Every AI call increments `partners.ai_used` via the `PartnerSession` DO. The DO checks `ai_used < ai_budget` before issuing the call. Monthly reset via a scheduled Worker (`0 0 1 * *`). Over-budget partners see an inline notice — never a stack trace.

---

## 10. Routes

| Route | Purpose |
|---|---|
| `/` | Redirects to `/library` (or `/brand-kit` for first-time partners) |
| `/library` | Asset catalog |
| `/editor/$id` | The editor |
| `/brand-kit` | Brand kit CRUD |

### `/library` — Asset Catalog

Sits on the warm cream page background, with the signature dot-pattern + dashed vertical guide-line gutters visible on desktop. The page is bounded by a single bordered wrapper at `max-width: 1200px` with corner brackets at the four outer corners.

Inside the wrapper, a responsive grid of asset cards:

- Card: `bg-#FFFDFB`, `border: 1px solid #EBD5C1`, `border-radius: 12px`, `shadow-card`, with corner brackets at each outer corner
- Inside the card: 600 × 400 thumbnail, asset title in FT Kunst Grotesk 500 (`h6`, 18 px), a type chip (one-pager / brief / banner / announcement) in mono uppercase, two-line description in `text-muted`
- "Resume draft" pill in orange-on-orange-light if a draft exists for this `(partner, asset)` pair
- Hover: card border swaps `solid` → `dashed`. No scale, no shadow lift.

Filters above the grid: a type dropdown and a row of tag chips. Both execute as D1 queries through the server loader on selection — no client-side filtering, no stale results. Filter changes use a 200 ms fade transition on the grid.

Clicking a card either resumes the existing draft or creates a new `customisations` row pre-populated from the brand kit, then navigates to `/editor/$id`.

**Empty state — no brand kit yet:** the grid is dimmed to 40% opacity and pointer-events disabled. A centred panel sits over it with corner brackets, a short headline ("Set up your brand kit first"), one sentence of body, and one orange primary button ("Set up brand kit → "). One direction, no decisions.

### `/editor/$id` — The Editor

The product centrepiece. Layout:

```
┌───────────────────────────────────────────────────────────────┐
│  ← Library    Asset Title         [Save]  [Export ▾]  [EN ▾]  │
├──────────────────────────┬────────────────────────────────────┤
│  420 px sidebar          │                                    │
│  ┌─ Form ──┬─ Chat ──┐   │                                    │
│  │  Auto   │ Streaming│   │      Live preview (iframe)        │
│  │  -gen   │ AI       │   │      React template rendered      │
│  │  fields │ messages │   │      client-side                  │
│  │         │ + input  │   │                                    │
│  └─────────┴─────────┘   │      Scales to panel width         │
│                          │                                    │
└──────────────────────────┴────────────────────────────────────┘
```

**Form tab** — auto-generated from `BrandVarsSchema`:

| Schema type | UI component | Notes |
|---|---|---|
| short `string` | `Input` | Single-line, `border-radius: 8px`, right-aligned for numeric, left-aligned for text |
| long `string` | `Textarea` | Mono character-count badge in the bottom-right corner of the field |
| enum `string` | `Select` | Custom-styled, chevron icon, `bg-#FEF7ED` for the chevron well |
| `color` | `ColorPicker` | Hex input + 32 × 32 visual swatch with corner brackets |
| `image` | Upload zone | Dashed border on idle, `border-dashed-#FF4801` on drag-over, direct-to-R2 presigned upload |
| `boolean` | `Toggle` | Pill switch, off `bg-#EBD5C1`, on `bg-#FF4801`, 20 px thumb with shadow |

On every change, the field calls `editorSession.updateBrandVars({ key: value })`. The DO merges, broadcasts `VARS_UPDATED`, the preview iframe receives the patch via `postMessage`, re-renders. Round-trip target: under 100 ms. Every text field has a small sparkle icon flush-right at label height — click opens a popover tone picker (segmented `ToggleGroup`: Professional / Conversational / Technical / Executive). The popover itself is a card with corner brackets.

**Chat tab** — message list + composer at the bottom. AI assistant messages render in a card with corner brackets, partner messages render right-aligned in `bg-#FEF7ED`. Each AI response with structured patches renders one "Apply" pill per suggested field (orange-on-orange-light, full-rounded, dashed-border-on-hover). Messages stream token-by-token with a single blinking caret. Composer is a textarea with a circular orange send button.

Empty state: a friendly intro line plus three example prompts as ghost buttons, e.g.:
- "Tighten the headline"
- "Translate to German"
- "Make this more action-oriented"

**Preview panel** — sandboxed `<iframe>` that renders the React template with current BrandVars passed via `postMessage`. Same component used in export, so what you see is exactly what you download. CSS `transform: scale()` keeps the canvas proportional to the panel width. The iframe sits inside a bordered container with corner brackets; the background of the preview frame is the warm cream so transparent template areas blend naturally.

**Top bar** — sticky, 64 px tall, `bg-#FFFBF5`, bottom border `1px solid #EBD5C1`. Left: a small ghost "← Library" link. Center: asset title (`h6`, 18 px). Right: Save button (ghost, with mono "Saved 2s ago" microcopy that fades in then out after success), Export dropdown (primary orange pill), Language picker (ghost button showing current language code in mono).

### `/brand-kit` — Brand Kit

A single scrollable page inside a 1200 px bordered wrapper with corner brackets. Four sections, each titled with a section `h3` (24 px, weight 500, tracking `-0.02em`), separated by `48px` vertical gap.

1. **Logo.** A dashed-border drop zone (`border-style: dashed`, `border-color: #EBD5C1`, swaps to `#FF4801` on drag-over). Drag-and-drop or click. Upload goes directly to R2 via a Worker-generated presigned URL — the file never passes through Worker memory. Preview shown immediately on a checkered transparency background. A small ghost "Remove" button appears below once uploaded.
2. **Colours.** Three colour pickers in a row: primary, secondary, accent. Each is a 64 × 64 px swatch with corner brackets, with the hex value in mono underneath in an `Input`. Clicking the swatch opens an inline colour palette popover.
3. **Company details.** Name, tagline, boilerplate (textarea, mono char count), contact name, email, phone, website. Two-column grid on desktop, stacked on mobile, `gap-6` between fields.
4. **Save state — no Save button.** Every field auto-saves on blur. A persistent pill anchored bottom-right of the viewport reads "All changes saved" in mono with a subtle green dot. On save in flight, the dot pulses; on error, it turns red with one-line recovery copy.

No wizard. No multi-step. Partners fill what they have and return when they have more. The page entrance uses `pageEntrance` motion preset; sections animate in on scroll via `sectionSlideUp`.

---

## 11. Export Pipeline

A separate `brand-it-export` Worker, triggered through Cloudflare Queues, runs the export Container.

### Flow

1. Partner clicks `Export → PDF`.
2. `EditorSession` calls `saveDraft()` (flushes BrandVars to D1).
3. Main Worker computes the **cache key**: `sha256(template_key + renderer_version + brand_vars_json + format)`. Checks R2 — cache hit serves the existing file in under a second.
4. Cache miss: enqueue export message.
5. Export Worker spins up a Container (`standard-1`: 1 vCPU / 2 GB / 4 GB disk).
6. Container runs Vite SSR on the template with BrandVars, then Browser Rendering captures the rendered HTML as PDF or PNG.
7. Result is written to R2 keyed by the cache key. `customisations.last_export_key` is updated.
8. Export Worker sends an SSE-style progress event back to `EditorSession`, which broadcasts `EXPORT_COMPLETE` with a download URL to all connected clients.

### Container image — built and pinned, not built at deploy

The container image is built ahead of time, tagged `sha-<short-sha>` (or `sha-<short-sha>-dirty` for uncommitted work), pushed to the registry, and its digest is pinned in `wrangler.jsonc`. Deploys are config-only — no Docker required in CI runners. A small script auto-detects when the `Dockerfile` or template runtime has changed and rebuilds only then.

### Cache invalidation

Bump `RENDERER_VERSION` in env when the template runtime changes. Every cached export is invalidated atomically — no manual sweep, no stale assets. Bumping is a one-line PR.

### Failure modes (handled)

| Failure | Behaviour |
|---|---|
| Container cold start delay | Progress bar in the modal; partners see "Preparing render…" copy, not a frozen UI |
| Browser Rendering timeout | Auto-retry once via queue redelivery, then surface a specific error |
| SSE connection drop after artifact already cached | Client falls back to a direct `GET /api/exports/$id` endpoint and shows a one-line toast: "Recovered your download." |
| Over-budget export | Queue message is rejected upfront; partner sees an inline notice in the export modal, not a 500 |

---

## 12. Authentication

Cloudflare Access with email OTP. Policy: only emails listed in the partner's `access_emails` array can reach `/`.

Every request:

1. Validate `CF-Access-JWT-Assertion`, extract the `email` claim.
2. Hono middleware (`partner.ts`) maps email → D1 `partners` row → injects `{ partner, partnerId }` into the request context.
3. All route handlers and server loaders read partner context from `c.get("partner")`.
4. Tier-gated operations check `partner.tier` in the same middleware.

No partner can ever see another partner's data — the partner ID is derived server-side from the JWT, never trusted from the client.

---

## 13. Glossary (Locked Cloudflare Terms)

```typescript
export const LOCKED_TERMS = [
  'Cloudflare',
  'Cloudflare One',
  'Cloudflare Zero Trust',
  'Cloudflare Access',
  'Cloudflare Gateway',
  'Cloudflare Tunnel',
  'Cloudflare WARP',
  'Magic WAN',
  'Magic Transit',
  'Cloudflare Workers',
  'Workers AI',
  'R2',
  'D1',
  'Cloudflare Pages',
  'Cloudflare CDN',
  'Argo Smart Routing',
  'Cloudflare WAF',
  'Bot Management',
  'DDoS Protection',
  // Extended list maintained by Partner Marketing
] as const;
```

Injected into every AI system prompt:

> The following Cloudflare product names must be preserved verbatim in all output. Never paraphrase, abbreviate, or reword them: `${LOCKED_TERMS.join(', ')}`

Verified by a post-generation regex check on chat output and tone-rewrite results. If a locked term has been altered, the response is re-issued once with an explicit correction prompt; if it fails again, the original (pre-AI) text is preserved and the partner is notified.

---

## 14. Wrangler Configuration (Main Worker)

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "brand-it",
  "compatibility_date": "2026-04-03",
  "compatibility_flags": ["nodejs_compat"],
  "main": "src/worker-entry.ts",
  "observability": {
    "enabled": true,
    "logs":   { "enabled": true, "invocation_logs": true },
    "traces": { "enabled": true }
  },
  "upload_source_maps": true,

  "d1_databases": [
    { "binding": "DB", "database_name": "brand-it-db", "database_id": "..." }
  ],
  "r2_buckets": [
    { "binding": "ASSETS",  "bucket_name": "brand-it-assets"  },
    { "binding": "EXPORTS", "bucket_name": "brand-it-exports" }
  ],
  "kv_namespaces": [
    { "binding": "CACHE", "id": "..." }
  ],
  "ai": {
    "binding": "AI",
    "gateway": { "id": "brand-it" }
  },
  "queues": {
    "producers": [
      { "binding": "EXPORT_QUEUE", "queue": "brand-it-export" }
    ]
  },
  "analytics_engine_datasets": [
    { "binding": "EVENTS", "dataset": "brand-it-events" }
  ],
  "durable_objects": {
    "bindings": [
      { "name": "PARTNER_SESSION", "class_name": "PartnerSession" },
      { "name": "EDITOR_SESSION",  "class_name": "EditorSession"  }
    ]
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["PartnerSession", "EditorSession"] }
  ],
  "flagship": [
    { "binding": "FLAGS", "app_id": "..." }
  ],
  "vars": {
    "RENDERER_VERSION": "1"
  },
  "triggers": {
    "crons": ["0 0 1 * *"]    // monthly AI-budget reset
  }
}
```

---

## 15. CI & Quality Gates

CI runs on every push to GitLab (via `.gitlab-ci.yml`) **and** Workers Builds runs in parallel on push to `main` to deploy. The two pipelines complement each other: GitLab CI is the quality gate; Workers Builds is the delivery channel.

Every push runs:

1. `biome check` — lint + format
2. `tsc --noEmit` — type check
3. `vitest run` — unit tests
4. `scripts/compile-templates.ts` — for every `templates/<slug>/content.md`, regenerate `brand-vars.ts`, validate frontmatter schema, and confirm the generated TypeScript compiles
5. `scripts/validate-templates.ts` — template authoring contract:
   - every `data-var` in `Template.tsx` matches a key in the generated schema
   - every required schema key has at least one `data-var` element
   - `Template.tsx` renders cleanly against `defaultBrandVars` in jsdom
6. `scripts/validate-design-tokens.ts` — fails if any source file uses `#FFFFFF`, `#000000`, raw Tailwind colour classes (`bg-blue-*`, `text-gray-*`, etc.), or non-pill `rounded-*` on `<button>` elements. The guardrail for design-system drift.
7. `vite build` — build verification
8. Container image digest check — confirms the pinned export-container digest exists in the registry

If any step fails, Workers Builds does not promote the new version to the production hostname.

Visual regression on the MVP templates is added in week 2 — Playwright + pixel diff against committed reference PNGs of each template rendered with `defaultBrandVars`. This is the safety net for the WYSIWYG promise.

A separate visual regression suite for the app shell (library, brand-kit, editor empty state) captures the design tokens at the UI level — corner brackets render, dashed-hover triggers correctly, fonts load.

---

## 15a. Deployment Workflow — GitLab + Workers Builds

The repo is `https://gitlab.cfdata.org/tim.seiffert/brand-it`. Two automated pipelines run on every push:

| Pipeline | Trigger | Purpose |
|---|---|---|
| **GitLab CI** (`.gitlab-ci.yml`) | Every push to any branch | Lint, typecheck, tests, template + design-token validators. Quality gate. |
| **Cloudflare Workers Builds** | Every push to `main` (production) and feature branches (preview) | Build + deploy the Worker. Delivery channel. |

### Workers Builds setup (one-time, manual)

1. In the Cloudflare dashboard, account `39255306`: **Workers & Pages → Connect to Git → GitLab → authorise → select `tim.seiffert/brand-it`**.
2. Build configuration:
   - Build command: `pnpm install && pnpm build`
   - Deploy command: `pnpm wrangler deploy`
   - Root directory: `/`
   - Node version: 20
3. Set environment variables / secrets in the dashboard (none needed at week 1; AI Gateway and Flagship IDs added when those bindings exist).

After this, the loop is:

```
local edit → git push origin main → Workers Builds deploys → live in <60s
                                  → GitLab CI runs in parallel → fails MR if quality gate breaks
```

Feature branches get preview URLs at `<branch>-brand-it.<account>.workers.dev`, useful for showing Cara work-in-progress without merging.

### Local dev loop

```bash
pnpm install
pnpm dev               # Vite + Wrangler local dev — http://localhost:3000
pnpm test              # Vitest
pnpm check             # biome + tsc + template validators
pnpm templates:compile # regenerate brand-vars.ts from content.md
```

### Branch policy (MVP phase)

- Push to `main` directly. Solo-driven, MVP velocity prioritised over review ceremony.
- Use feature branches for in-progress visual work that needs a preview URL but shouldn't deploy to production.
- Once a second contributor joins, switch to MRs with required `biome` + `tsc` + template-validator checks before merge.

### Bindings provisioning

All Workers bindings (D1, R2, KV, AI Gateway, Analytics Engine, Flagship) are declared in `wrangler.jsonc`. Provisioning is one-time per environment, scripted in `scripts/setup-bindings.sh`:

```bash
pnpm wrangler d1 create brand-it-db
pnpm wrangler r2 bucket create brand-it-assets
pnpm wrangler r2 bucket create brand-it-exports
pnpm wrangler kv namespace create brand-it-cache
# AI Gateway: created via dashboard (gateway ID: brand-it)
# Analytics Engine dataset: implicit on first writeDataPoint()
# Flagship: app_id provided by Flagship team
```

IDs returned by these commands are pasted into `wrangler.jsonc` and committed.

---

## 16. Observability

Every meaningful action is captured as a typed event class:

```typescript
class EditorOpenedEvent       extends AnalyticsEngineEvent { /* partnerId, assetSlug */ }
class VarsUpdatedEvent        extends AnalyticsEngineEvent { /* partnerId, customisationId, keys */ }
class ChatMessageSentEvent    extends AnalyticsEngineEvent { /* partnerId, tokensIn, tokensOut */ }
class ChatSuggestionApplied   extends AnalyticsEngineEvent { /* partnerId, fields */ }
class ToneRewriteRequested    extends AnalyticsEngineEvent { /* partnerId, tone, cached */ }
class TranslationRequested    extends AnalyticsEngineEvent { /* partnerId, targetLang, cached */ }
class ExportRequestedEvent    extends AnalyticsEngineEvent { /* partnerId, assetSlug, format */ }
class ExportCompletedEvent    extends AnalyticsEngineEvent { /* partnerId, format, durationMs, cacheHit */ }
class BrandKitUpdatedEvent    extends AnalyticsEngineEvent { /* partnerId, fields */ }
```

D1 insert + WAE `writeDataPoint()` on every event. Typed classes guarantee schema consistency, enabling Grafana dashboards from day one — adoption funnel, AI cost per partner, export latency P50/P95, cache hit rate.

---

## 17. Post-MVP (Designed, Deferred)

Architecturally ready, deliberately not in scope.

| Feature | Path |
|---|---|
| **AI-assisted TSX template authoring** | A `/admin/templates/generate` flow: author writes a brief + edits `content.md`, AI generates the matching `Template.tsx` against the shared CF Workers design tokens and the dual-layer contract (§7). The compiler validates the generated TSX against the Markdown schema. Author reviews, AI iterates via chat, the final TSX is committed as a PR. Markdown layer stays unchanged. |
| **In-app content editor for `content.md`** | A `/admin/templates/$slug` page lets content creators edit Markdown frontmatter and body copy in-app, with live preview. Saves write to the repo via a GitLab API integration — keeping the repo as source of truth. |
| Overlay editor (click an element on preview to edit) | `data-var` contract is in place; overlay is a UI layer on top |
| Knowledge file upload (per-partner context for AI) | R2 + Flagship gate already wired; needs upload UI + prompt injection |
| AI full-template copy rewrite | Wrap in Cloudflare Workflows for durable multi-step plan + glossary verification |
| Personalised catalog thumbnails | Same Container + Browser Rendering pipeline as export, scheduled nightly |
| Per-partner AI Search index | Workers AI Vectorize, single namespace per partner |
| PPTX export | Add a second renderer pass in the export Container using `pptxgenjs` |
| 9-language translation | Add language codes; pipeline unchanged |
| Approval workflow | `customisations.status` column ready (`draft → pending → approved → exported`) |
| Real-time multi-user collab | `EditorSession` DO already broadcasts to all WS clients; needs presence + permission check |
| Dark mode | Dark-mode token set already declared in `tokens.css`; needs QA + toggle UI + system-preference detection script |
| Reporting UI in-app | WAE + D1 events captured from day one; route reads aggregations |
| Salesforce-driven personalisation | Add CRM context source to the EditorSession system prompt |

---

## 18. Six-Week MVP Plan

| Week | Focus | Demoable artefact |
|---|---|---|
| 1 | Repo scaffold, design tokens + base UI components, Markdown→TSX template compiler (§7), `/_dev/components` route, `/_dev/templates/$slug` preview route, Workers Builds wired up, README + AUTHORING docs, first template (`content.md` + `Template.tsx`) renders against defaults | Push-to-deploy works. A live preview URL shows the first co-brandable PDF rendered on-brand with default values. |
| 2 | D1 migrations, CF Access auth, partner context middleware, brand kit CRUD with direct-to-R2 logo upload, library page, customisation creation, basic form-driven editor with live preview | Partner can fill brand kit, pick a template, see brand kit values populated, edit fields |
| 3 | `PartnerSession` + `EditorSession` DOs + Agents SDK + chat tab with Workers AI streaming + tone rewrite | Partner can ask the AI for help and apply suggestions |
| 4 | Export pipeline: Container, Browser Rendering, Queues, R2 etag cache, SSE progress + `-download` fallback | Partner can export a polished PDF |
| 5 | Translation, two more templates, glossary enforcement, visual regression tests, observability events | Partner can produce three asset types in four languages |
| 6 | Polish: motion, microcopy, empty states, error states, accessibility audit, staging deployment, pilot-partner onboarding | Ready for first 3 pilot partners |

---

## 19. Definition of Done (MVP)

- A partner with no prior context can land on the site, complete their brand kit, customise an asset with AI assistance, and download a polished PDF in under 10 minutes.
- Every export is visually indistinguishable from a designer-built asset at PDF quality.
- The AI never paraphrases a locked Cloudflare product name.
- Auto-save is silent, instant, and never lost.
- Every page load is under 1.5 seconds on the partner's first visit, under 400ms on subsequent visits.
- 100% Cloudflare Developer Platform — no third-party runtime dependencies in the request path.
- Three pilot partners successfully produce and use at least one co-branded asset each.

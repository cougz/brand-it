# Next Steps — Resume Here

This document captures exactly where Brand-It stands at the moment scaffolding begins, and the concrete actions for the next coding session. Read [PLAN.md](./PLAN.md) first.

---

## Current State

- Repo created at `https://gitlab.cfdata.org/tim.seiffert/brand-it`
- Plan committed (PLAN.md)
- No code yet — empty repo with `PLAN.md`, `README.md`, `NEXT-STEPS.md` only
- Local clone authored as `Tim Seiffert <tim.seiffert@cloudflare.com>`
- Push protocol: SSH, direct to `main`

---

## Confirmed Decisions (no need to re-ask)

| Question | Answer |
|---|---|
| Repo | `https://gitlab.cfdata.org/tim.seiffert/brand-it` (single repo, SSH) |
| Branch policy | Push to `main` directly during MVP |
| Author identity | `Tim Seiffert <tim.seiffert@cloudflare.com>` |
| Package manager | `pnpm` |
| Cloudflare account ID | `39255306` |
| LLM | Workers AI only — no Anthropic, no OpenAI, no partner-supplied keys |
| Framework | TanStack Start (SSR on Workers) |
| UI approach | Tailwind v4 + CF Workers design tokens, custom thin component layer — no third-party component library |
| Template authoring | Dual-layer: `content.md` (Markdown) + `Template.tsx` (TSX). Hand-authored in MVP. AI-generated TSX deferred to v2. |
| Deploy | Cloudflare Workers Builds Integration on push to `main` |
| First template | A simple co-brandable PDF (brief still to be confirmed — see Open Questions below) |

---

## Open Questions Before First Commit

None blocking the scaffold. The scaffold can land without these; they unblock specific later steps.

| Question | When needed | Owner |
|---|---|---|
| Brief for the first PDF template (2–3 sentences + format/size + reference design) | Before Week 1 day 5 | Tim |
| FT Kunst Grotesk + Apercu Mono Pro `.woff2` files | Before pilot (Week 5) | Brand team |
| Cloudflare logo SVG variants | Before pilot (Week 5) | Brand team |
| Three pilot-partner emails | Week 6 | Cara |

---

## Cloudflare-Side Setup (Tim's actions)

Two things only Tim can do from the Cloudflare dashboard. Neither blocks the first commit — but step 1 must happen before Workers Builds can deploy, and step 2 before the app authenticates anyone.

### 1. Connect Workers Builds to the GitLab repo

Account `39255306` → **Workers & Pages → Connect to Git → GitLab → authorise → select `tim.seiffert/brand-it`**.

Build configuration:
- Build command: `pnpm install && pnpm build`
- Deploy command: `pnpm wrangler deploy`
- Root directory: `/`
- Node version: 20

After this, every push to `main` deploys automatically. Feature branches get preview URLs at `<branch>-brand-it.<account>.workers.dev`.

### 2. Create the Cloudflare Access policy

Account `39255306` → **Zero Trust → Access → Applications → Add → Self-hosted**.

- Application domain: TBD (likely `brand-it.workers.dev` initially, `brandit.cfdata.org` later)
- Policy: include only `tim.seiffert@cloudflare.com` for now (open up later for pilot partners)
- Auth method: One-time PIN via email

### 3. Provision bindings (Tim runs locally or grants API token)

Tim can run these interactively after `pnpm wrangler login`:

```bash
pnpm wrangler d1 create brand-it-db
pnpm wrangler r2 bucket create brand-it-assets
pnpm wrangler r2 bucket create brand-it-exports
pnpm wrangler kv namespace create brand-it-cache
```

AI Gateway namespace `brand-it`: create via dashboard (Workers AI → AI Gateway → Create gateway).

Flagship app: request from Flagship team, paste `app_id` into `wrangler.jsonc` once issued.

IDs returned by these commands paste into `wrangler.jsonc` and get committed.

---

## Week 1 Deliverable — What the Next Session Builds

Reference: PLAN.md §18 row 1.

By end of Week 1 there is a live, on-brand "Hello brand-it" shell deployed via Workers Builds, with the template authoring pipeline working end-to-end.

### Scaffold

- `package.json` with TanStack Start + Vite + Tailwind v4 + Biome + Hono + Zod
- `tsconfig.json`, `vite.config.ts`, `wrangler.jsonc`, `biome.jsonc`
- `.gitignore`, `.gitlab-ci.yml`
- `src/` directory tree following PLAN.md §4 monorepo layout

### Design system foundation (PLAN.md §5a)

- `src/styles/tokens.css` — full CF Workers token block (colours, typography, spacing, motion, shadows)
- `src/styles/base.css` — reset, body defaults, focus-visible, ::selection
- `src/styles/app.css` — Tailwind v4 `@theme` block referencing tokens
- Self-hosted fonts in `public/fonts/` (placeholder until real `.woff2` files arrive)

### UI component layer (PLAN.md §5a)

`src/components/ui/`:
- `Button.tsx` (primary, secondary, ghost, icon, loading) — always pill, dashed-border-hover
- `Card.tsx` — auto-injects four corner brackets
- `Input.tsx`, `Textarea.tsx`, `Select.tsx`
- `Toggle.tsx`, `ToggleGroup.tsx`
- `ColorPicker.tsx`, `Slider.tsx`, `ProgressBar.tsx`
- `Tooltip.tsx`, `Tabs.tsx`

Every component renders in every state on the dev route below.

### Routes

- `src/routes/__root.tsx` — shell, font loading, page background (dot pattern + dashed guide lines, hidden on mobile)
- `src/routes/index.tsx` — placeholder homepage; redirects to `/library` once auth lands
- `src/routes/_dev/components.tsx` — visual baseline showing every UI primitive in every state
- `src/routes/_dev/templates/$slug.tsx` — server-side render the named template against `defaultBrandVars`

### Template compiler (PLAN.md §7)

- `scripts/compile-templates.ts` — reads each `templates/<slug>/content.md`, parses frontmatter + body, generates `brand-vars.ts`
- `scripts/validate-templates.ts` — enforces the `data-var` contract
- `pnpm templates:compile` script

### First template

- `templates/cf-one-partner-brief/content.md` — placeholder content until Tim provides the real brief
- `templates/cf-one-partner-brief/Template.tsx` — hand-authored A4 portrait one-pager using CF Workers design tokens
- `templates/cf-one-partner-brief/meta.json`
- `templates/cf-one-partner-brief/thumbnail.png`

### Docs

- `docs/AUTHORING.md` — how to add a new template (content.md schema, Template.tsx contract, dev loop)
- `docs/DESIGN-SYSTEM.md` — distilled reference of tokens + components from PLAN.md §5a
- `docs/DEPLOY.md` — Workers Builds setup, binding provisioning, local dev

### CI

- `.gitlab-ci.yml`:
  - `lint` — `biome check`
  - `typecheck` — `tsc --noEmit`
  - `test` — `vitest run`
  - `validate` — template + design-token validators
  - `build` — `pnpm build`

### Outcome

`git push origin main` → Workers Builds deploys → preview URL shows:
1. `/` — placeholder homepage with the page background, fonts, design tokens visibly applied
2. `/_dev/components` — every UI primitive rendered in every state, visually on-brand
3. `/_dev/templates/cf-one-partner-brief` — first template rendered with default values

This is the visual baseline. Cara reviews it. Iteration on design fidelity happens here before any feature code lands.

---

## What Comes After Week 1

Week-by-week breakdown is in PLAN.md §18. Headline order:

- **Week 2:** D1, CF Access, brand kit CRUD, library page, form-driven editor with live preview
- **Week 3:** `PartnerSession` + `EditorSession` DOs, chat tab with Workers AI streaming, tone rewrite
- **Week 4:** Export pipeline (Container + Browser Rendering + Queues + R2 etag cache)
- **Week 5:** Translation, two more templates, glossary enforcement, visual regression
- **Week 6:** Polish, accessibility audit, pilot-partner onboarding

---

## Resuming Work in a Fresh Session

When picking this up again:

1. Read PLAN.md (full plan)
2. Read this file (state + decisions + open questions)
3. `cd ~/brand-it && git status` to confirm clean state
4. Start at the "Week 1 Deliverable" section above
5. First commit on the new session should land the scaffold + design tokens + UI primitives + `/_dev/components`. That's the minimum viable artefact to validate the visual direction.

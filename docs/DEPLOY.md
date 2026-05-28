# Deployment Guide

## Overview

Brand-It uses two automated pipelines on every push:

| Pipeline | Trigger | Purpose |
|---|---|---|
| **GitLab CI** (`.gitlab-ci.yml`) | Every push to any branch | Lint, typecheck, tests, template validators. Quality gate. |
| **Cloudflare Workers Builds** | Push to `main` (production), feature branches (preview URLs) | Build + deploy the Worker. |

## Local development

```bash
pnpm install
pnpm templates:compile    # generate brand-vars.ts from content.md
pnpm dev                  # Vite + Wrangler local — http://localhost:3000
```

Quick checks:
```bash
pnpm check                # lint + typecheck + template validators
pnpm test                 # Vitest unit tests
pnpm build                # Vite production build
```

## Workers Builds setup (one-time, Tim only)

1. Cloudflare dashboard → account `9c0e55ad8906a05169a1259400c71e5b`
2. **Workers & Pages → Connect to Git → GitLab → Authorise → select `tim.seiffert/brand-it`**
3. Build configuration:
   - Build command: `pnpm install && pnpm templates:compile && pnpm build`
   - Deploy command: `pnpm wrangler deploy`
   - Root directory: `/`
   - Node version: 20

After this, every push to `main` deploys automatically (<60s). Feature branches get preview URLs.

## Cloudflare Access (Week 2, before public access)

1. Zero Trust → Access → Applications → Add → Self-hosted
2. Application domain: `brand-it.<account>.workers.dev` (update when custom domain set)
3. Policy: include `tim.seiffert@cloudflare.com` initially
4. Auth method: One-time PIN via email

## Provisioned bindings

All bindings were created during initial setup. IDs are committed to `wrangler.jsonc`.

| Binding | Resource | ID |
|---|---|---|
| `DB` | D1 `brand-it-db` | `939c14e5-bef0-4cf1-b506-e33454bec213` |
| `CACHE` | KV `brand-it-cache` | `56186b2694674870a25f033a672a2239` |
| `ASSETS_BUCKET` | R2 `brand-it-assets` | — |
| `EXPORTS` | R2 `brand-it-exports` | — |
| `AI` | Workers AI | — |

**TODO before Week 3 (AI):** Create AI Gateway `brand-it` in the dashboard (Workers AI → AI Gateway → Create gateway) and uncomment the gateway config in `wrangler.jsonc`.

**TODO when Flagship ready:** Paste `app_id` into the `flagship` block in `wrangler.jsonc`.

## Branch policy (MVP)

- Push directly to `main` for solo work
- Use feature branches for in-progress visual work that needs a preview URL
- Switch to MR reviews once a second contributor joins

## Queues (Week 4)

The export queue binding is declared in `wrangler.jsonc` but the queue itself hasn't been created yet. Before Week 4:

```bash
pnpm wrangler queues create brand-it-export
```

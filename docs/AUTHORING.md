# Template Authoring Guide

Brand-It separates content from design. Every template lives in `templates/<slug>/` and consists of two co-authored files plus two static files.

## Directory structure

```
templates/<slug>/
├── content.md       ← field schema, defaults, labels (content creators edit this)
├── Template.tsx     ← layout, design, brand application (engineers edit this)
├── brand-vars.ts    ← AUTO-GENERATED from content.md — do not edit
├── meta.json        ← title, description, type, tags
└── thumbnail.png    ← 600 × 400 static catalog thumbnail
```

## Adding a new template

1. Create the directory:
   ```bash
   mkdir templates/my-template-slug
   ```

2. Create `content.md` (see schema below)

3. Run the compiler to generate `brand-vars.ts`:
   ```bash
   pnpm templates:compile
   ```

4. Create `Template.tsx` importing types from the generated file:
   ```tsx
   import type { BrandVars } from './brand-vars';
   export default function Template({ vars }: { vars: BrandVars }) { ... }
   ```

5. Add `meta.json` and a `thumbnail.png`

6. Preview at `/_dev/templates/my-template-slug` (add the slug to the registry in `app/routes/_dev/templates.$slug.tsx`)

7. Push to main → Workers Builds deploys, template appears in the catalog

## `content.md` schema reference

```yaml
---
title: "Template display name"
type: one-pager         # one-pager | solution-brief | email-banner | announcement
format: pdf             # output format hint
size: A4                # A4 | Letter | Custom
orientation: portrait   # portrait | landscape
tags: [tag1, tag2]
brandVars:
  fieldKey:
    type: string        # string | text | enum | color | image | boolean
    label: "UI label"   # shown in the form editor
    maxLength: 120      # for string and text types
    required: true      # creates required TypeScript field
    fromBrandKit: "logo"  # auto-populate from brand kit (logo | primary_color |
                          # secondary_color | accent_color | company_name |
                          # contact_email | contact_phone | website_url | tagline)
    options: [a, b, c]  # for enum type only
    default: "value"    # explicit default; overrides body-paragraph defaults
---

First paragraph becomes the default for the first text/string field (in declaration order).

Second paragraph becomes the second text/string field's default.
```

## Supported field types

| Type | UI component | Notes |
|---|---|---|
| `string` | `Input` | Single-line text |
| `text` | `Textarea` | Multi-line, with character counter |
| `enum` | `Select` | Requires `options: [...]` |
| `color` | `ColorPicker` | Hex input + swatch |
| `image` | Upload zone | Direct-to-R2 presigned upload |
| `boolean` | `Toggle` | On/off pill switch |

## `Template.tsx` contract

- Import types from `./brand-vars` (generated, never edit manually)
- Every editable element must carry `data-var="<key>"` matching a `brandVars` key
- All colours must use CF design tokens (`var(--cf-orange)`, `var(--cf-text)`, etc.) — never raw hex, never Tailwind colour utilities
- Buttons must use `border-radius: 9999px` (pill) — never `rounded-sm`, `rounded-md`, etc.
- Export a single default function component accepting `{ vars: BrandVars }`
- Also export `defaultBrandVars` (re-exported from `brand-vars.ts`) for the preview route

```tsx
import type { BrandVars } from './brand-vars';
export { defaultBrandVars } from './brand-vars';

export default function Template({ vars }: { vars: BrandVars }) {
  return (
    <article className="a4-portrait bg-cf-bg-100 ...">
      <h1 data-var="headline">{vars.headline}</h1>
    </article>
  );
}
```

## Validation

The CI `validate` stage checks all templates automatically. Run locally:

```bash
pnpm templates:compile   # regenerate brand-vars.ts
pnpm templates:validate  # check data-var contract + design token rules
```

Violations cause the CI build to fail and Workers Builds to not promote the new version.

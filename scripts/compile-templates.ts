/**
 * compile-templates.ts
 *
 * Reads each templates/<slug>/content.md, parses the YAML frontmatter,
 * and generates a brand-vars.ts next to it.
 *
 * Generated file provides:
 *   - TypeScript interface BrandVars
 *   - Zod schema brandVarsSchema
 *   - defaultBrandVars object with defaults from the Markdown body
 *
 * Run: pnpm templates:compile
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROOT = resolve(__dirname, "..");
const TEMPLATES_DIR = join(ROOT, "templates");

interface FieldDef {
  type: "string" | "text" | "enum" | "color" | "image" | "boolean";
  label?: string;
  maxLength?: number;
  required?: boolean;
  fromBrandKit?: string;
  options?: string[];
  default?: string | boolean;
}

interface Frontmatter {
  title: string;
  type: "one-pager" | "solution-brief" | "email-banner" | "announcement";
  format?: string;
  size?: string;
  orientation?: string;
  tags?: string[];
  brandVars: Record<string, FieldDef>;
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function tsTypeForField(field: FieldDef): string {
  if (field.type === "boolean") return "boolean";
  return "string";
}

function zodSchemaForField(field: FieldDef): string {
  const parts: string[] = [];

  switch (field.type) {
    case "boolean":
      parts.push("z.boolean()");
      break;
    case "color":
      parts.push(`z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex colour")`);
      break;
    case "enum":
      if (field.options && field.options.length > 0) {
        const opts = field.options.map((o) => JSON.stringify(o)).join(", ");
        parts.push(`z.enum([${opts}])`);
      } else {
        parts.push("z.string()");
      }
      break;
    default:
      parts.push("z.string()");
      if (field.maxLength) {
        parts.push(`.max(${field.maxLength})`);
      }
      break;
  }

  if (!field.required) {
    parts.push(".optional()");
  }

  return parts.join("");
}

/**
 * Extract default values from the Markdown body.
 * Body paragraphs map to text/string fields in declaration order.
 */
function extractDefaults(body: string, fields: Record<string, FieldDef>): Record<string, unknown> {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) =>
      p
        .trim()
        .replace(/^#+\s*/, "")
        .trim(),
    )
    .filter(Boolean);

  const defaults: Record<string, unknown> = {};
  let pIdx = 0;

  for (const [key, field] of Object.entries(fields)) {
    if (field.default !== undefined) {
      defaults[key] = field.default;
    } else if (field.fromBrandKit) {
      // fromBrandKit fields get a placeholder — overridden at runtime
      defaults[key] =
        field.type === "color"
          ? "#FF4801"
          : field.type === "image"
            ? ""
            : `[${field.fromBrandKit}]`;
    } else if (field.type === "boolean") {
      defaults[key] = false;
    } else if (field.type === "string" || field.type === "text") {
      defaults[key] = paragraphs[pIdx++] ?? "";
    } else if (field.type === "enum" && field.options) {
      defaults[key] = field.options[0] ?? "";
    } else {
      defaults[key] = "";
    }
  }

  return defaults;
}

function generateBrandVarsFile(slug: string, frontmatter: Frontmatter, body: string): string {
  const { brandVars } = frontmatter;
  const defaults = extractDefaults(body, brandVars);
  const ifaceName = `${toPascalCase(slug)}BrandVars`;

  const tsFields = Object.entries(brandVars)
    .map(([key, field]) => {
      const optional = !field.required ? "?" : "";
      return `  /** ${field.label ?? key} */\n  ${key}${optional}: ${tsTypeForField(field)};`;
    })
    .join("\n");

  const zodFields = Object.entries(brandVars)
    .map(([key, field]) => `  ${key}: ${zodSchemaForField(field)},`)
    .join("\n");

  const defaultFields = Object.entries(defaults)
    .map(([key, val]) => `  ${key}: ${JSON.stringify(val)},`)
    .join("\n");

  return `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
// Source: templates/${slug}/content.md
// Regenerate: pnpm templates:compile

import { z } from "zod";

/** Brand variable interface for template "${frontmatter.title}" */
export interface ${ifaceName} {
${tsFields}
}

/** Alias — imported generically as BrandVars in Template.tsx */
export type BrandVars = ${ifaceName};

/** Zod schema for runtime validation */
export const brandVarsSchema = z.object({
${zodFields}
});

/** Default values derived from content.md */
export const defaultBrandVars: BrandVars = {
${defaultFields}
};
`;
}

function compileTemplate(slug: string): void {
  const dir = join(TEMPLATES_DIR, slug);
  const contentPath = join(dir, "content.md");

  if (!existsSync(contentPath)) {
    console.warn(`  ⚠  ${slug}: content.md not found — skipping`);
    return;
  }

  const raw = readFileSync(contentPath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as Frontmatter;

  if (!frontmatter.title) {
    throw new Error(`${slug}/content.md: missing required frontmatter field "title"`);
  }
  if (!frontmatter.type) {
    throw new Error(`${slug}/content.md: missing required frontmatter field "type"`);
  }
  if (!frontmatter.brandVars || typeof frontmatter.brandVars !== "object") {
    throw new Error(`${slug}/content.md: missing or invalid "brandVars" frontmatter block`);
  }

  const generated = generateBrandVarsFile(slug, frontmatter, content);
  const outPath = join(dir, "brand-vars.ts");
  writeFileSync(outPath, generated, "utf-8");

  console.log(`  ✓  ${slug} → brand-vars.ts`);
}

// ── Main ──────────────────────────────────────────────────────

const slugs = readdirSync(TEMPLATES_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

if (slugs.length === 0) {
  console.log("No template directories found in templates/");
  process.exit(0);
}

console.log(`Compiling ${slugs.length} template(s)…`);

let errors = 0;
for (const slug of slugs) {
  try {
    compileTemplate(slug);
  } catch (err) {
    console.error(`  ✗  ${slug}: ${(err as Error).message}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} template(s) failed to compile.`);
  process.exit(1);
} else {
  console.log("\nAll templates compiled successfully.");
}

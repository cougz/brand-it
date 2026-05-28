/**
 * validate-templates.ts
 *
 * Enforces the dual-layer template authoring contract:
 *
 *   1. Every data-var attribute in Template.tsx references a declared schema key.
 *   2. Every required schema key has at least one data-var element in the TSX.
 *   3. No element uses raw Tailwind colour classes (bg-blue-*, text-gray-*, etc.)
 *      — all colours must flow through CF design tokens.
 *   4. No <button> uses non-pill rounded-* classes.
 *
 * Run: pnpm templates:validate
 * Called by: pnpm check, .gitlab-ci.yml validate stage
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROOT = resolve(__dirname, "..");
const TEMPLATES_DIR = join(ROOT, "templates");

// Raw Tailwind colour class patterns that must NOT appear in Template.tsx
// All colours must flow through CF design tokens (--cf-*).
const FORBIDDEN_COLOR_PATTERNS = [
  /\bbg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/,
  /\btext-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/,
  /\bborder-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/,
  // Literal hex values in className strings
  /#[0-9a-fA-F]{6}/,
  // Pure white/black
  /\b(bg|text|border)-(white|black)\b/,
];

// Non-pill rounded classes on button elements
const NON_PILL_BUTTON_PATTERN = /\brounded-(?:none|sm|md|lg|xl|2xl|3xl|full(?!$))\b/;

interface ValidationResult {
  slug: string;
  errors: string[];
  warnings: string[];
}

function validateTemplate(slug: string): ValidationResult {
  const dir = join(TEMPLATES_DIR, slug);
  const result: ValidationResult = { slug, errors: [], warnings: [] };

  const contentPath = join(dir, "content.md");
  const tsxPath = join(dir, "Template.tsx");
  const metaPath = join(dir, "meta.json");

  // ── Check required files exist ────────────────────────────
  if (!existsSync(contentPath)) {
    result.errors.push("content.md not found");
    return result;
  }
  if (!existsSync(tsxPath)) {
    result.errors.push("Template.tsx not found");
    return result;
  }
  if (!existsSync(metaPath)) {
    result.warnings.push("meta.json not found (required before merge to main)");
  }

  // ── Parse schema from content.md ──────────────────────────
  const raw = readFileSync(contentPath, "utf-8");
  const { data } = matter(raw);
  const brandVars = (data.brandVars ?? {}) as Record<string, { required?: boolean }>;
  const schemaKeys = new Set(Object.keys(brandVars));
  const requiredKeys = new Set(
    Object.entries(brandVars)
      .filter(([, v]) => v.required)
      .map(([k]) => k),
  );

  // ── Parse data-var attributes from Template.tsx ───────────
  const tsxSource = readFileSync(tsxPath, "utf-8");
  // Strip single-line and block comments before scanning so JSDoc
  // examples like `data-var="<key>"` don't produce false positives.
  const tsxStripped = tsxSource
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
    .replace(/\/\/.*/g, ""); // single-line comments
  const dataVarMatches = [...tsxStripped.matchAll(/data-var="([^"]+)"/g)];
  const usedDataVars = new Set(dataVarMatches.map((m) => m[1]));

  // 1. Every data-var must reference a declared schema key
  for (const key of usedDataVars) {
    if (!schemaKeys.has(key)) {
      result.errors.push(
        `data-var="${key}" in Template.tsx is not declared in content.md brandVars`,
      );
    }
  }

  // 2. Every required schema key must have at least one data-var element
  for (const key of requiredKeys) {
    if (!usedDataVars.has(key)) {
      result.errors.push(`Required field "${key}" has no data-var element in Template.tsx`);
    }
  }

  // 3. No raw Tailwind colour classes (check on stripped source to avoid comment false positives)
  const lines = tsxStripped.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of FORBIDDEN_COLOR_PATTERNS) {
      if (pattern.test(line)) {
        result.errors.push(
          `Line ${i + 1}: forbidden raw colour class/value — use CF design tokens (--cf-*) instead.\n` +
            `    ${line.trim()}`,
        );
        break; // one error per line
      }
    }
  }

  // 4. No non-pill rounded on button elements (heuristic scan)
  const buttonMatches = [...tsxStripped.matchAll(/<button[^>]*>/g)];
  for (const bMatch of buttonMatches) {
    const lineNo = tsxStripped.slice(0, bMatch.index).split("\n").length;
    if (NON_PILL_BUTTON_PATTERN.test(bMatch[0])) {
      result.errors.push(
        `Line ${lineNo}: <button> uses non-pill border-radius. Buttons must use rounded-pill (9999px) per design system.`,
      );
    }
  }

  return result;
}

// ── Main ──────────────────────────────────────────────────────

const slugs = readdirSync(TEMPLATES_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

if (slugs.length === 0) {
  console.log("No template directories found — nothing to validate.");
  process.exit(0);
}

console.log(`Validating ${slugs.length} template(s)…`);

let totalErrors = 0;
let totalWarnings = 0;

for (const slug of slugs) {
  const result = validateTemplate(slug);

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log(`  ✓  ${slug}`);
  } else {
    if (result.errors.length > 0) {
      console.error(`  ✗  ${slug}:`);
      for (const err of result.errors) {
        console.error(`       ERROR: ${err}`);
      }
      totalErrors += result.errors.length;
    }
    if (result.warnings.length > 0) {
      console.warn(`  ⚠  ${slug}:`);
      for (const w of result.warnings) {
        console.warn(`       WARN:  ${w}`);
      }
      totalWarnings += result.warnings.length;
    }
  }
}

console.log(
  `\n${slugs.length} template(s) checked — ${totalErrors} error(s), ${totalWarnings} warning(s).`,
);

if (totalErrors > 0) {
  process.exit(1);
}

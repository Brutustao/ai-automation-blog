/**
 * SEO Audit Script
 *
 * Scans all articles in src/content/articles/ and validates SEO best practices.
 * Used in CI (PR checks and pre-deploy).
 *
 * Usage:
 *   node scripts/seo-check.mjs           # Check all articles
 *   node scripts/seo-check.mjs --fix     # Auto-fix fixable issues
 *   node scripts/seo-check.mjs --strict  # Fail on warnings (for CI)
 *
 * Exit code: 0 = pass, 1 = fail
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, "..", "src", "content", "articles");

const ALLOWED_CATEGORIES = [
  "social-media-automation",
  "email-marketing-ai",
  "ppc-ads",
  "content-creation",
  "analytics-reporting",
];

let hasError = false;
let hasWarning = false;

function error(msg, file) {
  hasError = true;
  console.error(`  ❌ ERROR [${file}]: ${msg}`);
}

function warn(msg, file) {
  hasWarning = true;
  console.warn(`  ⚠️  WARN  [${file}]: ${msg}`);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(?:"(.+?)"|(\S.*))?/);
    if (kv) {
      fm[kv[1]] = kv[2] !== undefined ? kv[2] : (kv[3] || "").trim();
    }
  }
  return { fm, body: content.slice(match[0].length).trim() };
}

function checkArticle(filePath) {
  const relPath = path.relative(ARTICLES_DIR, filePath);
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = parseFrontmatter(content);
  if (!parsed) {
    error("Missing or invalid YAML frontmatter", relPath);
    return;
  }

  const { fm, body } = parsed;

  // --- Required fields ---
  const required = ["title", "description", "date", "category"];
  for (const field of required) {
    if (!fm[field]) error(`Missing required frontmatter field: "${field}"`, relPath);
  }

  // --- Title checks ---
  if (fm.title && fm.title.length > 120) {
    error(`Title is too long (${fm.title.length} chars, max 120)`, relPath);
  }
  if (fm.title && fm.title.length < 10) {
    warn(`Title is very short (${fm.title.length} chars)`, relPath);
  }

  // --- Description checks ---
  if (fm.description) {
    if (fm.description.length < 50) {
      warn(`Description too short (${fm.description.length} chars, min 50 recommended)`, relPath);
    }
    if (fm.description.length > 200) {
      error(`Description too long (${fm.description.length} chars, max 200)`, relPath);
    }
  }

  // --- Category checks ---
  if (fm.category && !ALLOWED_CATEGORIES.includes(fm.category)) {
    error(`Invalid category "${fm.category}". Must be one of: ${ALLOWED_CATEGORIES.join(", ")}`, relPath);
  }

  // --- Date checks ---
  if (fm.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fm.date)) {
      error(`Date must be YYYY-MM-DD format, got "${fm.date}"`, relPath);
    }
  }

  // --- Body checks ---
  if (!body || body.trim().length < 500) {
    error(`Article body is too short (${body?.trim().length || 0} chars, min 500)`, relPath);
  }

  // --- Heading structure ---
  const h1Count = (body.match(/^#\s+/m) || []).length;
  if (h1Count > 0) error(`Article body contains H1 headings (#) — only the title should use H1`, relPath);

  const h2Count = (body.match(/^##\s+/gm) || []).length;
  if (h2Count < 3) warn(`Only ${h2Count} H2 headings found (recommend at least 3)`, relPath);

  // --- Check for "click here" or generic link text ---
  const genericLinks = body.match(/\bclick here\b/gi);
  if (genericLinks) warn(`Found generic link text "click here" (${genericLinks.length} occurrences)`, relPath);

  // --- Check for missing alt text on images ---
  const imgPattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let imgMatch;
  while ((imgMatch = imgPattern.exec(body)) !== null) {
    if (!imgMatch[1] || imgMatch[1].trim() === "") {
      warn(`Image missing alt text: ${imgMatch[2]}`, relPath);
    }
  }

  // --- Affiliate disclosure ---
  if (fm.affiliate === true || fm.affiliate === "true") {
    // Check that body contains a disclosure or affiliate link indicator
    const hasDisclosure = body.toLowerCase().includes("affiliate") || body.toLowerCase().includes("disclosure");
    if (!hasDisclosure) {
      warn(`affiliate: true but body doesn't mention "affiliate" or "disclosure"`, relPath);
    }
  }
}

function walkArticles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkArticles(fullPath));
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const fixMode = args.includes("--fix");

  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error(`Articles directory not found: ${ARTICLES_DIR}`);
    process.exit(1);
  }

  const files = walkArticles(ARTICLES_DIR);
  console.log(`🔍 Running SEO audit on ${files.length} articles...\n`);

  for (const file of files) {
    checkArticle(file);
  }

  console.log(`\n📋 Summary:`);
  console.log(`   Articles scanned: ${files.length}`);
  console.log(`   Errors:           ${hasError ? "FAIL" : "0"}`);
  console.log(`   Warnings:         ${hasWarning ? "YES" : "0"}`);

  if (hasError) {
    console.error("\n❌ SEO audit FAILED — fix errors above.");
    process.exit(1);
  }
  if (hasWarning && strict) {
    console.error("\n⚠️  SEO audit passed with warnings (--strict mode).");
    process.exit(1);
  }
  console.log("\n✅ SEO audit passed.");
}

main();

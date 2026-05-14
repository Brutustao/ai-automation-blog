/**
 * Sitemap Submission Script
 *
 * Pings Google Search Console to notify about updated sitemap.
 * Also submits to Bing if BING_API_KEY is set.
 *
 * Usage:
 *   node scripts/submit-sitemap.mjs
 *
 * Environment:
 *   SITE_URL — defaults to https://ai-automation-blog.pages.dev
 */

const SITE_URL = process.env.SITE_URL || "https://ai-automation-blog.pages.dev";
const SITEMAP_URL = `${SITE_URL}/sitemap-index.xml`;

async function pingGoogle() {
  const url = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
  const resp = await fetch(url);
  if (resp.ok) {
    console.log("  ✅ Google sitemap ping successful");
  } else {
    console.warn(`  ⚠️  Google ping returned ${resp.status}`);
  }
}

async function pingBing() {
  const apiKey = process.env.BING_API_KEY;
  if (!apiKey) {
    console.log("  ⏭️  Bing: skipped (no BING_API_KEY)");
    return;
  }
  const url = `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
  const resp = await fetch(url);
  if (resp.ok) {
    console.log("  ✅ Bing sitemap ping successful");
  } else {
    console.warn(`  ⚠️  Bing ping returned ${resp.status}`);
  }
}

async function googleIndexingApi() {
  // Google Indexing API requires OAuth — only attempt if credentials are configured
  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY;
  if (!clientEmail || !privateKey) {
    console.log("  ⏭️  Google Indexing API: skipped (credentials not configured)");
    return;
  }

  // For now, just note this is available
  console.log("  ℹ️  Google Indexing API: credentials found but OAuth flow needs additional setup");
  console.log("     See: https://developers.google.com/search/apis/indexing-api/v3/quickstart");
}

async function main() {
  console.log(`📡 Submitting sitemap: ${SITEMAP_URL}\n`);

  await Promise.allSettled([pingGoogle(), pingBing()]);
  await googleIndexingApi();

  console.log(`\n✅ Sitemap submission complete`);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});

/**
 * Auto-Publish Script
 *
 * Picks a topic and category, generates an article, and saves it.
 * Designed to run on a cron schedule via GitHub Actions.
 *
 * Strategy:
 *   - Picks the category with the fewest recent articles
 *   - Generates a topic from a pre-defined pool or asks AI for one
 *   - Calls generate-post.mjs to produce the article
 *
 * Usage:
 *   node scripts/auto-publish.mjs
 *   node scripts/auto-publish.mjs --category content-creation --topic "Custom topic"
 *
 * Environment:
 *   DEEPSEEK_API_KEY  (required)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, "..", "src", "content", "articles");

const CATEGORIES = [
  { slug: "social-media-automation", title: "Social Media Automation",
    topics: [
      "How to Automate TikTok Content Scheduling with AI",
      "X (Twitter) Automation: Scheduling Threads and Engagement with AI",
      "AI-Powered Social Listening: Tools and Workflows for 2025",
      "How to Repurpose Long-Form Content into 10 Social Posts with AI",
      "Instagram Reels Automation: AI Tools for Video Content at Scale",
      "LinkedIn Engagement Automation: AI Commenting and DM Strategies",
      "Multi-Platform Social Media Calendar: Automate Your Entire Workflow",
      "AI Social Media Analytics: Measure What Matters Across Platforms",
    ] },
  { slug: "email-marketing-ai", title: "Email Marketing AI",
    topics: [
      "AI Email Subject Line Generator: Tools That Boost Open Rates",
      "Welcome Email Sequences: Automate Onboarding with AI Personalization",
      "Email List Segmentation Using AI: Beyond Basic Demographics",
      "A/B Testing Email Campaigns at Scale with AI",
      "AI-Powered Email Send Time Optimization: What the Data Says",
      "Email Copywriting with ChatGPT: Prompts That Convert",
      "Re-engagement Email Automation: Win Back Inactive Subscribers with AI",
      "HubSpot vs ActiveCampaign: AI Features Compared for 2025",
    ] },
  { slug: "ppc-ads", title: "PPC & Ads",
    topics: [
      "AI Bid Management: Automate Google Ads Bidding for Maximum ROAS",
      "Facebook Ads Audience Targeting with AI: Lookalikes and Beyond",
      "Programmatic Advertising for Small Budgets: AI Tools That Level the Field",
      "AI Ad Creative Testing: How to Run 100 Variations Without the Work",
      "Google Ads Performance Max: AI Campaign Optimization Guide",
      "Retargeting Campaigns with AI: Show the Right Ad at the Right Time",
      "LinkedIn Ads Automation: Target Decision-Makers at Scale",
      "Budget Pacing with AI: Never Blow Your Monthly Ad Spend Again",
    ] },
  { slug: "content-creation", title: "Content Creation",
    topics: [
      "AI Video Editing Tools: Automate Cuts, Captions, and Color Grading",
      "Podcast Production with AI: Transcription, Show Notes, and Snippets",
      "AI for E-commerce Product Descriptions: Generate at Scale",
      "Automating Newsletters with AI: From Draft to Inbox",
      "AI Storyboarding: Plan Your Video Content in Minutes",
      "GPT-4o vs Claude 3.7: Which Writes Better Marketing Copy?",
      "AI Translation for Content: Reach Global Audiences Automatically",
      "Data-Driven Content Strategy: Let AI Tell You What to Write Next",
    ] },
  { slug: "analytics-reporting", title: "Analytics & Reporting",
    topics: [
      "AI-Powered Dashboards: Build Real-Time Marketing Reports in Minutes",
      "Customer Lifetime Value Prediction with Machine Learning",
      "Automated Social Media Reporting: Tools That Generate Insights",
      "Churn Prediction: Use AI to Spot At-Risk Customers Before They Leave",
      "AI Sentiment Analysis: Monitor Brand Perception at Scale",
      "Google Analytics 4 vs ChatGPT Analytics: Which Tells a Better Story?",
      "Marketing ROI Calculator: Automate Your Attribution Model with AI",
      "Data Studio Templates for AI-Powered Marketing Reports",
    ] },
];

function countArticles(categorySlug) {
  const dir = path.join(ARTICLES_DIR, categorySlug);
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => /\.(md|mdx)$/.test(f)).length;
}

function getLatestDate(categorySlug) {
  const dir = path.join(ARTICLES_DIR, categorySlug);
  if (!fs.existsSync(dir)) return new Date(0);
  const files = fs.readdirSync(dir).filter((f) => /\.(md|mdx)$/.test(f));
  let latest = new Date(0);
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), "utf-8");
    const match = content.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m);
    if (match) {
      const d = new Date(match[1]);
      if (d > latest) latest = d;
    }
  }
  return latest;
}

function pickCategory() {
  // Score each category: fewer articles + older last article = higher priority
  const scored = CATEGORIES.map((cat) => {
    const count = countArticles(cat.slug);
    const latest = getLatestDate(cat.slug);
    const daysSinceLastArticle = (Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24);
    // Preference = days since last article + (10 * (1 / (count + 1)))
    const score = daysSinceLastArticle + 10 / (count + 1);
    return { ...cat, count, daysSinceLastArticle, score };
  });

  scored.sort((a, b) => b.score - a.score);

  console.error(`📊 Category scores:`);
  for (const cat of scored) {
    console.error(`   ${cat.slug}: ${cat.count} articles, ${Math.round(cat.daysSinceLastArticle)}d since last, score=${cat.score.toFixed(1)}`);
  }

  return scored[0];
}

function pickTopic(category) {
  const usedTopics = new Set();
  const dir = path.join(ARTICLES_DIR, category.slug);
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      const match = content.match(/^title:\s*"(.+?)"/m);
      if (match) usedTopics.add(match[1].toLowerCase());
    }
  }

  // Pick first unused topic, or cycle back
  for (const topic of category.topics) {
    if (!usedTopics.has(topic.toLowerCase())) return topic;
  }
  // All used — shuffle topic list and pick one
  const shuffled = [...category.topics].sort(() => Math.random() - 0.5);
  return shuffled[0];
}

function main() {
  const args = process.argv.slice(2);
  const explicitCategory = args.includes("--category") ? args[args.indexOf("--category") + 1] : null;
  const explicitTopic = args.includes("--topic") ? args[args.indexOf("--topic") + 1] : null;

  let category, topic;

  if (explicitCategory && explicitTopic) {
    category = CATEGORIES.find((c) => c.slug === explicitCategory);
    topic = explicitTopic;
  } else if (explicitCategory) {
    category = CATEGORIES.find((c) => c.slug === explicitCategory);
    topic = pickTopic(category);
  } else if (explicitTopic) {
    // Topic given but no category — find best match
    category = CATEGORIES.reduce((best, cat) => {
      const match = cat.topics.some((t) => t.toLowerCase().includes(explicitTopic.toLowerCase()));
      return match ? cat : best;
    }, CATEGORIES[0]);
    topic = explicitTopic;
  } else {
    category = pickCategory();
    topic = pickTopic(category);
  }

  if (!category) {
    console.error("No category selected.");
    process.exit(1);
  }

  console.error(`\n🎯 Selected: "${topic}" [${category.slug}]\n`);

  const scriptPath = path.join(__dirname, "generate-post.mjs");
  const cmd = `node "${scriptPath}" --topic "${topic}" --category ${category.slug}`;

  const output = execSync(cmd, { encoding: "utf-8", cwd: path.join(__dirname, "..") });
  const filePath = output.trim().split("\n").pop();

  console.error(`📄 Saved: ${filePath}`);
  console.log(`Generated article: ${topic}`);
}

main();

/**
 * AI Blog Post Generator
 *
 * Generates complete MDX articles using DeepSeek API.
 *
 * Usage:
 *   node scripts/generate-post.mjs --topic "Your topic" --category content-creation [--lang zh]
 *
 * Options:
 *   --topic       Article topic/title (required)
 *   --category    Category slug from src/config.ts (required)
 *   --lang        Output language: "en" (default) or "zh"
 *   --keywords    Comma-separated extra keywords
 *   --dry-run     Print generated content without writing a file
 *
 * Environment:
 *   DEEPSEEK_API_KEY  (required)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CATEGORIES = [
  { slug: "social-media-automation", title: "Social Media Automation", icon: "Social" },
  { slug: "email-marketing-ai",       title: "Email Marketing AI",       icon: "Email" },
  { slug: "ppc-ads",                 title: "PPC & Ads",                icon: "Ads" },
  { slug: "content-creation",        title: "Content Creation",         icon: "Content" },
  { slug: "analytics-reporting",     title: "Analytics & Reporting",    icon: "Analytics" },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 && i + 1 < args.length ? args[i + 1] : null;
  };
  return {
    topic: get("--topic"),
    category: get("--category"),
    lang: get("--lang") || "en",
    keywords: get("--keywords") || "",
    dryRun: args.includes("--dry-run"),
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function loadEnv() {
  try {
    const envPath = path.join(__dirname, "..", ".env");
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*(\w+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
      }
    }
  } catch {}
}

async function callDeepSeek(systemPrompt, userPrompt) {
  loadEnv();

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY environment variable is required. Set it in .env file or as an environment variable.");

  const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`DeepSeek API error ${resp.status}: ${err}`);
  }
  const data = await resp.json();
  return data.choices[0].message.content;
}

function buildPrompt({ topic, category, keywords, lang }) {
  const cat = CATEGORIES.find((c) => c.slug === category);
  const isZh = lang === "zh";

  const systemPrompt = isZh
    ? "你是一个专业的 AI 自动化博客作者。你的写作风格：实用、数据驱动、步骤清晰。每篇文章都要提供 actionable 的见解和具体的工作流程。文章应该包含具体的提示词示例、工具对比表格、以及真实的工作流场景。语言：简体中文。"
    : "You are a professional AI automation blog writer. Your writing style: practical, data-driven, with clear step-by-step guidance. Every article must provide actionable insights with specific workflows, prompt examples, tool comparison tables, and real-world scenarios.";

  const categoryContext = cat
    ? isZh
      ? `文章分类：${cat.title}`
      : `Article category: ${cat.title}`
    : "";

  const keywordContext = keywords
    ? isZh
      ? `目标关键词：${keywords}`
      : `Target keywords: ${keywords}`
    : "";

  const today = new Date().toISOString().slice(0, 10);
  const userPrompt = `Generate a complete SEO-optimized blog post as a Markdown file with YAML frontmatter.

${categoryContext}
${keywordContext}
${isZh ? `主题/标题：${topic}` : `Topic/Title: ${topic}`}

OUTPUT FORMAT:
Start with YAML frontmatter (between --- lines), then the article body in Markdown.

Frontmatter schema:
- title: ${isZh ? "文章标题（字符串）" : "Article title (string)"}
- description: ${isZh ? "Meta 描述（120-160 字符，包含主要关键词）" : "Meta description (120-160 chars, include primary keyword)"}
- date: ${isZh ? `YYYY-MM-DD 格式的日期（使用当前日期 ${today}）` : `Date in YYYY-MM-DD (use ${today})`}
- category: "${category}"
- affiliate: false

Article structure requirements:
1. Start with a strong hook paragraph that states the problem/promise
2. Use H2 (##) and H3 (###) headings throughout (minimum 4 H2 sections)
3. Include at least one comparison table (| Header | Header |) with content
4. Include 2-3 real prompt examples in blockquotes (> Prompt: ...)
5. End with a "Final Thoughts" H2 section
6. Word count: ${isZh ? "1500-2500 字" : "1200-2000 words"}
7. ${isZh ? "写作风格：短段落（2-3句话），对话式但专业" : "Writing style: short paragraphs (2-3 sentences), conversational but authoritative"}

IMPORTANT: Output ONLY the file content. No explanations, no markdown code fences around the output.`;

  return { systemPrompt, userPrompt };
}

async function generate() {
  const args = parseArgs();
  if (!args.topic || !args.category) {
    console.error("Usage: node scripts/generate-post.mjs --topic \"...\" --category <slug> [--lang zh] [--keywords \"...\"] [--dry-run]");
    console.error("Categories:", CATEGORIES.map((c) => c.slug).join(", "));
    process.exit(1);
  }

  const cat = CATEGORIES.find((c) => c.slug === args.category);
  if (!cat) {
    console.error(`Invalid category "${args.category}". Must be one of: ${CATEGORIES.map((c) => c.slug).join(", ")}`);
    process.exit(1);
  }

  console.error(`Generating article: "${args.topic}" [${cat.slug}]`);

  const { systemPrompt, userPrompt } = buildPrompt(args);
  const content = await callDeepSeek(systemPrompt, userPrompt);
  const trimmedContent = content.trim();

  // Extract title from frontmatter for slug
  const titleMatch = trimmedContent.match(/^title:\s*"(.+?)"/m);
  const title = titleMatch ? titleMatch[1] : args.topic;
  const slug = slugify(title);

  // Ensure frontmatter has proper category
  const finalContent = trimmedContent.includes(`category: "${args.category}"`)
    ? trimmedContent
    : trimmedContent.replace(/^category:\s*.+$/m, `category: "${args.category}"`);

  if (args.dryRun) {
    console.log(finalContent);
    return;
  }

  const dir = path.join("src", "content", "articles", args.category);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.md`);
  fs.writeFileSync(filePath, finalContent + "\n", "utf-8");

  console.error(`Article saved: ${filePath}`);
  console.log(filePath);
}

generate().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

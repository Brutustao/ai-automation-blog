const fs = require("fs");
const path = require("path");

const articlesDir = path.join(__dirname, "..", "src", "content", "articles");
const imagesDir = path.join(__dirname, "..", "public", "images", "articles");

const colors = {
  "content-creation": { from: "#10b981", to: "#059669" },
  "email-marketing-ai": { from: "#0ea5e9", to: "#0284c7" },
  "ppc-ads": { from: "#f59e0b", to: "#d97706" },
  "social-media-automation": { from: "#ec4899", to: "#db2777" },
  "analytics-reporting": { from: "#8b5cf6", to: "#7c3aed" },
};

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrapText(text, maxLen) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = (line + " " + w).trim();
    if (test.length > maxLen && line.length > 0) {
      lines.push(line.trim());
      line = w;
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function generateSvg(title, category, siteName) {
  const c = colors[category] || colors["content-creation"];
  const lines = wrapText(title, 26);
  const fontSize = lines.length > 2 ? 50 : lines.length > 1 ? 60 : 68;
  const yStart = lines.length > 2 ? 175 : 195;
  const lineHeight = fontSize + 18;

  const catLabel = escapeXml(category.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()));
  const catLabelWidth = Math.max(catLabel.length * 10 + 40, 90);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c.from};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${c.to};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:white;stop-opacity:0" />
      <stop offset="50%" style="stop-color:white;stop-opacity:0.08" />
      <stop offset="100%" style="stop-color:white;stop-opacity:0" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#shine)" />
  <circle cx="100" cy="100" r="200" fill="white" opacity="0.05" />
  <circle cx="1100" cy="500" r="250" fill="white" opacity="0.05" />
  <circle cx="600" cy="630" r="300" fill="white" opacity="0.03" />
  <rect x="60" y="75" rx="20" ry="20" width="${catLabelWidth}" height="38" fill="white" opacity="0.2" />
  <text x="80" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white">${catLabel}</text>
  ${lines.map((l, i) => `<text x="60" y="${yStart + i * lineHeight}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">${escapeXml(l)}</text>`).join("\n  ")}
  <text x="60" y="545" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="white" opacity="0.8">${escapeXml(siteName)}</text>
  <line x1="60" y1="565" x2="300" y2="565" stroke="white" stroke-width="3" opacity="0.3" />
</svg>`;
}

// Read all article files
const categories = fs.readdirSync(articlesDir);
let count = 0;

for (const cat of categories) {
  const catDir = path.join(articlesDir, cat);
  if (!fs.statSync(catDir).isDirectory()) continue;

  const files = fs.readdirSync(catDir).filter(f => f.endsWith(".md"));
  for (const file of files) {
    const filePath = path.join(catDir, file);
    let content = fs.readFileSync(filePath, "utf-8");

    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) continue;

    let frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/^title:\s*"(.+)"\s*$/m) || frontmatter.match(/^title:\s*(.+?)\s*$/m);
    const categoryMatch = frontmatter.match(/^category:\s*(.+)\s*$/m);

    if (!titleMatch || !categoryMatch) continue;

    const title = titleMatch[1];
    const category = categoryMatch[1].replace(/"/g, "").trim();

    const slug = file.replace(".md", "");
    const siteName = "AI Automation Hub";

    // Generate SVG
    const svg = generateSvg(title, category, siteName);
    const svgFileName = slug + ".svg";
    const svgPath = path.join(imagesDir, svgFileName);

    // Create directory if needed
    fs.mkdirSync(path.dirname(svgPath), { recursive: true });

    // Write SVG (always regenerate)
    fs.writeFileSync(svgPath, svg);

    const imagePath = "/images/articles/" + svgFileName;

    // Update frontmatter only if image field doesn't exist
    if (!frontmatter.includes("image:")) {
      const updatedContent = content.replace(
        /^---\n([\s\S]*?)\n---/,
        (match, fm) => {
          const updatedFm = fm + `\nimage: "${imagePath}"`;
          return "---\n" + updatedFm + "\n---";
        }
      );
      fs.writeFileSync(filePath, updatedContent);
    }

    count++;
    console.log(`[${count}] ${cat}/${file} -> ${imagePath}`);
  }
}

console.log(`\nDone! Generated ${count} article images.`);

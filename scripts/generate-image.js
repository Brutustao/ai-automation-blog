---<%
const category = process.argv[2] || "content-creation";
const title = process.argv[3] || "Article Title";
const slug = process.argv[4] || "article";

const colors = {
  "content-creation": { from: "#10b981", to: "#059669" },
  "email-marketing-ai": { from: "#0ea5e9", to: "#0284c7" },
  "ppc-ads": { from: "#f59e0b", to: "#d97706" },
  "social-media-automation": { from: "#ec4899", to: "#db2777" },
  "analytics-reporting": { from: "#8b5cf6", to: "#7c3aed" },
};

const c = colors[category] || colors["content-creation"];

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Word wrap: break title into lines of max ~25 chars
const words = title.split(" ");
const lines = [];
let line = "";
for (const w of words) {
  if ((line + " " + w).trim().length > 28) {
    lines.push(line.trim());
    line = w;
  } else {
    line += " " + w;
  }
}
if (line.trim()) lines.push(line.trim());

const fontSize = lines.length > 2 ? 42 : 52;
const yStart = lines.length > 2 ? 155 : 170;
const lineHeight = fontSize + 12;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
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
  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="200" fill="white" opacity="0.05" />
  <circle cx="1100" cy="500" r="250" fill="white" opacity="0.05" />
  <circle cx="600" cy="630" r="300" fill="white" opacity="0.03" />
  <!-- Category label -->
  <rect x="60" y="80" rx="20" ry="20" width="${escapeXml(category.replace(/-/g, " ").length * 10 + 40)}" height="40" fill="white" opacity="0.2" />
  <text x="80" y="106" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="white">${escapeXml(category.replace(/-/g, " "))}</text>
  <!-- Title -->
  ${lines.map((l, i) => `<text x="60" y="${yStart + i * lineHeight}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">${escapeXml(l)}</text>`).join("\n  ")}
  <!-- Site name -->
  <text x="60" y="560" font-family="Arial, sans-serif" font-size="18" fill="white" opacity="0.8">AI Automation Hub</text>
  <!-- Decorative line -->
  <line x1="60" y1="580" x2="300" y2="580" stroke="white" stroke-width="2" opacity="0.3" />
</svg>`;

process.stdout.write(svg);

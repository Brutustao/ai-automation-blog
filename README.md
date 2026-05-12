# AI Automation Hub

An SEO-optimized static content site targeting digital marketers, focused on AI-powered no-code automation workflows. Built with Astro and deployed on Cloudflare Pages.

**Live site:** https://ai-automation-blog.pages.dev

## Niche

AI automation tutorials, tool comparisons, and resource lists for digital marketers. Covers five categories:

- **Social Media Automation** — AI tools and workflows for scheduling, posting, and engagement
- **Email Marketing AI** — Automated campaigns, personalization, and segmentation
- **PPC & Ads** — AI-powered ad copy, keyword research, and campaign optimization
- **Content Creation** — AI writing, image generation, and video production
- **Analytics & Reporting** — Automated dashboards, predictive analytics, and data visualization

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | [Astro](https://astro.build/) 5 (static site generation, zero JS by default) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v3 |
| Content | Markdown/MDX with Astro content collections |
| Typography | @tailwindcss/typography (prose classes) |
| Analytics | Google Analytics 4 (GA4) |
| Deployment | [Cloudflare Pages](https://pages.cloudflare.com/) (global CDN, auto-deploy from GitHub) |
| Domain | Cloudflare (cost + SSL) |

## Content Structure

```
src/content/articles/
├── social-media-automation/
├── email-marketing-ai/
├── ppc-ads/
├── content-creation/
└── analytics-reporting/
```

Each article is a Markdown file with YAML frontmatter:

```yaml
---
title: "Article Title"
description: "SEO meta description"
date: 2025-06-15
category: social-media-automation
affiliate: true
---
```

## Monetization Strategy

1. **Affiliate Marketing** — SaaS recurring commissions (Zapier, Make, HubSpot, email tools, etc.)
2. **Digital Products** — Workflow templates, prompt packs, Notion dashboards
3. **Paid Course/Community** — Video course and member community (long-term)

## Development

```bash
# Install dependencies
npm install

# Start dev server (localhost:4321)
npm run dev

# Build for production
npm run build    # output → dist/

# Preview production build
npm run preview
```

## Adding New Articles

1. Create a `.md` file in the appropriate category folder under `src/content/articles/`
2. Add YAML frontmatter (title, description, date, category, affiliate)
3. Write content in Markdown
4. Build to verify: `npm run build`
5. Commit and push to GitHub → Cloudflare auto-deploys

## Deployment

Connected to Cloudflare Pages via GitHub. Every push to `main` triggers an automatic deploy:

1. Push to GitHub
2. Cloudflare detects the push
3. Runs `npm run build`
4. Deploys `dist/` to global CDN
5. Site is live in ~30 seconds

## Git Workflow

```bash
git add -A
git commit -m "feat: add article title"
git push
```

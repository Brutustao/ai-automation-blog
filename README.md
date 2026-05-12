# AI Automation Hub

Static content site built with Astro and Tailwind CSS.

## Development

```
npm install
npm run dev
```

## Build

```
npm run build
```

Output goes to `dist/`.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub/GitLab
2. Log in to Cloudflare Pages dashboard
3. Click "Create a project" → "Connect to Git"
4. Select this repository
5. Framework preset: Astro (auto-detected)
6. Build command: `npm run build`
7. Build output: `dist`
8. Deploy

## Add a Custom Domain

1. In Cloudflare Pages, go to your project → "Custom domains"
2. Add your domain (must be on Cloudflare)
3. Cloudflare auto-provisions SSL

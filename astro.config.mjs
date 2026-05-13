import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://ai-automation-blog.pages.dev",
  integrations: [mdx(), tailwind(), sitemap()],

  markdown: {
    rehypePlugins: [rehypeSlug],
  },

  adapter: cloudflare()
});
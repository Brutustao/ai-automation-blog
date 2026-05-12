import { defineCollection, z } from "astro:content";

const articlesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    category: z.enum([
      "social-media-automation",
      "email-marketing-ai",
      "ppc-ads",
      "content-creation",
      "analytics-reporting",
    ]),
    image: z.string().optional(),
    affiliate: z.boolean().default(false),
  }),
});

export const collections = {
  articles: articlesCollection,
};

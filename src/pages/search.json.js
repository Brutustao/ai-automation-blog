import { getCollection } from "astro:content";

export async function GET() {
  const articles = await getCollection("articles");
  const index = articles.map((a) => ({
    title: a.data.title,
    description: a.data.description,
    category: a.data.category,
    slug: a.slug,
    date: a.data.date.toISOString(),
  }));

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
}

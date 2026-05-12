export function formatCategory(slug: string): string {
  return slug.replace(/-/g, " ");
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function estimateReadingTime(body: string | undefined): number {
  if (!body) return 1;
  return Math.max(1, Math.ceil(body.split(/\s+/).length / 200));
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(body: string): TocEntry[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: TocEntry[] = [];
  let match;
  while ((match = headingRegex.exec(body)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");
    headings.push({ id, text, level });
  }
  return headings;
}

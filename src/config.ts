export const SITE = {
  title: "AI Automation Hub",
  description:
    "Discover the best AI tools and no-code automation workflows for digital marketers",
  url: "https://ai-automation-blog.pages.dev",
};

export interface Category {
  slug: string;
  title: string;
  description: string;
  color: string;
  lightBg: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "social-media-automation",
    title: "Social Media Automation",
    description:
      "Automate posting, scheduling, and engagement across social platforms with AI",
    color: "#ec4899",
    lightBg: "#fdf2f8",
    icon: "📱",
  },
  {
    slug: "email-marketing-ai",
    title: "Email Marketing AI",
    description:
      "AI-powered email campaigns, segmentation, and personalization workflows",
    color: "#0ea5e9",
    lightBg: "#f0f9ff",
    icon: "✉️",
  },
  {
    slug: "ppc-ads",
    title: "PPC & Ads",
    description:
      "Optimize ad spend and automate campaign management with AI tools",
    color: "#f59e0b",
    lightBg: "#fffbeb",
    icon: "📊",
  },
  {
    slug: "content-creation",
    title: "Content Creation",
    description:
      "AI writing, image generation, and video production workflows for marketers",
    color: "#10b981",
    lightBg: "#ecfdf5",
    icon: "✍️",
  },
  {
    slug: "analytics-reporting",
    title: "Analytics & Reporting",
    description:
      "Automate marketing dashboards, reporting, and data analysis with AI",
    color: "#8b5cf6",
    lightBg: "#f5f3ff",
    icon: "📈",
  },
];

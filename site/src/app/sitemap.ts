import type { MetadataRoute } from "next"

const BASE = "https://projektai.ru"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/brief",
    "/estimate",
    "/portfolio",
    "/blog",
    "/learn",
  ]

  const services = [
    "chatbot",
    "assistant",
    "automation",
    "website",
    "integration",
    "consulting",
  ]

  const blogPosts = [
    "ai-for-small-business",
    "how-to-create-chatbot",
    "ai-roi-calculation",
    "no-code-ai-tools",
    "ai-trends-2026",
    "ai-implementation-mistakes",
  ]

  return [
    ...staticPages.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...services.map((id) => ({
      url: `${BASE}/services/${id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((slug) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]
}

import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { getLiveModelsCatalog } from "@/lib/openrouter-catalog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BRAND.siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BRAND.siteUrl}/harga`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BRAND.siteUrl}/docs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BRAND.siteUrl}/cursor-ide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BRAND.siteUrl}/openclaw-hermes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BRAND.siteUrl}/status`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${BRAND.siteUrl}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BRAND.siteUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BRAND.siteUrl}/syarat-ketentuan`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BRAND.siteUrl}/privasi`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const liveModels = await getLiveModelsCatalog();
  const modelRoutes: MetadataRoute.Sitemap = liveModels.map((m) => ({
    url: `${BRAND.siteUrl}/models/${m.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: m.featured ? 0.8 : 0.65,
  }));

  return [...staticRoutes, ...modelRoutes];
}

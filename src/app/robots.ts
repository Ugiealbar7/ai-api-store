import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/harga",
          "/docs",
          "/models/",
          "/cursor-ide",
          "/openclaw-hermes",
          "/status",
          "/syarat-ketentuan",
          "/privasi",
          "/login",
          "/register",
        ],
        disallow: ["/dashboard/", "/api/"],
      },
    ],
    sitemap: `${BRAND.siteUrl}/sitemap.xml`,
    host: BRAND.siteUrl,
  };
}

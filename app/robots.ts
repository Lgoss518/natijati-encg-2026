import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: "https://orientation-lgoss.vercel.app/sitemap.xml",
    host: "https://orientation-lgoss.vercel.app",
  };
}

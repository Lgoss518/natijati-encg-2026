import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: "https://orientation-lgoss.vercel.app/",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
    alternates: { languages: { ar: "https://orientation-lgoss.vercel.app/", fr: "https://orientation-lgoss.vercel.app/" } },
  }];
}

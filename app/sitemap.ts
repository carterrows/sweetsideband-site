import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const lastModified = new Date();

  return [
    {
      url: new URL("/", baseUrl).toString(),
      lastModified,
    },
    {
      url: new URL("/shows", baseUrl).toString(),
      lastModified,
    },
    {
      url: new URL("/video", baseUrl).toString(),
      lastModified,
    },
  ];
}

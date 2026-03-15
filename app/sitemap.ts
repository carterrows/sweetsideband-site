import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
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
    {
      url: new URL("/video/photos", baseUrl).toString(),
      lastModified,
    },
  ];
}

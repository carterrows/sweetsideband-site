const defaultSiteUrl = "http://localhost:3000";

export function getSiteUrl() {
  const siteUrl = process.env.SITE_URL?.trim();
  return siteUrl || defaultSiteUrl;
}

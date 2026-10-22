// Shared by cached public readers and the admin routes that publish changes.
export const CONTENT_CACHE_TAGS = {
  shows: "public-shows",
  videos: "public-videos",
  photos: "public-photos"
} as const;

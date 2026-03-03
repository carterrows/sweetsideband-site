import type { StreamingLink } from "@/lib/types";

const SUPPORTED_SPOTIFY_TYPES = new Set([
  "artist",
  "album",
  "track",
  "playlist",
  "show",
  "episode"
]);

function getSpotifyEmbedUrl(link: StreamingLink): string | null {
  if (typeof link !== "string") {
    return null;
  }

  const value = link.trim();
  if (!value || value.toLowerCase() === "coming soon") {
    return null;
  }

  if (value.startsWith("spotify:")) {
    const [, type, id] = value.split(":");
    if (type && id && SUPPORTED_SPOTIFY_TYPES.has(type)) {
      return `https://open.spotify.com/embed/${type}/${id}`;
    }
    return null;
  }

  try {
    const parsed = new URL(value);
    if (!parsed.hostname.endsWith("spotify.com")) {
      return null;
    }

    const segments = parsed.pathname.split("/").filter(Boolean);
    const embedIndex = segments.indexOf("embed");

    if (embedIndex >= 0) {
      const type = segments[embedIndex + 1];
      const id = segments[embedIndex + 2];
      if (type && id && SUPPORTED_SPOTIFY_TYPES.has(type)) {
        return `https://open.spotify.com/embed/${type}/${id}`;
      }
      return null;
    }

    const typeIndex = segments.findIndex((segment) =>
      SUPPORTED_SPOTIFY_TYPES.has(segment)
    );
    if (typeIndex < 0 || !segments[typeIndex + 1]) {
      return null;
    }

    const type = segments[typeIndex];
    const id = segments[typeIndex + 1];
    return `https://open.spotify.com/embed/${type}/${id}`;
  } catch {
    return null;
  }
}

export default function SpotifyPreview({ spotify }: { spotify: StreamingLink }) {
  const embedUrl = getSpotifyEmbedUrl(spotify);

  if (!embedUrl) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-black/20 bg-haze/60 px-5 py-6 text-sm text-ink-600">
        Spotify preview coming soon.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <iframe
        title="Spotify music preview"
        src={embedUrl}
        width="100%"
        height="352"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}

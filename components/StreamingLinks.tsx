import Link from "next/link";
import type { StreamingLink } from "@/lib/types";
import { AppleMusicIcon, SpotifyIcon } from "@/components/icons/BrandIcons";

export default function StreamingLinks({
  spotify,
  appleMusic
}: {
  spotify: StreamingLink;
  appleMusic: StreamingLink;
}) {
  const isUrl = (link: StreamingLink): link is string =>
    typeof link === "string" && link.trim().toLowerCase() !== "coming soon";
  const spotifyUrl = isUrl(spotify) ? spotify : null;
  const appleUrl = isUrl(appleMusic) ? appleMusic : null;

  return (
    <div className="flex flex-wrap gap-4">
      {spotifyUrl ? (
        <Link
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Spotify"
          className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-white transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SpotifyIcon className="h-5 w-5" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-white opacity-40"
        >
          <SpotifyIcon aria-hidden="true" className="h-5 w-5" />
          <span className="sr-only">Spotify (Coming soon)</span>
        </button>
      )}
      {appleUrl ? (
        <Link
          href={appleUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Apple Music"
          className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-ink-800 transition hover:border-black/20 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <AppleMusicIcon className="h-5 w-5" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-black/10 px-6 py-3 text-ink-800 opacity-40"
        >
          <AppleMusicIcon aria-hidden="true" className="h-5 w-5" />
          <span className="sr-only">Apple Music (Coming soon)</span>
        </button>
      )}
    </div>
  );
}

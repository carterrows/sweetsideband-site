import Link from "next/link";
import type { StreamingLink } from "@/lib/types";

export default function StreamingLinks({
  spotify,
  appleMusic
}: {
  spotify: StreamingLink;
  appleMusic: StreamingLink;
}) {
  const isUrl = (link: StreamingLink): link is string =>
    typeof link === "string";
  const spotifyIsUrl = isUrl(spotify);
  const appleIsUrl = isUrl(appleMusic);
  const allComingSoon = !spotifyIsUrl && !appleIsUrl;

  return (
    <div className="flex flex-wrap gap-4">
      {allComingSoon ? (
        <span className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          Coming Soon
        </span>
      ) : (
        <>
          {spotifyIsUrl ? (
            <Link
              href={spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Listen on Spotify
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Coming Soon
            </span>
          )}
          {appleIsUrl ? (
            <Link
              href={appleMusic}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-800 transition hover:border-black/20 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Apple Music
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-800">
              Coming Soon
            </span>
          )}
        </>
      )}
    </div>
  );
}

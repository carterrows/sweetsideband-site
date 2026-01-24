import Link from "next/link";

export default function StreamingLinks({
  spotify,
  appleMusic
}: {
  spotify: string;
  appleMusic: string;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <Link
        href={spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Listen on Spotify
      </Link>
      <Link
        href={appleMusic}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-800 transition hover:border-black/20 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Apple Music
      </Link>
    </div>
  );
}

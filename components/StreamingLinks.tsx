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
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Listen on Spotify
      </Link>
      <Link
        href={appleMusic}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Apple Music
      </Link>
    </div>
  );
}

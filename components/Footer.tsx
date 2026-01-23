import Link from "next/link";
import type { Band } from "@/lib/types";

export default function Footer({ band }: { band: Band }) {
  return (
    <footer className="border-t border-white/10 bg-night-900/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl tracking-[0.25em] text-white">
            {band.name}
          </p>
          <p className="mt-2 text-sm text-white/70">
            {band.location} · {band.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
          {band.social.instagram && (
            <Link
              href={band.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              Instagram
            </Link>
          )}
          {band.social.tiktok && (
            <Link
              href={band.social.tiktok}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              TikTok
            </Link>
          )}
          {band.social.youtube && (
            <Link
              href={band.social.youtube}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              YouTube
            </Link>
          )}
          {band.social.bandcamp && (
            <Link
              href={band.social.bandcamp}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              Bandcamp
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}

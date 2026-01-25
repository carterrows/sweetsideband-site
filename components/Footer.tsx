import Link from "next/link";
import type { Band } from "@/lib/types";

export default function Footer({ band }: { band: Band }) {
  return (
    <footer className="border-t border-black/10 bg-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl tracking-[0.25em] text-accent">
            {band.name}
          </p>
          <p className="mt-2 text-sm text-ink-600">
            {band.location} · {band.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-600">
          {band.social.instagram && (
            <Link
              href={band.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-ink-900"
            >
              Instagram
            </Link>
          )}
          {band.social.tiktok && (
            <Link
              href={band.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-ink-900"
            >
              TikTok
            </Link>
          )}
          {band.social.youtube && (
            <Link
              href={band.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-ink-900"
            >
              YouTube
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}

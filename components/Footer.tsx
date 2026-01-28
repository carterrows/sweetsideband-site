import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import type { Band } from "@/lib/types";
import { TikTokIcon } from "@/components/icons/BrandIcons";

export default function Footer({ band }: { band: Band }) {
  return (
    <footer className="border-t border-black/10 bg-accent text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl tracking-[0.25em] text-white">
            {band.name}
          </p>
          <p className="mt-2 text-sm text-white">
            {band.location} · {band.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-white">
          {band.social.instagram && (
            <Link
              href={band.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center text-white transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
          {band.social.tiktok && (
            <Link
              href={band.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="inline-flex items-center justify-center text-white transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
            >
              <TikTokIcon className="h-5 w-5" />
            </Link>
          )}
          {band.social.youtube && (
            <Link
              href={band.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="inline-flex items-center justify-center text-white transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
            >
              <Youtube className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
          {band.social.facebook && (
            <Link
              href={band.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center justify-center text-white transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}

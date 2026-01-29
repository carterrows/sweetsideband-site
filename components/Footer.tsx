import type { Band } from "@/lib/types";
import SocialLinks from "@/components/SocialLinks";

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
          <SocialLinks
            social={band.social}
            linkClassName="inline-flex items-center justify-center text-white transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
          />
        </div>
      </div>
    </footer>
  );
}

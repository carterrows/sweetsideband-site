import type { Band } from "@/lib/types";
import SocialLinks from "@/components/SocialLinks";

export default function Footer({ band }: { band: Band }) {
  return (
    <footer className="border-t border-black/10 bg-accent text-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <img
            src="/sweetside_white.svg"
            alt="Sweetside"
            className="h-7 w-auto"
          />
          <p className="mt-2 text-sm">
            {band.location} · {band.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <SocialLinks
            social={band.social}
            linkClassName="inline-flex items-center justify-center text-paper transition hover:text-paper/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
          />
        </div>
      </div>
    </footer>
  );
}

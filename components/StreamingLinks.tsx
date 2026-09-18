import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { StreamingLink } from "@/lib/types";

export default function StreamingLinks({
  appleMusic
}: {
  appleMusic: StreamingLink;
}) {
  const isUrl = (link: StreamingLink): link is string =>
    typeof link === "string" && link.trim().toLowerCase() !== "coming soon";
  const appleUrl = isUrl(appleMusic) ? appleMusic : null;

  return (
    <div>
      {appleUrl ? (
        <Link
          href={appleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-start gap-1 text-lg uppercase text-accent transition hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-paper sm:text-xl"
        >
          <span>Apple Music</span>
          <ArrowUpRight
            aria-hidden="true"
            className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.75}
          />
        </Link>
      ) : (
        <span
          aria-label="Apple Music (Coming soon)"
          className="inline-flex items-start gap-1 text-lg uppercase text-accent opacity-40 sm:text-xl"
        >
          <span>Apple Music</span>
          <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={1.75} />
        </span>
      )}
    </div>
  );
}

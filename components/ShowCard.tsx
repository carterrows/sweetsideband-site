import Link from "next/link";
import type { Show } from "@/lib/types";
import { formatShowDate } from "@/lib/format";

export default function ShowCard({ show }: { show: Show }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-night-800/60 p-6 transition hover:-translate-y-1 hover:border-accent/60">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-accent">
          {formatShowDate(show.date)}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          {show.city}
        </h3>
        <p className="text-white/70">{show.venue}</p>
        {show.notes && <p className="mt-2 text-sm text-white/50">{show.notes}</p>}
      </div>
      {show.ticketUrl ? (
        <Link
          href={show.ticketUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Tickets
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
          Archive
        </span>
      )}
    </article>
  );
}

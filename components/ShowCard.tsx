import Link from "next/link";
import type { Show } from "@/lib/types";
import { formatShowDate } from "@/lib/format";

export default function ShowCard({ show }: { show: Show }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-paper p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/60">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-accent">
          {formatShowDate(show.date)}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-ink-900">
          {show.city}
        </h3>
        <p className="text-ink-600">{show.venue}</p>
        {show.notes && <p className="mt-2 text-sm text-ink-600">{show.notes}</p>}
      </div>
      {show.ticketUrl ? (
        <Link
          href={show.ticketUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Tickets
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
          Archive
        </span>
      )}
    </article>
  );
}

import Link from "next/link";
import type { Show } from "@/lib/types";
import { formatShowDate } from "@/lib/format";

export default function ShowCard({ show }: { show: Show }) {
  return (
    <li className="py-6">
      <div className="flex flex-col gap-3 md:grid md:grid-cols-[12rem_minmax(0,1fr)_auto] md:items-center md:gap-x-6">
        <p className="text-lg font-bold uppercase text-ink-900 sm:text-xl">
          {formatShowDate(show.date)}
        </p>
        <p className="text-lg uppercase text-ink-900 sm:text-xl">
          <span>{show.venue}</span>
          <span className="mx-3">|</span>
          <span>{show.city}</span>
        </p>
        {show.venueUrl ? (
          <Link
            href={show.venueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-40 items-center justify-center self-start rounded-sm border border-accent px-6 py-2 text-base font-semibold text-accent transition hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:justify-self-end"
          >
            VENUE
          </Link>
        ) : null}
      </div>
    </li>
  );
}

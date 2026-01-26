import Link from "next/link";
import type { Show } from "@/lib/types";
import { formatShowDate } from "@/lib/format";

export default function ShowCard({ show }: { show: Show }) {
  return (
    <li className="flex flex-col gap-2 py-6">
      <p className="text-lg font-semibold text-ink-900 sm:text-2xl">
        <span>{formatShowDate(show.date)}</span>
        <span className="mx-2 text-ink-400">—</span>
        {show.venueUrl ? (
          <Link
            href={show.venueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-900 underline decoration-black/20 underline-offset-4 transition hover:text-accent"
          >
            {show.venue}
          </Link>
        ) : (
          <span>{show.venue}</span>
        )}
      </p>
      <p className="text-base text-ink-700">{show.city}</p>
      {show.notes && <p className="text-sm text-ink-600">{show.notes}</p>}
    </li>
  );
}

"use client";

import { useId, useState } from "react";
import Image from "next/image";
import type { Show } from "@/lib/types";
import { formatShowDate } from "@/lib/format";

export default function ShowCard({
  show,
  showDetails
}: {
  show: Show;
  showDetails?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = useId();

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
        {showDetails ? (
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={detailsId}
            onClick={() => setIsExpanded((open) => !open)}
            className="inline-flex min-w-40 items-center justify-center self-start rounded-sm border border-accent px-6 py-2 text-base uppercase text-accent transition hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-lg md:justify-self-end"
          >
            <span>{isExpanded ? "Less info" : "More info"}</span>
          </button>
        ) : null}
      </div>
      {showDetails && isExpanded ? (
        <div
          id={detailsId}
          className="mt-5 grid gap-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_18rem]"
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                Address
              </dt>
              <dd className="mt-1 text-base text-ink-900">{show.venueAddress || "TBA"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                Show Time
              </dt>
              <dd className="mt-1 text-base text-ink-900">{show.showTime || "TBA"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                Doors Open
              </dt>
              <dd className="mt-1 text-base text-ink-900">
                {show.doorsOpenTime || "TBA"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                Cover Fee
              </dt>
              <dd className="mt-1 text-base text-ink-900">
                {formatCoverFee(show.coverFee)}
              </dd>
            </div>
          </dl>
          {show.posterSrc ? (
            <div className="overflow-hidden rounded-xl border border-black/10 bg-paper shadow-sm">
              <Image
                src={show.posterSrc}
                alt={`${show.venue} show poster`}
                width={900}
                height={1200}
                unoptimized
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function formatCoverFee(coverFee: Show["coverFee"]): string {
  if (coverFee === 0) {
    return "N/A";
  }

  if (coverFee == null) {
    return "TBA";
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: Number.isInteger(coverFee) ? 0 : 2
  }).format(coverFee);
}

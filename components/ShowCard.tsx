"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Show } from "@/lib/types";
import { formatShowDate } from "@/lib/format";

const infoButtonClassName =
  "inline-flex min-w-40 items-center justify-center self-start rounded-sm border border-accent px-6 py-2 text-base uppercase text-accent transition hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-lg";

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
            className={`${infoButtonClassName} md:justify-self-end`}
          >
            <span>{isExpanded ? "Less info" : "More info"}</span>
          </button>
        ) : null}
      </div>
      {showDetails ? (
        <div
          className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin-top] duration-200 ease-out ${
            isExpanded
              ? "mt-5 grid-rows-[1fr] opacity-100"
              : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
        >
          <div
            id={detailsId}
            aria-hidden={!isExpanded}
            className="min-h-0"
          >
            <div className="grid gap-8 pt-5 md:grid-cols-[minmax(0,1fr)_24rem]">
              <dl className="flex flex-col gap-5">
                <div className="md:grid md:grid-cols-[12rem_minmax(0,1fr)] md:gap-x-6">
                  <dt className="text-lg font-bold uppercase text-ink-900 sm:text-xl">
                    Address
                  </dt>
                  <dd className="mt-1 text-lg uppercase text-ink-900 sm:text-xl md:mt-0">
                    {show.venueAddress || "TBA"}
                  </dd>
                </div>
                <div className="md:grid md:grid-cols-[12rem_minmax(0,1fr)] md:gap-x-6">
                  <dt className="text-lg font-bold uppercase text-ink-900 sm:text-xl">
                    Show Time
                  </dt>
                  <dd className="mt-1 text-lg uppercase text-ink-900 sm:text-xl md:mt-0">
                    {show.showTime || "TBA"}
                  </dd>
                </div>
                <div className="md:grid md:grid-cols-[12rem_minmax(0,1fr)] md:gap-x-6">
                  <dt className="text-lg font-bold uppercase text-ink-900 sm:text-xl">
                    Doors Open
                  </dt>
                  <dd className="mt-1 text-lg uppercase text-ink-900 sm:text-xl md:mt-0">
                    {show.doorsOpenTime || "TBA"}
                  </dd>
                </div>
                <div className="md:grid md:grid-cols-[12rem_minmax(0,1fr)] md:gap-x-6">
                  <div className="flex flex-col items-start gap-3">
                    <dt className="text-lg font-bold uppercase text-ink-900 sm:text-xl">
                      Cover Fee
                    </dt>
                    {show.venueUrl ? (
                      <Link
                        href={show.venueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${infoButtonClassName} justify-start`}
                      >
                        Venue
                      </Link>
                    ) : null}
                  </div>
                  <dd className="mt-1 text-lg uppercase text-ink-900 sm:text-xl md:mt-0">
                    {show.coverFee || "TBA"}
                  </dd>
                </div>
              </dl>
              {show.posterSrc ? (
                <div className="overflow-hidden">
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
          </div>
        </div>
      ) : null}
    </li>
  );
}

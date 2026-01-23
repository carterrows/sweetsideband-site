import Link from "next/link";
import type { Metadata } from "next";
import { getBand, getShows } from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import ShowsList from "@/components/ShowsList";

export const metadata: Metadata = {
  title: "Shows",
  description: "Upcoming NEON STATIC tour dates and ticket links."
};

export default function ShowsPage() {
  const band = getBand();
  const shows = getShows();

  return (
    <section className="section">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading title="Shows" subtitle="Catch us live" />
            <Link
              href={`mailto:${band.email}`}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-accent transition hover:text-white"
            >
              Book the band →
            </Link>
          </div>
          <ShowsList shows={shows.upcoming} />
          <div className="rounded-2xl border border-white/10 bg-night-800/40 p-6 text-sm text-white/70">
            Can&apos;t make a date? Email {band.email} for private events, festivals, and collaborations.
          </div>
        </div>
      </div>
    </section>
  );
}

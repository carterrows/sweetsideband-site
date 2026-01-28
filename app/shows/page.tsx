import Link from "next/link";
import type { Metadata } from "next";
import { getBand, getShows } from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import ShowsList from "@/components/ShowsList";

export const metadata: Metadata = {
  title: "Shows",
  description: "Upcoming Sweetside tour dates and ticket links."
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
              className="text-xs font-semibold uppercase tracking-[0.2em] text-accent transition hover:text-ink-900"
            >
              Book the band →
            </Link>
          </div>
          <ShowsList shows={shows.upcoming} />
          <div className="rounded-2xl border border-black/10 bg-paper p-6 text-sm text-ink-600 shadow-sm">
            Can&apos;t make a date? Email {band.email} for booking/collaborations.
          </div>
          <div className="flex flex-col gap-12 pt-6">
            <div className="flex flex-col gap-4">
              <SectionHeading title="Past Shows" subtitle="Lights, noise, memories" />
              <p className="max-w-2xl text-ink-600">
                A snapshot of recent nights on the road.
              </p>
            </div>
            <ShowsList shows={shows.past} />
          </div>
        </div>
      </div>
    </section>
  );
}

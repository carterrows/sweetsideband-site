import Link from "next/link";
import type { Metadata } from "next";
import { getBand, getShows } from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import ShowsList from "@/components/ShowsList";
import SiteNotice from "@/components/SiteNotice";

export const metadata: Metadata = {
  title: "Shows",
  description: "Upcoming Sweetside shows with venue details and posters, plus past tour dates."
};

export const ensureStatic = "navigation";

export default async function ShowsPage() {
  const band = await getBand();
  const shows = await getShows();

  return (
    <section className="section">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading title="Shows" subtitle="Next shows" />
            <Link
              href={`mailto:${band.email}`}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-accent transition hover:text-ink-900"
            >
              Book the band →
            </Link>
          </div>
          <ShowsList shows={shows.upcoming} showDetails emptyMessage="More shows on the way. Check back soon." />
          <SiteNotice>
            Can&apos;t make a date? Email {band.email} for booking/collaborations.
          </SiteNotice>
          <div className="flex flex-col gap-12 pt-6">
            <div className="flex flex-col gap-4">
              <SectionHeading title="Past Shows" subtitle="Where we've played" />
            </div>
            <ShowsList shows={shows.past} />
          </div>
        </div>
      </div>
    </section>
  );
}

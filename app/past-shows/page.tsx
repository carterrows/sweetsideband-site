import type { Metadata } from "next";
import { getShows, getMedia } from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import ShowsList from "@/components/ShowsList";
import MediaGrid from "@/components/MediaGrid";

export const metadata: Metadata = {
  title: "Past Shows",
  description: "Photos and video from recent Sweetside shows."
};

export default function PastShowsPage() {
  const shows = getShows();
  const media = getMedia();

  return (
    <section className="section">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <SectionHeading title="Past Shows" subtitle="Lights, noise, memories" />
            <p className="max-w-2xl text-ink-600">
              A snapshot of recent nights on the road. Swap in your real photos or
              video links in data/media.json.
            </p>
          </div>
          <ShowsList shows={shows.past} />
          <MediaGrid items={media} />
        </div>
      </div>
    </section>
  );
}

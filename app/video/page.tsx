import type { Metadata } from "next";
import { getMedia } from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import MediaGrid from "@/components/MediaGrid";

export const metadata: Metadata = {
  title: "Video",
  description: "Live clips and photos from Sweetside shows."
};

export default function VideoPage() {
  const media = getMedia();

  return (
    <section className="section">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <SectionHeading title="Video" subtitle="Live clips + backstage snaps" />
            <p className="max-w-2xl text-ink-600">
              Photos and video pulled from recent shows.
            </p>
          </div>
          <MediaGrid items={media} />
        </div>
      </div>
    </section>
  );
}

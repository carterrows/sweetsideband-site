import type { Metadata } from "next";
import { getMedia } from "@/lib/content";
import GalleryModeTabs from "@/components/GalleryModeTabs";
import MediaGrid from "@/components/MediaGrid";

export const metadata: Metadata = {
  title: "Gallery | Videos",
  description: "Live clips and music videos from Sweetside."
};

export default function VideoGalleryPage() {
  const media = getMedia();

  return (
    <section className="pb-16 pt-6 md:pb-24 md:pt-10">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-8">
          <GalleryModeTabs active="video" />
          <MediaGrid items={media} />
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { getMedia } from "@/lib/content";
import GalleryModeTabs from "@/components/GalleryModeTabs";
import PhotoMasonryGrid from "@/components/PhotoMasonryGrid";

export const metadata: Metadata = {
  title: "Gallery | Photos",
  description: "Live photos from Sweetside shows."
};

export default function PhotoGalleryPage() {
  const media = getMedia();

  return (
    <section className="section">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-8">
          <GalleryModeTabs active="photo" />
          <PhotoMasonryGrid items={media} />
        </div>
      </div>
    </section>
  );
}

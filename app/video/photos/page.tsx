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
      <div className="mx-auto flex w-full flex-col gap-8">
        <div className="px-6">
          <GalleryModeTabs active="photo" />
        </div>
        <PhotoMasonryGrid items={media} />
      </div>
    </section>
  );
}

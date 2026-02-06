import type { Metadata } from "next";
import { getMedia } from "@/lib/content";
import type { MediaItem } from "@/lib/types";
import MediaGrid from "@/components/MediaGrid";
import PhotoSlideshow from "@/components/PhotoSlideshow";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Live clips and photos from Sweetside shows."
};

export default function VideoPage() {
  const media = getMedia();
  const photoItems = media.filter(
    (item): item is MediaItem & { type: "image"; src: string } =>
      item.type === "image" && Boolean(item.src)
  );

  return (
    <section className="section">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-12">
          {photoItems.length > 0 && <PhotoSlideshow items={photoItems} />}
          <div className="pt-2 md:pt-4">
            <MediaGrid items={media} />
          </div>
        </div>
      </div>
    </section>
  );
}

import VideoThumbnail from "@/components/VideoThumbnail";
import type { MediaItem } from "@/lib/types";

export default function MediaGrid({ items }: { items: MediaItem[] }) {
  const videoItems = items.filter(
    (item): item is MediaItem & { type: "video" } => item.type === "video"
  );

  return (
    <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {videoItems.map((item) => {
        const imgSrc = item.thumbnail ?? item.src;
        return (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent/70 focus-visible:outline-offset-4"
          >
            <VideoThumbnail src={imgSrc} alt={item.alt ?? item.title} />
            <div className="flex flex-col gap-1 text-center">
              <p className="text-lg font-bold text-accent md:text-xl">{item.title}</p>
              <span className="text-sm font-semibold tracking-[0.18em] text-ink-900 transition-opacity duration-200 group-hover:opacity-70 group-focus-visible:opacity-70">
                WATCH NOW
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

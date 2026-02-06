import Image from "next/image";
import type { MediaItem } from "@/lib/types";

export default function MediaGrid({ items }: { items: MediaItem[] }) {
  const videoItems = items.filter(
    (item): item is MediaItem & { type: "video" } => item.type === "video"
  );

  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {videoItems.map((item) => {
        const imgSrc = item.thumbnail ?? item.src;
        return (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent/70 focus-visible:outline-offset-4"
          >
            <div className="relative w-full overflow-hidden bg-haze aspect-[16/9]">
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={item.alt ?? item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-haze" />
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Image
                  src="/play.svg"
                  alt=""
                  width={70}
                  height={70}
                  className="translate-x-[1px] opacity-80 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 text-center">
              <p className="text-base font-bold text-accent">{item.title}</p>
              <span className="text-xs font-semibold tracking-[0.18em] text-ink-900 transition-opacity duration-200 group-hover:opacity-70 group-focus-visible:opacity-70">
                WATCH NOW
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

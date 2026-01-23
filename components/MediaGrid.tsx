import Image from "next/image";
import type { MediaItem } from "@/lib/types";

export default function MediaGrid({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const imgSrc = item.type === "video" ? item.thumbnail : item.src;
        return (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-paper shadow-sm transition hover:-translate-y-1 hover:border-accent/60"
          >
            <div className="relative h-56 w-full">
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
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/60 bg-paper/80 text-accent">
                    ▶
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-accent">
                  {item.type === "video" ? "Video" : "Photo"}
                </p>
                <p className="text-base font-semibold text-ink-900">{item.title}</p>
              </div>
              <span className="text-xs text-ink-600 group-hover:text-ink-900">
                Open
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

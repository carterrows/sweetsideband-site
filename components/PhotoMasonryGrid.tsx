"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import type { MediaItem } from "@/lib/types";

type PhotoItem = MediaItem & {
  type: "image";
  src: string;
};

export default function PhotoMasonryGrid({ items }: { items: MediaItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeImageSize, setActiveImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const photoItems = items.filter(
    (item): item is PhotoItem => item.type === "image" && Boolean(item.src)
  );
  const activeItem =
    activeIndex !== null ? (photoItems[activeIndex] ?? null) : null;

  const openLightbox = (index: number) => {
    setActiveImageSize(null);
    setActiveIndex(index);
  };

  const closeLightbox = () => {
    setActiveIndex(null);
    setActiveImageSize(null);
  };

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeItem]);

  useEffect(() => {
    if (!activeItem?.src) {
      return;
    }

    let isMounted = true;
    const image = new window.Image();

    image.onload = () => {
      if (!isMounted) {
        return;
      }
      setActiveImageSize({
        width: image.naturalWidth,
        height: image.naturalHeight
      });
    };

    image.onerror = () => {
      if (!isMounted) {
        return;
      }
      setActiveImageSize(null);
    };

    image.src = activeItem.src;

    return () => {
      isMounted = false;
    };
  }, [activeItem?.src]);

  const handleLightboxContentClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!activeImageSize || activeImageSize.width === 0 || activeImageSize.height === 0) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }

    const imageAspectRatio = activeImageSize.width / activeImageSize.height;
    const containerAspectRatio = containerWidth / containerHeight;

    let renderedWidth = containerWidth;
    let renderedHeight = containerHeight;

    if (containerAspectRatio > imageAspectRatio) {
      renderedHeight = containerHeight;
      renderedWidth = renderedHeight * imageAspectRatio;
    } else {
      renderedWidth = containerWidth;
      renderedHeight = renderedWidth / imageAspectRatio;
    }

    const offsetX = (containerWidth - renderedWidth) / 2;
    const offsetY = (containerHeight - renderedHeight) / 2;
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const isOnImage =
      clickX >= offsetX &&
      clickX <= offsetX + renderedWidth &&
      clickY >= offsetY &&
      clickY <= offsetY + renderedHeight;

    if (isOnImage) {
      event.stopPropagation();
    }
  };

  if (photoItems.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 bg-paper p-6 text-sm text-ink-600">
        No photos available yet.
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 gap-4 px-3 sm:columns-2 md:gap-5 md:px-6 2xl:columns-4">
        {photoItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openLightbox(index)}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden bg-haze text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 md:mb-5"
            aria-label={`Open photo: ${item.title}`}
          >
            <Image
              src={item.src}
              alt={item.alt ?? item.title}
              width={1600}
              height={1200}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="h-auto w-full transition duration-300 group-hover:scale-[1.02] group-focus-visible:scale-[1.02]"
              unoptimized
            />
          </button>
        ))}
      </div>
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 backdrop-blur-2xl"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.alt ?? activeItem.title}
        >
          <div
            className="relative h-[90vh] w-[95vw] max-w-[1600px]"
            onClick={handleLightboxContentClick}
          >
            <Image
              src={activeItem.src}
              alt={activeItem.alt ?? activeItem.title}
              fill
              sizes="95vw"
              className="object-contain"
              unoptimized
              priority
            />
          </div>
          <button
            type="button"
            aria-label="Close expanded photo"
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded border border-paper/40 bg-ink-900/50 px-3 py-1 text-sm font-semibold tracking-[0.08em] text-paper hover:bg-ink-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 md:right-6 md:top-6"
          >
            CLOSE
          </button>
        </div>
      )}
    </>
  );
}

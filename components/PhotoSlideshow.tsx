"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import type { MediaItem } from "@/lib/types";

type PhotoItem = MediaItem & {
  type: "image";
  src: string;
};

type PhotoSlideshowProps = {
  items: PhotoItem[];
};

const SWIPE_THRESHOLD_PX = 40;

export default function PhotoSlideshow({ items }: PhotoSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageSize, setActiveImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const totalItems = items.length;

  const goTo = useCallback(
    (index: number) => {
      if (totalItems === 0) {
        return;
      }
      const wrappedIndex = ((index % totalItems) + totalItems) % totalItems;
      setActiveIndex(wrappedIndex);
    },
    [totalItems]
  );

  const goToPrevious = useCallback(() => {
    if (totalItems === 0) {
      return;
    }
    setActiveIndex((current) => (current - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const goToNext = useCallback(() => {
    if (totalItems === 0) {
      return;
    }
    setActiveIndex((current) => (current + 1) % totalItems);
  }, [totalItems]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (totalItems <= 1) {
          return;
        }
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + totalItems) % totalItems);
      }

      if (event.key === "ArrowRight") {
        if (totalItems <= 1) {
          return;
        }
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % totalItems);
      }

      if (event.key === "Escape" && isLightboxOpen) {
        event.preventDefault();
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, totalItems]);

  if (totalItems === 0) {
    return null;
  }

  const activeItem = items[activeIndex];

  useEffect(() => {
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
  }, [activeItem.src]);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    pointerStartX.current = event.clientX;
    didSwipe.current = false;
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (pointerStartX.current === null || totalItems <= 1) {
      pointerStartX.current = null;
      return;
    }

    const delta = event.clientX - pointerStartX.current;
    pointerStartX.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
      return;
    }

    didSwipe.current = true;

    if (delta > 0) {
      goToPrevious();
      return;
    }

    goToNext();
  };

  const resetPointer = () => {
    pointerStartX.current = null;
  };

  const openLightbox = () => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    setIsLightboxOpen(true);
  };

  const handleLightboxContentClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!activeImageSize || activeImageSize.width === 0 || activeImageSize.height === 0) {
      event.stopPropagation();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    if (containerWidth === 0 || containerHeight === 0) {
      event.stopPropagation();
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 md:gap-4">
        {totalItems > 1 && (
          <button
            type="button"
            aria-label="Previous photo"
            onClick={goToPrevious}
            className="shrink-0 p-0 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <Image src="/arrow_left.svg" alt="" width={40} height={40} />
          </button>
        )}
        <button
          type="button"
          aria-label={`Open photo: ${activeItem.title}`}
          className="relative w-full min-w-0 flex-1 overflow-hidden bg-haze aspect-video"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={resetPointer}
          onPointerLeave={resetPointer}
          onClick={openLightbox}
        >
          <Image
            src={activeItem.src}
            alt={activeItem.alt ?? activeItem.title}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-contain"
            unoptimized
            priority
          />
        </button>
        {totalItems > 1 && (
          <button
            type="button"
            aria-label="Next photo"
            onClick={goToNext}
            className="shrink-0 p-0 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <Image src="/arrow_right.svg" alt="" width={40} height={40} />
          </button>
        )}
      </div>
      {totalItems > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to photo ${index + 1}: ${item.title}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => goTo(index)}
                className={`h-2.5 w-2.5 rounded-full border transition ${
                  isActive
                    ? "border-accent bg-accent"
                    : "border-ink-700/50 bg-paper/70 hover:border-accent/80 hover:bg-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                }`}
              />
            );
          })}
        </div>
      )}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 backdrop-blur-2xl"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.alt ?? activeItem.title}
        >
          {totalItems > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(event) => {
                  event.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 p-0 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 md:left-6"
              >
                <Image src="/arrow_left.svg" alt="" width={56} height={56} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(event) => {
                  event.stopPropagation();
                  goToNext();
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 p-0 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 md:right-6"
              >
                <Image src="/arrow_right.svg" alt="" width={56} height={56} />
              </button>
            </>
          )}
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
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 rounded border border-paper/40 bg-ink-900/50 px-3 py-1 text-sm font-semibold tracking-[0.08em] text-paper hover:bg-ink-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 md:right-6 md:top-6"
          >
            CLOSE
          </button>
        </div>
      )}
    </div>
  );
}

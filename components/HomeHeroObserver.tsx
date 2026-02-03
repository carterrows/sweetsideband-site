"use client";

import { useEffect, useRef } from "react";
import { useNavbarHero } from "@/components/NavbarHeroContext";

export default function HomeHeroObserver() {
  const { setIsHeroActive } = useNavbarHero();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const main = document.querySelector("main");
    const header = document.querySelector("header");
    if (!main || !header) {
      return;
    }

    const updateNavHeight = () => {
      const height = header.getBoundingClientRect().height;
      main.style.setProperty("--nav-height", `${height}px`);
    };

    updateNavHeight();
    window.addEventListener("resize", updateNavHeight);

    return () => {
      window.removeEventListener("resize", updateNavHeight);
      main.style.removeProperty("--nav-height");
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isAboveSentinel = entry.boundingClientRect.top > 0;
        setIsHeroActive(entry.isIntersecting || isAboveSentinel);
      },
      {
        threshold: 0
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      setIsHeroActive(false);
    };
  }, [setIsHeroActive]);

  return (
    <div
      ref={sentinelRef}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
      aria-hidden="true"
    />
  );
}

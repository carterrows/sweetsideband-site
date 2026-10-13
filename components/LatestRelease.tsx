"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { latestRelease } from "@/lib/latest-release";

export default function LatestRelease() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = video?.closest("section");
    if (!video || !section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isVisible = false;
    const syncPlayback = () => {
      if (isVisible && !document.hidden && !reducedMotion.matches) {
        if (!video.getAttribute("src")) video.src = latestRelease.loop;
        void video.play().catch(() => {
          // Keep the poster available if autoplay is blocked.
        });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.1 });
    observer.observe(section);
    reducedMotion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, []);

  return (
    <section aria-label="Latest release" className="relative z-10 flex min-h-[max(800px,100svh)] flex-col justify-end overflow-hidden bg-ink-900 text-white [clip-path:inset(0)] md:justify-center">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 motion-reduce:absolute">
        <Image src={latestRelease.poster} alt="" fill sizes="100vw" className="object-cover object-center" unoptimized />
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={latestRelease.poster}
          aria-hidden="true"
          tabIndex={-1}
          onError={() => setVideoFailed(true)}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden ${videoFailed ? "hidden" : ""}`}
        />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-black/60 via-black/15 to-transparent md:block" />
      </div>
      <div className="relative mx-auto w-full max-w-6xl pt-80 md:px-6 md:py-16">
        <div className="flex w-full flex-col items-center bg-black/50 px-6 pt-6 pb-16 text-center md:max-w-64 md:bg-transparent md:p-0 lg:max-w-72">
          <a
            href={latestRelease.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Listen to ${latestRelease.title} on Spotify`}
            className="block w-44 shadow-xl transition-transform duration-300 hover:scale-[1.03] focus-visible:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transform-none sm:w-52 md:w-full"
          >
            <Image src={latestRelease.cover} alt={`${latestRelease.title} single cover art`} width={1200} height={1200} sizes="(max-width: 639px) 176px, (max-width: 767px) 208px, 288px" className="h-auto w-full" unoptimized />
          </a>
          <h2 className="mt-5 text-4xl tracking-wide md:mt-6">{latestRelease.title}</h2>
          <a
            href={latestRelease.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center border border-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-white hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Listen now
          </a>
          <a
            href={latestRelease.appleMusicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-4 inline-flex items-center gap-1 text-sm uppercase tracking-wide text-accent hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Apple Music
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" />
          </a>
        </div>
      </div>
    </section>
  );
}

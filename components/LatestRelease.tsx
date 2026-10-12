import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import VideoThumbnail from "@/components/VideoThumbnail";
import { latestRelease } from "@/lib/latest-release";

export default function LatestRelease() {
  return (
    <section className="section relative z-10 bg-paper py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading title={latestRelease.title} />
        <div className="mt-8 grid items-center gap-8 md:grid-cols-[1fr_1.5fr] md:gap-10">
          <a
            href={latestRelease.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Listen to Not My Type on Spotify"
            className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <Image
              src={latestRelease.cover}
              alt="Not My Type single cover art"
              width={1200}
              height={1200}
              sizes="(max-width: 767px) calc(100vw - 48px), 425px"
              className="h-auto w-full"
              unoptimized
            />
          </a>
          <a
            href={latestRelease.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch the Not My Type official music video on YouTube"
            className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <VideoThumbnail src={latestRelease.thumbnail} alt="Not My Type official music video" aspect="photo" />
          </a>
        </div>
      </div>
    </section>
  );
}

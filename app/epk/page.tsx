import Image from "next/image";
import PageLink from "@/components/PageLink";
import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import { getBand, getShows } from "@/lib/content";
import { latestRelease } from "@/lib/latest-release";
import HomeHeroObserver from "@/components/HomeHeroObserver";
import SectionHeading from "@/components/SectionHeading";
import SocialLinks from "@/components/SocialLinks";
import SpotifyPreview from "@/components/SpotifyPreview";
import StreamingLinks from "@/components/StreamingLinks";
import ShowsList from "@/components/ShowsList";
import VideoThumbnail from "@/components/VideoThumbnail";

export const metadata: Metadata = {
  title: "Press Kit",
  description: "Sweetside electronic press kit: biography, music, videos, live highlights, booking contact, and stage plot.",
  openGraph: {
    title: "Sweetside Press Kit",
    description: "Meet Hamilton indie pop/rock band Sweetside. Music, biography, live highlights, and booking details.",
    images: ["/images/epk/sweetside-band-wall.webp"]
  }
};

export const dynamic = "force-static";

const textLinkClass = "group inline-flex items-center gap-2 text-base font-semibold text-accent transition hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export default function EpkPage() {
  const band = getBand();
  const shows = getShows();

  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#ad927c]">
        <Image
          src="/images/epk/sweetside-band-wall.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] md:object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent md:bg-gradient-to-r md:from-black/35 md:via-transparent" />
      </div>

      <section className="relative z-10 flex min-h-[calc(100svh-var(--nav-height,0px))] flex-col px-6 pb-12 pt-12 md:justify-center md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="max-w-[15rem] text-6xl font-semibold leading-[0.95] tracking-wide text-white drop-shadow-md sm:max-w-sm sm:text-7xl lg:text-8xl">
            Sweetside<br />Press Kit
          </h1>
        </div>
        <a href="#press-kit" aria-label="Explore the press kit" className="absolute bottom-10 left-1/2 -translate-x-1/2 p-3 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <ArrowDown aria-hidden="true" className="h-6 w-6" />
        </a>
        <HomeHeroObserver />
      </section>

      <div id="press-kit" className="relative z-10 scroll-mt-20 bg-paper">
        <section className="section border-b border-black/10">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-4xl tracking-wide text-accent md:text-5xl">Sweetside</h2>
              <p className="mt-3 text-lg text-ink-700">Indie pop / rock · Hamilton, Ontario</p>
              <div className="mt-6 flex flex-wrap gap-5">
                <SocialLinks social={band.social} streaming={band.streaming} linkClassName="inline-flex p-1 text-accent transition hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" iconClassName="h-6 w-6" />
              </div>
            </div>
            <div className="md:justify-self-end">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">Booking & press</p>
              <a href={`mailto:${band.email}`} className={`${textLinkClass} break-all`}>
                {band.email}<ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0" />
              </a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div>
              <SectionHeading title="Biography" />
              <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-700 md:text-lg">
                {band.longBio.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
            <div className="space-y-12">
              <div>
                <SectionHeading title="Music" />
                <SpotifyPreview spotify={band.streaming.spotify} />
                <div className="mt-5"><StreamingLinks appleMusic={band.streaming.appleMusic} /></div>
              </div>
              <div>
                <SectionHeading title="Live highlights" />
                <ul className="mt-6 space-y-4 border-l-2 border-accent pl-5 text-base text-ink-700 md:text-lg">
                  <li>NXNE Music Festival - Toronto 2026</li>
                  <li>NXNE @ The CNE - Toronto 2026</li>
                  <li>The Canadian National Exhibition - Toronto 2026</li>
                  <li>Breaking Sound @ The Rivoli - Toronto 2026</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-haze/40">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 md:grid-cols-2 md:gap-16">
            <div>
              <SectionHeading title="Not My Type" />
              <a href={latestRelease.videoUrl} target="_blank" rel="noopener noreferrer" aria-label="Watch the Not My Type official music video on YouTube" className="group mt-6 block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                <VideoThumbnail src={latestRelease.thumbnail} alt="Not My Type official music video" aspect="photo" />
              </a>
              <a href={latestRelease.spotifyUrl} target="_blank" rel="noopener noreferrer" className={`${textLinkClass} mt-5`}>
                Listen on Spotify<ArrowUpRight aria-hidden="true" className="h-5 w-5" />
              </a>
            </div>
            <div>
              <SectionHeading title="Photos" />
              <div className="relative mt-6 aspect-[3/2] overflow-hidden bg-haze">
                <Image src="/images/epk/epk-image.webp" alt="Sweetside band portrait" fill sizes="(max-width: 767px) calc(100vw - 48px), 520px" className="object-cover" unoptimized />
              </div>
              <PageLink href="/video/photos" className={`${textLinkClass} mt-5`}>View gallery<ArrowUpRight aria-hidden="true" className="h-5 w-5" /></PageLink>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 md:grid-cols-2 md:gap-16">
            <div>
              <SectionHeading title="Next shows" />
              <div className="mt-6"><ShowsList shows={shows.upcoming.slice(0, 3)} emptyMessage="More shows on the way. Check back soon." /></div>
              <PageLink href="/shows" className={`${textLinkClass} mt-6`}>All shows<ArrowUpRight aria-hidden="true" className="h-5 w-5" /></PageLink>
            </div>
            <div>
              <SectionHeading title="Downloadables" />
              <a href="/downloads/sweetside-stage-plot-and-input-list.pdf" download className="mt-6 inline-flex items-center gap-3 border border-accent bg-accent px-5 py-4 text-sm font-semibold text-white transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                <Download aria-hidden="true" className="h-5 w-5 shrink-0" />Stage plot & input list (PDF)
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

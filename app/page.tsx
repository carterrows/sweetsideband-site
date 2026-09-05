import Image from "next/image";
import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import {
  getBand,
  getFeaturedShowPhoto,
  getMembers,
  getShows
} from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import ShowsList from "@/components/ShowsList";
import StreamingLinks from "@/components/StreamingLinks";
import SpotifyPreview from "@/components/SpotifyPreview";
import ContactSection from "@/components/ContactSection";
import MemberCard from "@/components/MemberCard";
import HomeHeroObserver from "@/components/HomeHeroObserver";

export const metadata: Metadata = {
  title: "Home",
  description: "Official Sweetside site: upcoming shows, live video, merch, and contact/booking. Catch the next date and stream the latest."
};

export const dynamic = "force-static";

export default function HomePage() {
  const band = getBand();
  const members = getMembers();
  const shows = getShows();
  const featuredPhoto = getFeaturedShowPhoto();
  const upcoming = shows.upcoming.slice(0, 3);
  const spotifyLink = band.streaming.spotify;
  const isSpotifyUrl = (link: typeof spotifyLink): link is string =>
    typeof link === "string" && link.trim().toLowerCase() !== "coming soon";

  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Image
          src="/background_mobile.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 0px, 100vw"
          className="block object-cover object-top md:hidden"
        />
        <Image
          src="/background.jpeg"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 100vw, 0px"
          className="hidden object-cover object-top md:block"
        />
      </div>

      <section className="relative z-10 min-h-[calc(100vh-var(--nav-height,0px))] min-h-[calc(100svh-var(--nav-height,0px))]">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center sm:gap-6">
          <Image
            src="/sweetside_white.svg"
            alt={band.name}
            width={354}
            height={92}
            className="w-56 max-w-[85vw] drop-shadow-2xl sm:w-72 md:w-[26rem] lg:w-[32rem]"
          />
          <div className="flex flex-wrap justify-center gap-4">
            {isSpotifyUrl(spotifyLink) ? (
              <a
                href={spotifyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-6 sm:py-3 sm:text-xs"
              >
                Listen
              </a>
            ) : (
              <span className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white sm:px-6 sm:py-3 sm:text-xs">
                Coming Soon
              </span>
            )}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center px-6 sm:bottom-10">
          <div className="inline-flex flex-col items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-paper/80 sm:text-[0.7rem]">
            <span>Scroll Down</span>
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          </div>
        </div>
        <HomeHeroObserver />
      </section>

      <section className="section py-12 md:py-16 relative z-10 bg-paper">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionHeading title="Upcoming" subtitle="Next shows" />
            </div>
            <ShowsList shows={upcoming} showDetails />
          </div>
        </div>
      </section>

      <section className="section py-12 md:py-16 relative z-10 bg-paper">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionHeading title="Listen" subtitle="Stream the latest" />
          <SpotifyPreview spotify={band.streaming.spotify} />
          <div className="mt-5">
            <StreamingLinks
              spotify={band.streaming.spotify}
              appleMusic={band.streaming.appleMusic}
            />
          </div>
        </div>
      </section>

      <section className="section py-12 md:py-16 relative z-10 bg-paper">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div
            className={`grid items-center gap-10 md:gap-12 ${
              featuredPhoto ? "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : ""
            }`}
          >
            <div className="max-w-xl">
              <SectionHeading title="Bio" subtitle="Who we are" />
              <p className="mt-6 whitespace-pre-line text-left text-base leading-relaxed text-ink-700 md:text-lg">
                {band.bio}
              </p>
            </div>
            {featuredPhoto?.src && (
              <div className="relative ml-2 mt-2 sm:ml-3 sm:mt-3">
                <div
                  aria-hidden="true"
                  className="absolute -bottom-2 -left-2 h-full w-full bg-accent sm:-bottom-3 sm:-left-3"
                />
                <div className="relative aspect-[4/3] overflow-hidden bg-haze shadow-sm">
                  <Image
                    src={featuredPhoto.src}
                    alt={featuredPhoto.alt ?? featuredPhoto.title}
                    fill
                    sizes="(max-width: 1023px) calc(100vw - 48px), 52vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section py-12 md:py-16 relative z-10 bg-paper">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-10">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
            <ContactSection band={band} />
          </div>
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBand, getMembers, getShows } from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import ShowsList from "@/components/ShowsList";
import StreamingLinks from "@/components/StreamingLinks";
import ContactSection from "@/components/ContactSection";
import MemberCard from "@/components/MemberCard";

export const metadata: Metadata = {
  title: "Home",
  description: "Sweetside - modern synth-rock with electric live shows."
};

export default function HomePage() {
  const band = getBand();
  const members = getMembers();
  const shows = getShows();
  const upcoming = shows.upcoming.slice(0, 3);
  const spotifyLink = band.streaming.spotify;
  const isSpotifyUrl = (link: typeof spotifyLink): link is string =>
    typeof link === "string" && link.trim().toLowerCase() !== "coming soon";

  return (
    <div>
      <section className="relative min-h-[calc(100vh-4rem)] min-h-[calc(100svh-4rem)] overflow-hidden">
        <Image
          src="/background.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center sm:gap-6">
          <img
            src="/sweetside_white.svg"
            alt={band.name}
            className="w-44 max-w-[80vw] drop-shadow-2xl sm:w-60 md:w-80 lg:w-96"
          />
          <div className="flex flex-wrap justify-center gap-4">
            {isSpotifyUrl(spotifyLink) ? (
              <Link
                href={spotifyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-6 sm:py-3 sm:text-xs"
              >
                Listen
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white sm:px-6 sm:py-3 sm:text-xs">
                Coming Soon
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="section" id="content">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionHeading title="Upcoming" subtitle="Next shows" />
              <Link
                href="/shows"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-accent transition hover:text-ink-900"
              >
                Full schedule →
              </Link>
            </div>
            <ShowsList shows={upcoming} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionHeading title="Listen" subtitle="Stream the latest" />
          <div className="mt-6">
            <StreamingLinks
              spotify={band.streaming.spotify}
              appleMusic={band.streaming.appleMusic}
            />
          </div>
        </div>
      </section>

      <section className="section">
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

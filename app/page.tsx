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
      <section className="section hero-grid">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6">
          <div>
            <h1 className="text-5xl leading-none text-ink-900 sm:text-6xl lg:text-7xl">
              <img
                src="/sweetside_black.svg"
                alt={band.name}
                className="inline-block h-[1em] w-auto align-baseline"
              />
            </h1>
            <div className="mt-8 flex flex-wrap gap-4">
              {isSpotifyUrl(spotifyLink) ? (
                <Link
                  href={spotifyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Listen
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  Coming Soon
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
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

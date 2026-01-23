import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBand, getShows } from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import ShowsList from "@/components/ShowsList";
import StreamingLinks from "@/components/StreamingLinks";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Home",
  description: "Sweetside - modern synth-rock with electric live shows."
};

export default function HomePage() {
  const band = getBand();
  const shows = getShows();
  const upcoming = shows.upcoming.slice(0, 3);

  return (
    <div>
      <section className="section hero-grid">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="text-5xl leading-none text-ink-900 sm:text-6xl lg:text-7xl">
              {band.name}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-600 md:text-xl">
              {band.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={band.streaming.spotify}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Listen
              </Link>
              <Link
                href="/shows"
                className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-800 transition hover:border-black/30 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                See Shows
              </Link>
            </div>
          </div>
          <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-black/10 bg-haze md:h-96">
            <Image
              src="/images/hero-band.svg"
              alt="Sweetside live"
              fill
              priority
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionHeading title="About" subtitle="Fast, luminous, and loud." />
          <p className="mt-6 max-w-3xl text-lg text-ink-600">
            {band.bio}
          </p>
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
          <ContactSection band={band} />
        </div>
      </section>
    </div>
  );
}

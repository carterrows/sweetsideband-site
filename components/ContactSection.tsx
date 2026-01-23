import Link from "next/link";
import type { Band } from "@/lib/types";

export default function ContactSection({ band }: { band: Band }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-night-800/60 p-8 md:p-12">
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-accent">
            Contact
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            Let&apos;s make noise together.
          </h2>
          <p className="mt-4 text-white/70">
            Booking, press, collaborations — drop a line and we&apos;ll get back fast.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/70">
            <Link
              href={`mailto:${band.email}`}
              className="rounded-full border border-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition hover:bg-accent hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {band.email}
            </Link>
            {band.social.instagram && (
              <Link
                href={band.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                Instagram
              </Link>
            )}
            {band.social.youtube && (
              <Link
                href={band.social.youtube}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                YouTube
              </Link>
            )}
          </div>
        </div>
        <form
          action={`mailto:${band.email}`}
          method="post"
          encType="text/plain"
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Name
            <input
              name="name"
              required
              className="rounded-lg border border-white/20 bg-night-900 px-4 py-2 text-white outline-none transition focus:border-accent"
              placeholder="Your name"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-lg border border-white/20 bg-night-900 px-4 py-2 text-white outline-none transition focus:border-accent"
              placeholder="you@email.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Message
            <textarea
              name="message"
              required
              rows={4}
              className="rounded-lg border border-white/20 bg-night-900 px-4 py-2 text-white outline-none transition focus:border-accent"
              placeholder="Tell us about the gig or idea."
            />
          </label>
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Send via Email Client
          </button>
        </form>
      </div>
    </section>
  );
}

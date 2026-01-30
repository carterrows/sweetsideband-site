"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Instagram, Youtube } from "lucide-react";
import type { Band } from "@/lib/types";

export default function ContactSection({ band }: { band: Band }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();
  const isValid = trimmedSubject.length > 0 && trimmedMessage.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      return;
    }

    const mailtoHref = `mailto:${band.email}?subject=${encodeURIComponent(
      trimmedSubject
    )}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoHref;
  };

  return (
    <section
      id="contact"
      className="rounded-3xl border border-black/10 bg-[#fffff7] p-8 shadow-sm md:p-12"
    >
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-accent">
            Contact
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-ink-900 md:text-4xl">
            Get in touch.
          </h2>
          <p className="mt-4 text-ink-600">
            Reach out for booking/collaborations!
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-600">
            <Link
              href={`mailto:${band.email}`}
              className="rounded-full border border-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {band.email}
            </Link>
            {band.social.instagram && (
              <Link
                href={band.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center transition hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </Link>
            )}
            {band.social.youtube && (
              <Link
                href={band.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="inline-flex items-center justify-center transition hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Youtube className="h-5 w-5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-ink-600">
            Subject
            <input
              name="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
              className="rounded-lg border border-black/10 bg-paper px-4 py-2 text-ink-900 outline-none transition focus:border-accent"
              placeholder="Booking inquiry"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-600">
            Message
            <textarea
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              rows={4}
              className="rounded-lg border border-black/10 bg-paper px-4 py-2 text-ink-900 outline-none transition focus:border-accent"
              placeholder="Tell us about the gig or idea."
            />
          </label>
          <button
            type="submit"
            disabled={!isValid}
            className="mt-2 inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send via Email Client
          </button>
        </form>
      </div>
    </section>
  );
}

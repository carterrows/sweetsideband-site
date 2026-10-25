import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import PageLink from "@/components/PageLink";

export default function AboutSection({ bio }: { bio: string }) {
  return (
    <div className="relative z-10 overflow-hidden [clip-path:inset(0)] [--about-height:max(520px,min(80svh,50vw))]">
      {/* Fetch the visible rendition on page load, before this section scrolls into view. */}
      <link
        rel="preload"
        as="image"
        href="/images/about/sweetside-band-wall-responsive.webp"
        media="(min-width: 1024px)"
      />
      <link
        rel="preload"
        as="image"
        href="/images/about/sweetside-band-mobile.webp"
        media="(max-width: 1023px)"
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 hidden lg:block lg:motion-reduce:absolute">
        {/* Retain the original vertical area so fixed cover sizing preserves the left wall. */}
        <Image
          src="/images/about/sweetside-band-wall-responsive.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-right"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/10 to-transparent" />
      </div>
      <section aria-labelledby="about-heading" className="relative z-10 bg-ink-900 text-white lg:flex lg:min-h-[var(--about-height)] lg:items-center lg:bg-transparent">
        <Image
          src="/images/about/sweetside-band-mobile.webp"
          alt="Sweetside standing together in front of a brick wall"
          width={1200}
          height={800}
          sizes="(max-width: 1023px) 100vw, 0px"
          className="h-auto w-full lg:hidden"
          unoptimized
        />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-10 lg:py-12">
          <div className="max-w-xl lg:max-w-[min(23rem,34vw)]">
            <h2 id="about-heading" className="text-3xl font-semibold tracking-[0.06em] lg:text-4xl">
              Who we are
            </h2>
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed lg:text-lg">
              {bio}
            </p>
            <PageLink
              href="/epk"
              className="group mt-5 inline-flex items-start gap-1 text-lg uppercase text-accent transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-xl"
            >
              <span>EPK</span>
              <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" strokeWidth={1.75} />
            </PageLink>
          </div>
        </div>
      </section>
    </div>
  );
}

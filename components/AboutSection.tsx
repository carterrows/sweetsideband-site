import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import PageLink from "@/components/PageLink";

export default function AboutSection({ bio }: { bio: string }) {
  return (
    <section aria-labelledby="about-heading" className="relative z-10 flex min-h-[max(800px,100svh)] flex-col justify-end overflow-hidden bg-ink-900 text-white [clip-path:inset(0)] md:justify-center">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 motion-reduce:absolute">
        <Image
          src="/images/about/sweetside-band-wall.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[65%_center] md:object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/65 md:via-black/10" />
      </div>
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-96 pb-16 md:py-24">
        <div className="max-w-sm">
          <h2 id="about-heading" className="text-3xl font-semibold tracking-[0.06em] md:text-4xl">
            Who we are
          </h2>
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed md:text-lg">
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
  );
}

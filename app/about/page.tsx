import type { Metadata } from "next";
import { getBand, getMembers } from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import MemberCard from "@/components/MemberCard";

export const metadata: Metadata = {
  title: "About",
  description: "Meet the members of Sweetside."
};

export default function AboutPage() {
  const band = getBand();
  const members = getMembers();

  return (
    <section className="section">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <SectionHeading title="About" subtitle="Built for the stage" />
            <p className="max-w-3xl text-lg text-ink-600">
              {band.bio} We&apos;re a tight four-piece focused on high-energy shows and
              immersive production. Find us under the lights.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

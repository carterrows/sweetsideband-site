import Image from "next/image";
import type { Member } from "@/lib/types";

export default function MemberCard({ member }: { member: Member }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-paper p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/60">
      <div className="relative h-56 w-full overflow-hidden rounded-xl border border-black/10 bg-haze">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          unoptimized
        />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-ink-900">{member.name}</h3>
        <p className="text-sm uppercase tracking-[0.2em] text-accent">
          {member.role}
        </p>
        <p className="mt-3 text-sm text-ink-600">{member.bio}</p>
      </div>
    </article>
  );
}

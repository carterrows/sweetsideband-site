import Image from "next/image";
import type { Member } from "@/lib/types";

export default function MemberCard({ member }: { member: Member }) {
  return (
    <article className="flex flex-col gap-3">
      <div className="relative w-full overflow-hidden bg-haze aspect-[8/10]">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-accent">{member.name}</h3>
        <p className="text-xs font-semibold tracking-[0.18em] text-ink-900">
          {member.role}
        </p>
        <p className="mt-3 text-sm text-ink-600">{member.bio}</p>
      </div>
    </article>
  );
}

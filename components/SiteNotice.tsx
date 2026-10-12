import type { ReactNode } from "react";

export default function SiteNotice({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-2xl border border-black/10 bg-paper p-6 text-sm text-ink-600 shadow-sm">
      {children}
    </div>
  );
}

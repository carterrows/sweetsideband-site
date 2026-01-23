"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shows", label: "Shows" },
  { href: "/past-shows", label: "Past Shows" },
  { href: "/about", label: "About" }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Navbar({ bandName }: { bandName: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-paper/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4"
      >
        <Link
          href="/"
          className="font-display text-2xl tracking-[0.2em] text-ink-900 transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {bandName}
        </Link>
        <div className="flex items-center gap-4 text-sm uppercase tracking-[0.2em]">
          {navItems.map((item) => {
            const active = pathname ? isActivePath(pathname, item.href) : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active
                    ? "text-accent shadow-glow"
                    : "text-ink-700 hover:text-ink-900"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

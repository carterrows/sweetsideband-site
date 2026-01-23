"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-paper/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4"
      >
        <Link
          href="/"
          className="font-display text-2xl tracking-[0.2em] text-ink-900 transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={() => setOpen(false)}
        >
          {bandName}
        </Link>
        <div className="hidden items-center gap-4 text-sm uppercase tracking-[0.2em] md:flex">
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
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center bg-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        >
          <span className="sr-only">Open menu</span>
          <span className="flex flex-col items-center gap-1">
            <span className="h-0.5 w-5 rounded-full bg-ink-900" />
            <span className="h-0.5 w-5 rounded-full bg-ink-900" />
            <span className="h-0.5 w-5 rounded-full bg-ink-900" />
          </span>
        </button>
      </nav>
      <div
        id="mobile-menu"
        className={`${open ? "block" : "hidden"} border-t border-black/10 bg-paper md:hidden`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 text-sm uppercase tracking-[0.2em]">
          {navItems.map((item) => {
            const active = pathname ? isActivePath(pathname, item.href) : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
      </div>
    </header>
  );
}

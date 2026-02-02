"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useState } from "react";
import type { Band } from "@/lib/types";
import SocialLinks from "@/components/SocialLinks";

const navItems = [
  { href: "/shows", label: "Shows" },
  { href: "/video", label: "Video" },
  { href: "/merch", label: "Merch" },
  { href: "/#contact", label: "Contact" }
];

function isActivePath(pathname: string, href: string) {
  return pathname.startsWith(href);
}

export default function Navbar({ band }: { band: Band }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isHome = !pathname || pathname === "/";

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (isHome) {
      event.preventDefault();
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (window.location.hash) {
          window.history.replaceState(null, "", "/");
        }
      }
      return;
    }
    event.preventDefault();
    router.push("/");
  };

  const handleContactClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (isHome) {
      event.preventDefault();
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#contact");
      }
      return;
    }
    event.preventDefault();
    router.push("/#contact");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-paper/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center text-accent transition-opacity duration-150 ease-in-out hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            onClick={handleHomeClick}
          >
            <img
              src="/sweetside.svg"
              alt="Sweetside"
              className="h-8 w-auto -mt-1.5"
            />
          </Link>
        </div>
        <div className="hidden items-center gap-4 text-sm uppercase tracking-[0.2em] md:flex md:absolute md:left-1/2 md:-translate-x-1/2">
          {navItems.map((item) => {
            const active = pathname ? isActivePath(pathname, item.href) : false;
            if (item.href === "/#contact") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleContactClick}
                  className="px-3 py-2 font-semibold text-accent transition-opacity duration-150 ease-in-out hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 font-semibold text-accent transition-opacity duration-150 ease-in-out hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <SocialLinks
              social={band.social}
              linkClassName="inline-flex items-center justify-center text-accent transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            />
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
        </div>
      </nav>
      <div
        id="mobile-menu"
        className={`${open ? "block" : "hidden"} border-t border-black/10 bg-paper md:hidden`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 text-sm uppercase tracking-[0.2em]">
          {navItems.map((item) => {
            const active = pathname ? isActivePath(pathname, item.href) : false;
            if (item.href === "/#contact") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleContactClick}
                  className="px-3 py-2 font-semibold text-accent transition-opacity duration-150 ease-in-out hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 font-semibold text-accent transition-opacity duration-150 ease-in-out hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
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

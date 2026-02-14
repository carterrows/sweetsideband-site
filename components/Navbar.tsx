"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { Band } from "@/lib/types";
import SocialLinks from "@/components/SocialLinks";
import { useNavbarHero } from "@/components/NavbarHeroContext";

const navItems = [
  { href: "/shows", label: "Shows" },
  { href: "/video", label: "Gallery" },
  { href: "/merch", label: "Merch" },
  { href: "/#contact", label: "Contact" }
];

const MOBILE_MAX_WIDTH = 768;

function isActivePath(pathname: string, href: string) {
  return pathname.startsWith(href);
}

export default function Navbar({ band }: { band: Band }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const shouldForceTopOnPathChangeRef = useRef(false);
  const isHome = !pathname || pathname === "/";
  const { isHeroActive } = useNavbarHero();
  const heroActive = isHome && isHeroActive;

  const focusRingClass = heroActive
    ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

  const navLinkClassName = `px-3 py-2 font-semibold transition duration-150 ease-in-out hover:opacity-80 ${heroActive ? "text-paper" : "text-accent"} ${focusRingClass}`;
  const socialLinkClassName = `inline-flex items-center justify-center transition duration-150 ease-in-out hover:opacity-80 ${heroActive ? "text-paper" : "text-accent"} ${focusRingClass}`;
  const logoLinkClassName = `inline-flex items-center transition duration-150 ease-in-out hover:opacity-80 ${heroActive ? "text-paper" : "text-accent"} ${focusRingClass}`;
  const mobileMenuClassName = `${open ? "block" : "hidden"} border-t ${heroActive ? "border-white/10 bg-transparent" : "border-black/10 bg-transparent"} md:hidden`;
  const menuButtonClassName = `inline-flex h-10 w-10 items-center justify-center bg-transparent transition ${heroActive ? "text-paper" : "text-ink-900"} ${focusRingClass} md:hidden`;
  const menuLineClassName = `transition-colors duration-300 ${heroActive ? "bg-paper" : "bg-ink-900"}`;
  const logoSrc = heroActive ? "/sweetside_white.svg" : "/sweetside.svg";
  const scrollToTop = (behavior: ScrollBehavior) => {
    window.scrollTo({ top: 0, left: 0, behavior });
  };

  useEffect(() => {
    if (!shouldForceTopOnPathChangeRef.current || typeof window === "undefined") {
      return;
    }

    shouldForceTopOnPathChangeRef.current = false;
    window.requestAnimationFrame(() => {
      scrollToTop("instant");
    });
  }, [pathname]);

  const scrollToContactCard = () => {
    const contactCard = document.getElementById("contact");
    if (!contactCard) {
      return;
    }

    const isMobile = window.innerWidth < MOBILE_MAX_WIDTH;
    if (!isMobile) {
      contactCard.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const rect = contactCard.getBoundingClientRect();
    const cardTop = rect.top + window.scrollY;
    const cardHeight = rect.height;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = Math.max(0, documentHeight - viewportHeight);
    const targetScrollY =
      cardTop - viewportHeight / 2 + cardHeight / 2;
    const clampedScrollY = Math.min(Math.max(0, targetScrollY), maxScroll);

    window.scrollTo({ top: clampedScrollY, behavior: "smooth" });
  };

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (isHome) {
      event.preventDefault();
      if (typeof window !== "undefined") {
        scrollToTop("smooth");
        if (window.location.hash) {
          window.history.replaceState(null, "", "/");
        }
      }
      return;
    }
    event.preventDefault();
    if (typeof window !== "undefined") {
      shouldForceTopOnPathChangeRef.current = true;
    }
    router.push("/", { scroll: true });
  };

  const handleContactClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (isHome) {
      event.preventDefault();
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          scrollToContactCard();
          window.history.replaceState(null, "", "#contact");
        });
      }
      return;
    }
    event.preventDefault();
    router.push("/#contact");
  };

  const handlePageClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);

    const targetPath = href.split("#")[0] || "/";
    const currentPath = pathname || "/";
    const isSamePath = currentPath === targetPath;

    if (isSamePath) {
      event.preventDefault();
      if (typeof window !== "undefined") {
        scrollToTop("smooth");
        if (window.location.hash) {
          window.history.replaceState(null, "", targetPath);
        }
      }
      return;
    }

    event.preventDefault();
    if (typeof window !== "undefined") {
      shouldForceTopOnPathChangeRef.current = true;
    }
    router.push(targetPath, { scroll: true });
  };

  return (
    <header
      className={`sticky top-0 z-50 relative border-b transition-colors duration-300 ${
        heroActive
          ? "border-transparent bg-transparent"
          : "border-black/10 bg-paper/80 backdrop-blur"
      }`}
    >
      <nav
        aria-label="Primary"
        className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className={logoLinkClassName}
            onClick={handleHomeClick}
          >
            <Image
              src={logoSrc}
              alt="Sweetside"
              width={354}
              height={92}
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
                  className={navLinkClassName}
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
                onClick={handlePageClick(item.href)}
                className={navLinkClassName}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            <SocialLinks
              social={band.social}
              streaming={band.streaming}
              linkClassName={socialLinkClassName}
            />
          </div>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((prev) => !prev)}
            className={menuButtonClassName}
          >
            <span className="sr-only">Open menu</span>
            <span className="flex flex-col items-center gap-1">
              <span className={`h-0.5 w-5 rounded-full ${menuLineClassName}`} />
              <span className={`h-0.5 w-5 rounded-full ${menuLineClassName}`} />
              <span className={`h-0.5 w-5 rounded-full ${menuLineClassName}`} />
            </span>
          </button>
        </div>
      </nav>
      <div
        id="mobile-menu"
        className={mobileMenuClassName}
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
                  className={navLinkClassName}
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
                onClick={handlePageClick(item.href)}
                className={navLinkClassName}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-2 flex items-center gap-4 pt-3 md:hidden">
            <SocialLinks
              social={band.social}
              streaming={band.streaming}
              linkClassName={socialLinkClassName}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

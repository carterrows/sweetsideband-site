"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import type { Band } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NavbarHeroProvider } from "@/components/NavbarHeroContext";

export default function SiteChrome({
  band,
  children
}: {
  band: Band;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useLayoutEffect(() => {
    if (!isAdminRoute && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, isAdminRoute]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <NavbarHeroProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar band={band} />
        <main className="flex-1">{children}</main>
        <Footer band={band} />
      </div>
    </NavbarHeroProvider>
  );
}

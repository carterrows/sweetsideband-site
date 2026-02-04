import "./globals.css";
import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBand } from "@/lib/content";
import { NavbarHeroProvider } from "@/components/NavbarHeroContext";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display"
});

const body = Manrope({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL
    ? new URL(process.env.SITE_URL)
    : undefined,
  title: {
    default: "Sweetside | Official Site — Shows, Videos & Merch",
    template: "%s | Sweetside"
  },
  description:
    "Official Sweetside site: upcoming shows, live video, merch, and contact/booking. Catch the next date and stream the latest.",
  openGraph: {
    siteName: "Sweetside",
    title: "Sweetside | Official Site — Shows, Videos & Merch",
    description:
      "Official Sweetside site: upcoming shows, live video, merch, and contact/booking. Catch the next date and stream the latest.",
    type: "website",
    images: ["/og-image.png"]
  },
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const band = getBand();

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <NavbarHeroProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar band={band} />
            <main className="flex-1">{children}</main>
            <Footer band={band} />
          </div>
        </NavbarHeroProvider>
      </body>
    </html>
  );
}

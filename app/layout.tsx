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
    default: "Sweetside",
    template: "%s | Sweetside"
  },
  description:
    "Sweetside is a modern synth-rock band with electric live shows and cinematic hooks.",
  openGraph: {
    title: "Sweetside",
    description:
      "Electric riffs. Midnight grooves. New city energy.",
    type: "website",
    images: ["/og-image.svg"]
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

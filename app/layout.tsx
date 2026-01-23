import "./globals.css";
import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBand } from "@/lib/content";

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
  title: {
    default: "NEON STATIC",
    template: "%s | NEON STATIC"
  },
  description:
    "NEON STATIC is a modern synth-rock band with electric live shows and cinematic hooks.",
  openGraph: {
    title: "NEON STATIC",
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
        <div className="flex min-h-screen flex-col">
          <Navbar bandName={band.name} />
          <main className="flex-1">{children}</main>
          <Footer band={band} />
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import MerchItems from "@/components/MerchItems";

export const metadata: Metadata = {
  title: "Merch",
  description: "Sweetside T-shirts and stickers. Exclusive to our shows."
};

export default function MerchPage() {
  return (
    <section className="section">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 text-center md:gap-16">
        <h1 className="text-5xl font-semibold tracking-[0.12em] text-accent sm:text-7xl">
          Merch
        </h1>
        <MerchItems />
        <p className="text-xl font-semibold text-black md:text-2xl">
          Exclusive to our shows.
        </p>
      </div>
    </section>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merch",
  description: "Sweetside merch is on the way."
};

export default function MerchPage() {
  return (
    <section className="section">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <h1 className="text-4xl font-semibold text-accent sm:text-5xl">
          Coming Soon
        </h1>
        <p className="max-w-xl text-lg text-ink-600">
          Something sweet in the making. Check back soon.
        </p>
      </div>
    </section>
  );
}

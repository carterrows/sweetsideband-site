import type { Metadata } from "next";
import MerchItems from "@/components/MerchItems";
import SiteNotice from "@/components/SiteNotice";

export const metadata: Metadata = {
  title: "Merch",
  description: "Sweetside T-shirts and stickers. Exclusive to our shows."
};

export const ensureStatic = "navigation";

export default function MerchPage() {
  return (
    <section aria-label="Merch" className="section">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 text-center md:gap-16">
        <MerchItems />
        <SiteNotice>
          Exclusive to Sweetside shows. Come see us play for some sweet merch!
        </SiteNotice>
      </div>
    </section>
  );
}

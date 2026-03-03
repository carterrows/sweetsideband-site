import Link from "next/link";

type GalleryModeTabsProps = {
  active: "photo" | "video";
};

const baseTabClassName =
  "rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

export default function GalleryModeTabs({ active }: GalleryModeTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-paper p-1 shadow-sm">
        <Link
          href="/video"
          aria-current={active === "video" ? "page" : undefined}
          className={`${baseTabClassName} ${
            active === "video"
              ? "bg-accent text-paper"
              : "text-ink-700 hover:text-ink-900"
          }`}
        >
          Video
        </Link>
        <Link
          href="/video/photos"
          aria-current={active === "photo" ? "page" : undefined}
          className={`${baseTabClassName} ${
            active === "photo"
              ? "bg-accent text-paper"
              : "text-ink-700 hover:text-ink-900"
          }`}
        >
          Photo
        </Link>
      </div>
    </div>
  );
}

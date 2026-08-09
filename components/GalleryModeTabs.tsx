import Link from "next/link";

type GalleryModeTabsProps = {
  active: "photo" | "video";
};

const baseTabClassName =
  "inline-flex min-h-12 items-center justify-center rounded-sm border border-accent px-4 py-2 text-base uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:text-lg";

export default function GalleryModeTabs({ active }: GalleryModeTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="grid w-full max-w-[332px] grid-cols-2 gap-3">
        <Link
          href="/video"
          aria-current={active === "video" ? "page" : undefined}
          className={`${baseTabClassName} ${
            active === "video"
              ? "bg-accent text-white"
              : "text-accent hover:bg-accent hover:text-white"
          }`}
        >
          Video
        </Link>
        <Link
          href="/video/photos"
          aria-current={active === "photo" ? "page" : undefined}
          className={`${baseTabClassName} ${
            active === "photo"
              ? "bg-accent text-white"
              : "text-accent hover:bg-accent hover:text-white"
          }`}
        >
          Photo
        </Link>
      </div>
    </div>
  );
}

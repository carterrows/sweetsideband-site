import Image from "next/image";

export default function VideoThumbnail({
  src,
  alt,
  aspect = "video",
  sizes = "(max-width: 1024px) 100vw, 50vw"
}: {
  src?: string;
  alt: string;
  aspect?: "video" | "photo";
  sizes?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-haze ${aspect === "photo" ? "aspect-[3/2]" : "aspect-video"}`}>
      {src && (
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" unoptimized />
      )}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/play.svg"
          alt=""
          width={88}
          height={88}
          className="translate-x-[1px] opacity-80 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </div>
    </div>
  );
}

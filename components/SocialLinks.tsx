import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import {
  AppleMusicIcon,
  SpotifyIcon,
  TikTokIcon
} from "@/components/icons/BrandIcons";
import type { Band } from "@/lib/types";

type SocialLinksProps = {
  social: Band["social"];
  streaming: Band["streaming"];
  linkClassName: string;
  iconClassName?: string;
};

export default function SocialLinks({
  social,
  streaming,
  linkClassName,
  iconClassName = "h-5 w-5"
}: SocialLinksProps) {
  const isUrl = (link: Band["streaming"]["spotify"]): link is string =>
    typeof link === "string" && link.trim().toLowerCase() !== "coming soon";
  const spotifyUrl = isUrl(streaming.spotify) ? streaming.spotify : null;
  const appleMusicUrl = isUrl(streaming.appleMusic)
    ? streaming.appleMusic
    : null;

  return (
    <>
      {social.instagram && (
        <Link
          href={social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className={linkClassName}
        >
          <Instagram className={iconClassName} aria-hidden="true" />
        </Link>
      )}
      {social.tiktok && (
        <Link
          href={social.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className={linkClassName}
        >
          <TikTokIcon className={iconClassName} />
        </Link>
      )}
      {social.youtube && (
        <Link
          href={social.youtube}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          className={linkClassName}
        >
          <Youtube className={iconClassName} aria-hidden="true" />
        </Link>
      )}
      {spotifyUrl && (
        <Link
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Spotify"
          className={linkClassName}
        >
          <SpotifyIcon className={iconClassName} />
        </Link>
      )}
      {appleMusicUrl && (
        <Link
          href={appleMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Apple Music"
          className={linkClassName}
        >
          <AppleMusicIcon className={iconClassName} />
        </Link>
      )}
      {social.facebook && (
        <Link
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className={linkClassName}
        >
          <Facebook className={iconClassName} aria-hidden="true" />
        </Link>
      )}
    </>
  );
}

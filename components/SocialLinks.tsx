import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { TikTokIcon } from "@/components/icons/BrandIcons";
import type { Band } from "@/lib/types";

type SocialLinksProps = {
  social: Band["social"];
  linkClassName: string;
  iconClassName?: string;
};

export default function SocialLinks({
  social,
  linkClassName,
  iconClassName = "h-5 w-5"
}: SocialLinksProps) {
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

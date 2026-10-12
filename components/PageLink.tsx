"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type PageLinkProps = Omit<ComponentProps<typeof Link>, "href" | "scroll"> & {
  href: string;
};

// Page routes use one scroll policy; section anchors keep their own destinations.
export default function PageLink({ href, onClick, ...props }: PageLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented || event.button !== 0 || event.metaKey ||
      event.ctrlKey || event.shiftKey || event.altKey ||
      (props.target && props.target !== "_self")
    ) {
      return;
    }

    event.preventDefault();
    if (pathname === href) {
      if (window.location.hash) {
        window.history.replaceState(null, "", href);
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    router.push(href, { scroll: false });
  };

  return <Link {...props} href={href} scroll={false} onClick={handleClick} />;
}

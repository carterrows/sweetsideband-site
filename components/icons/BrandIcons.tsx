import type { SVGProps } from "react";

const baseProps = {
  "aria-hidden": true,
  focusable: false
};

type BrandIconProps = SVGProps<SVGSVGElement> & { className?: string };

export function TikTokIcon({ className, ...props }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      {...baseProps}
      {...props}
    >
      <path d="M14.6 3c1.05 2.1 2.98 3.53 5.32 3.78v3.14c-2.09-.07-3.91-.7-5.32-1.84v6.2a5.36 5.36 0 1 1-5.36-5.36c.42 0 .83.05 1.23.14v3.22a2.13 2.13 0 1 0 2.56 2.1V3h1.57z" />
    </svg>
  );
}

export function AppleMusicIcon({ className, ...props }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className ?? ""} scale-[1.12]`}
      fill="currentColor"
      {...baseProps}
      {...props}
    >
      <path d="M7.3 6.2l9.4-2.1v9.9a2.9 2.9 0 1 1-1.8-2.7V7.2l-5.8 1.3v7.5a2.9 2.9 0 1 1-1.8-2.7V6.2z" />
    </svg>
  );
}

export function SpotifyIcon({ className, ...props }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      {...baseProps}
      {...props}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm5.521 17.34c-.229.375-.72.496-1.095.268-3.001-1.833-6.783-2.248-11.244-1.233-.427.097-.857-.17-.954-.598-.099-.428.17-.857.598-.954 4.895-1.114 9.079-.645 12.46 1.421.375.229.496.72.268 1.096zm1.562-3.475c-.288.469-.9.616-1.369.328-3.436-2.112-8.673-2.724-12.735-1.492-.526.159-1.083-.138-1.243-.665-.159-.526.138-1.083.665-1.243 4.639-1.408 10.399-.727 14.346 1.723.469.288.616.9.328 1.369zm.134-3.617C15.127 7.714 8.315 7.534 4.761 8.614c-.63.191-1.296-.166-1.488-.796-.191-.63.166-1.296.796-1.488 4.082-1.24 11.513-.999 15.768 1.538.574.342.762 1.084.42 1.658-.342.574-1.084.762-1.658.42z" />
    </svg>
  );
}

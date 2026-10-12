"use client";

import Image from "next/image";
import { useState } from "react";

export default function MerchItems() {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="grid w-full items-center gap-10 sm:grid-cols-2 md:gap-20">
      <button
        type="button"
        onClick={() => setShowBack((back) => !back)}
        aria-label={showBack ? "Show T-shirt front" : "Show T-shirt back"}
        aria-pressed={showBack}
        className="relative aspect-square w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Image
          src="/images/merch/sweetside-shirt-front.webp"
          alt="Sweetside T-shirt, front"
          fill
          priority
          sizes="(max-width: 639px) calc(100vw - 48px), 500px"
          aria-hidden={showBack}
          className={`object-contain transition-opacity duration-300 motion-reduce:transition-none ${showBack ? "opacity-0" : "opacity-100"}`}
          unoptimized
        />
        <Image
          src="/images/merch/sweetside-shirt-back.webp"
          alt="Sweetside T-shirt, back"
          fill
          sizes="(max-width: 639px) calc(100vw - 48px), 500px"
          aria-hidden={!showBack}
          className={`object-contain transition-opacity duration-300 motion-reduce:transition-none ${showBack ? "opacity-100" : "opacity-0"}`}
          unoptimized
        />
      </button>
      <div className="relative aspect-square w-full">
        <Image
          src="/images/merch/sweetside-sticker.webp"
          alt="Sweetside sticker"
          fill
          priority
          sizes="(max-width: 639px) calc(100vw - 48px), 500px"
          className="object-contain"
          unoptimized
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function AdminLogoutButton() {
  const [pending, setPending] = useState(false);

  const onLogout = async () => {
    setPending(true);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        cache: "no-store"
      });
      const targetUrl = response.redirected ? response.url : "/admin/login";

      window.location.replace(targetUrl);
    } catch {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      className="rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-700 shadow-sm transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Logging Out..." : "Log Out"}
    </button>
  );
}

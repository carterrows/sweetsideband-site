"use client";

import { useState } from "react";

export default function AdminLogoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogout = async () => {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      window.location.assign("/admin/login");
    } catch {
      setError("Logout failed. Please try again.");
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={onLogout}
        disabled={pending}
        className="rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-700 shadow-sm transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Logging Out..." : "Log Out"}
      </button>
      {error ? (
        <p className="max-w-xs rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-right text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

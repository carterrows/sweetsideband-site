"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export default function AdminLoginForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      window.location.assign("/admin");
      return;
    }

    const result = (await response.json()) as { error?: string };
    setError(result.error ?? "Login failed.");
    setPending(false);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue="admin"
          autoComplete="username"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-ink-900 outline-none transition focus:border-accent"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-14 text-base text-ink-900 outline-none transition focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Checking..." : "Log In"}
      </button>
    </form>
  );
}

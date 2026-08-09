"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type AdminTheme = "light" | "dark";

const ADMIN_THEME_STORAGE_KEY = "sweetside-admin-theme";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

function getSavedTheme(): AdminTheme | null {
  try {
    const savedTheme = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
  } catch {
    return null;
  }
}

function getSystemThemePreference(): MediaQueryList | null {
  try {
    if (typeof window.matchMedia !== "function") {
      return null;
    }

    return window.matchMedia(SYSTEM_THEME_QUERY);
  } catch {
    return null;
  }
}

function getSystemTheme(): AdminTheme {
  return getSystemThemePreference()?.matches ? "dark" : "light";
}

export default function AdminThemeShell({
  children
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<AdminTheme | null>(null);

  useEffect(() => {
    const savedTheme = getSavedTheme();
    const systemTheme = savedTheme === null ? getSystemThemePreference() : null;
    const initialTheme = savedTheme ?? (systemTheme?.matches ? "dark" : "light");
    const initialThemeTimer = window.setTimeout(() => setTheme(initialTheme), 0);

    if (systemTheme === null) {
      return () => window.clearTimeout(initialThemeTimer);
    }

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (getSavedTheme() === null) {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    systemTheme.addEventListener("change", handleSystemThemeChange);
    return () => {
      window.clearTimeout(initialThemeTimer);
      systemTheme.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  const activeTheme = theme ?? "light";
  const nextTheme = activeTheme === "dark" ? "light" : "dark";

  const toggleTheme = () => {
    const currentTheme = theme ?? getSystemTheme();
    const updatedTheme = currentTheme === "dark" ? "light" : "dark";

    setTheme(updatedTheme);

    try {
      window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, updatedTheme);
    } catch {
      // The current page still updates when storage is unavailable.
    }
  };

  return (
    <div
      className="admin-ui min-h-screen font-body antialiased"
      data-admin-theme={theme ?? undefined}
    >
      {children}
      <button
        type="button"
        className="admin-theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${nextTheme} mode`}
        title={`Switch to ${nextTheme} mode`}
      >
        {activeTheme === "dark" ? (
          <Sun aria-hidden="true" size={20} strokeWidth={2} />
        ) : (
          <Moon aria-hidden="true" size={20} strokeWidth={2} />
        )}
      </button>
    </div>
  );
}

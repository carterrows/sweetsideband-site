import { Suspense } from "react";
import type { Metadata } from "next";
import AdminThemeShell from "@/components/admin/AdminThemeShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeShell>
      <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f7f2e8]" role="status">Loading website manager…</main>}>
        {children}
      </Suspense>
    </AdminThemeShell>
  );
}

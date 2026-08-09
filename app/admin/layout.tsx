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
  return <AdminThemeShell>{children}</AdminThemeShell>;
}

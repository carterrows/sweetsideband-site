import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAdminAuthentication } from "@/lib/admin-auth";
import { getManagedShows } from "@/lib/shows-db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminAuthentication();
  const shows = getManagedShows();

  return (
    <div className="relative">
      <form action="/api/admin/logout" method="post" className="absolute right-6 top-6 z-10">
        <button
          type="submit"
          className="rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-700 shadow-sm transition hover:border-accent hover:text-accent"
        >
          Log Out
        </button>
      </form>
      <AdminDashboard initialShows={shows} />
    </div>
  );
}

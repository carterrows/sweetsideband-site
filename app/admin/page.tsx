import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { requireAdminAuthentication } from "@/lib/admin-auth";
import { getManagedGalleryImages, getManagedShows } from "@/lib/shows-db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminAuthentication();
  const shows = getManagedShows();
  const images = getManagedGalleryImages();

  return (
    <div className="relative">
      <div className="absolute right-6 top-6 z-10">
        <AdminLogoutButton />
      </div>
      <AdminDashboard initialShows={shows} initialImages={images} />
    </div>
  );
}

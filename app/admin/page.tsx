import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAdminAuthentication } from "@/lib/admin-auth";
import {
  getManagedGalleryImages,
  getManagedGalleryVideos,
  getManagedShows
} from "@/lib/shows-db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminAuthentication();
  const shows = getManagedShows();
  const images = getManagedGalleryImages();
  const videos = getManagedGalleryVideos();

  return (
    <AdminDashboard
      initialShows={shows}
      initialImages={images}
      initialVideos={videos}
    />
  );
}

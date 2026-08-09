import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAdminAuthentication } from "@/lib/admin-auth";
import { backfillGalleryImagePreviews } from "@/lib/admin-gallery-images";
import {
  getManagedGalleryImages,
  getManagedGalleryVideos,
  getManagedShows
} from "@/lib/shows-db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminAuthentication();
  await backfillGalleryImagePreviews();
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

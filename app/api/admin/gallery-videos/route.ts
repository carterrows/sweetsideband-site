import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";
import {
  MAX_VIDEO_THUMBNAIL_BYTES,
  syncGalleryVideos,
  validateVideoSyncPayload,
  type VideoThumbnailUploadMap
} from "@/lib/admin-gallery-videos";
import {
  ADMIN_SYNC_RATE_LIMIT,
  applyRateLimitHeaders,
  enforceRateLimit
} from "@/lib/rate-limit";

export const runtime = "nodejs";

function isAuthenticated(request: Request) {
  const tokenMatch = request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));

  return verifyAdminSessionToken(tokenMatch?.[1]);
}

function unauthorized(rateLimit: ReturnType<typeof enforceRateLimit>) {
  return applyRateLimitHeaders(
    NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    rateLimit.result
  );
}

async function extractThumbnailUploads(formData: FormData) {
  const uploads: VideoThumbnailUploadMap = new Map();

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("thumbnail:")) {
      continue;
    }

    if (!(value instanceof File)) {
      continue;
    }

    const lowerName = value.name.toLowerCase();

    if (
      !lowerName.endsWith(".jpg") &&
      !lowerName.endsWith(".jpeg") &&
      !lowerName.endsWith(".png")
    ) {
      throw new Error("Video thumbnails must use .jpg, .jpeg, or .png.");
    }

    if (value.size === 0) {
      throw new Error("Video thumbnails cannot be empty.");
    }

    if (value.size > MAX_VIDEO_THUMBNAIL_BYTES) {
      throw new Error("Each video thumbnail must be 250 KB or smaller.");
    }

    uploads.set(key.slice("thumbnail:".length), {
      fileName: value.name,
      bytes: new Uint8Array(await value.arrayBuffer())
    });
  }

  return uploads;
}

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(ADMIN_SYNC_RATE_LIMIT);
  if (rateLimit.limited) {
    return rateLimit.response;
  }

  if (!isAuthenticated(request)) {
    return unauthorized(rateLimit);
  }

  try {
    const formData = await request.formData();
    const payload = String(formData.get("payload") ?? "");
    const videos = validateVideoSyncPayload(payload);
    const uploadsByClientKey = await extractThumbnailUploads(formData);
    const syncedVideos = await syncGalleryVideos(videos, uploadsByClientKey);

    revalidatePath("/video");
    revalidatePath("/admin");

    return applyRateLimitHeaders(
      NextResponse.json({ videos: syncedVideos }),
      rateLimit.result
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync video changes.";

    return applyRateLimitHeaders(
      NextResponse.json({ error: message }, { status: 400 }),
      rateLimit.result
    );
  }
}

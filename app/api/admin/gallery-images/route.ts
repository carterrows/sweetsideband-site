import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";
import {
  backfillGalleryImagePreviews,
  removeGalleryImage,
  saveGalleryImageUploads
} from "@/lib/admin-gallery-images";
import {
  ADMIN_SYNC_RATE_LIMIT,
  applyRateLimitHeaders,
  enforceRateLimit
} from "@/lib/rate-limit";
import { getManagedGalleryImages } from "@/lib/shows-db";

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
    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      throw new Error("Choose at least one JPEG image to upload.");
    }

    const uploads = await Promise.all(
      files.map(async (file) => ({
        fileName: file.name,
        bytes: new Uint8Array(await file.arrayBuffer())
      }))
    );

    const images = await saveGalleryImageUploads(uploads);

    revalidatePath("/video/photos");
    revalidatePath("/");
    revalidatePath("/admin");

    return applyRateLimitHeaders(
      NextResponse.json({ images }),
      rateLimit.result
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload gallery image.";

    return applyRateLimitHeaders(
      NextResponse.json({ error: message }, { status: 400 }),
      rateLimit.result
    );
  }
}

export async function DELETE(request: Request) {
  const rateLimit = enforceRateLimit(ADMIN_SYNC_RATE_LIMIT);
  if (rateLimit.limited) {
    return rateLimit.response;
  }

  if (!isAuthenticated(request)) {
    return unauthorized(rateLimit);
  }

  try {
    const payload = (await request.json()) as { id?: unknown };

    if (typeof payload.id !== "string") {
      throw new Error("Image ID is required.");
    }

    const images = await removeGalleryImage(payload.id);

    revalidatePath("/video/photos");
    revalidatePath("/");
    revalidatePath("/admin");

    return applyRateLimitHeaders(
      NextResponse.json({ images }),
      rateLimit.result
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete gallery image.";

    return applyRateLimitHeaders(
      NextResponse.json({ error: message }, { status: 400 }),
      rateLimit.result
    );
  }
}

export async function PUT(request: Request) {
  const rateLimit = enforceRateLimit(ADMIN_SYNC_RATE_LIMIT);
  if (rateLimit.limited) {
    return rateLimit.response;
  }

  if (!isAuthenticated(request)) {
    return unauthorized(rateLimit);
  }

  try {
    const backfill = await backfillGalleryImagePreviews();

    revalidatePath("/video/photos");
    revalidatePath("/");
    revalidatePath("/admin");

    return applyRateLimitHeaders(
      NextResponse.json({
        images: getManagedGalleryImages(),
        generatedPreviewCount: backfill.generatedCount,
        failedPreviewCount: backfill.failedCount
      }),
      rateLimit.result
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to process gallery image previews.";

    return applyRateLimitHeaders(
      NextResponse.json({ error: message }, { status: 400 }),
      rateLimit.result
    );
  }
}

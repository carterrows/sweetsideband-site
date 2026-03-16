import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";
import { syncShows, validateShowSyncPayload } from "@/lib/admin-shows";
import {
  ADMIN_SYNC_RATE_LIMIT,
  applyRateLimitHeaders,
  enforceRateLimit
} from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_POSTER_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_POSTER_UPLOAD_BYTES = 20 * 1024 * 1024;
const PNG_SIGNATURE = new Uint8Array([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a
]);

function isPngFile(bytes: Uint8Array) {
  if (bytes.length < PNG_SIGNATURE.length) {
    return false;
  }

  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

async function extractPosterUploads(formData: FormData) {
  const uploads = new Map<
    string,
    {
      bytes: Uint8Array;
      fileName: string;
    }
  >();
  let totalUploadBytes = 0;

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("poster:")) {
      continue;
    }

    if (!(value instanceof File)) {
      continue;
    }

    if (!value.name.toLowerCase().endsWith(".png")) {
      throw new Error("Poster files must use the .png extension.");
    }

    if (value.size === 0) {
      throw new Error("Poster files cannot be empty.");
    }

    if (value.size > MAX_POSTER_UPLOAD_BYTES) {
      throw new Error("Each poster must be 5 MB or smaller.");
    }

    totalUploadBytes += value.size;

    if (totalUploadBytes > MAX_TOTAL_POSTER_UPLOAD_BYTES) {
      throw new Error("Combined poster uploads must be 20 MB or smaller.");
    }

    const bytes = new Uint8Array(await value.arrayBuffer());

    if (!isPngFile(bytes)) {
      throw new Error("Poster files must be valid PNG images.");
    }

    uploads.set(
      key.slice("poster:".length),
      {
        bytes,
        fileName: value.name
      }
    );
  }

  return uploads;
}

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(ADMIN_SYNC_RATE_LIMIT);
  if (rateLimit.limited) {
    return rateLimit.response;
  }

  const tokenMatch = request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
  const token = tokenMatch?.[1];

  if (!verifyAdminSessionToken(token)) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
      rateLimit.result
    );
  }

  try {
    const formData = await request.formData();
    const payload = String(formData.get("payload") ?? "");
    const { shows, originalIdsByClientKey, idsByClientKey } =
      validateShowSyncPayload(payload);
    const uploadsByClientKey = await extractPosterUploads(formData);
    const syncedShows = await syncShows(
      shows,
      originalIdsByClientKey,
      idsByClientKey,
      uploadsByClientKey
    );

    revalidatePath("/");
    revalidatePath("/shows");
    revalidatePath("/admin");

    return applyRateLimitHeaders(
      NextResponse.json({ shows: syncedShows }),
      rateLimit.result
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync show changes.";

    return applyRateLimitHeaders(
      NextResponse.json({ error: message }, { status: 400 }),
      rateLimit.result
    );
  }
}

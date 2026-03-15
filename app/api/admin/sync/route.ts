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

async function extractPosterUploads(formData: FormData) {
  const uploads = new Map<
    string,
    {
      bytes: Uint8Array;
      fileName: string;
    }
  >();

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

    uploads.set(
      key.slice("poster:".length),
      {
        bytes: new Uint8Array(await value.arrayBuffer()),
        fileName: value.name
      }
    );
  }

  return uploads;
}

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(request, ADMIN_SYNC_RATE_LIMIT);
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
    const syncedShows = syncShows(
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

import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  verifyAdminPassword
} from "@/lib/admin-auth";
import {
  ADMIN_LOGIN_RATE_LIMIT,
  applyRateLimitHeaders,
  enforceRateLimit
} from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(ADMIN_LOGIN_RATE_LIMIT);
  if (rateLimit.limited) {
    return rateLimit.response;
  }

  try {
    const formData = await request.formData();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!verifyAdminPassword(password, username)) {
      return applyRateLimitHeaders(
        NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
        ),
        rateLimit.result
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_COOKIE_NAME,
      createAdminSessionToken(),
      getAdminSessionCookieOptions()
    );

    return applyRateLimitHeaders(response, rateLimit.result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to complete login.";

    return applyRateLimitHeaders(
      NextResponse.json({ error: message }, { status: 500 }),
      rateLimit.result
    );
  }
}

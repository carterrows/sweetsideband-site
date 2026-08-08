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

    const response = request.headers.get("accept")?.includes("text/html")
      ? NextResponse.redirect(new URL("/admin", request.url), 303)
      : NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_COOKIE_NAME,
      createAdminSessionToken(),
      getAdminSessionCookieOptions()
    );

    return applyRateLimitHeaders(response, rateLimit.result);
  } catch (error) {
    console.error("Admin login failed:", error);

    return applyRateLimitHeaders(
      NextResponse.json(
        { error: "Unable to log in right now. Please try again." },
        { status: 500 }
      ),
      rateLimit.result
    );
  }
}

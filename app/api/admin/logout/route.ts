import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import {
  ADMIN_LOGOUT_RATE_LIMIT,
  applyRateLimitHeaders,
  enforceRateLimit
} from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(request, ADMIN_LOGOUT_RATE_LIMIT);
  const nextUrl = new URL(request.url);
  nextUrl.pathname = rateLimit.limited ? "/admin" : "/admin/login";
  nextUrl.search = "";

  const response = NextResponse.redirect(nextUrl, { status: 303 });

  if (!rateLimit.limited) {
    response.cookies.set(ADMIN_COOKIE_NAME, "", {
      path: "/",
      maxAge: 0
    });
  }

  return applyRateLimitHeaders(
    response,
    rateLimit.limited ? rateLimit.result : rateLimit.result
  );
}

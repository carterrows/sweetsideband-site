import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminSessionCookieOptions
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    ...getAdminSessionCookieOptions(),
    expires: new Date(0),
    maxAge: 0
  });

  return response;
}

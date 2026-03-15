import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const nextUrl = new URL(request.url);
  nextUrl.pathname = "/admin/login";
  nextUrl.search = "";

  const response = NextResponse.redirect(nextUrl, { status: 303 });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0
  });
  return response;
}

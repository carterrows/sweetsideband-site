import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  verifyAdminPassword
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!verifyAdminPassword(password, username)) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_COOKIE_NAME,
      createAdminSessionToken(),
      getAdminSessionCookieOptions()
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to complete login.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

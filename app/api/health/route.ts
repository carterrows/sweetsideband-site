import { connection, NextResponse } from "next/server";

export async function GET() {
  // Always handle health checks at request time, including with Cache Components.
  await connection();

  return NextResponse.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } }
  );
}

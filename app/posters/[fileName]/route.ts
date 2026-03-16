import { NextResponse } from "next/server";
import { readShowPoster, sanitizePosterFileName } from "@/lib/show-posters";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> }
) {
  try {
    const { fileName } = await context.params;
    const normalizedFileName = sanitizePosterFileName(fileName);
    const poster = readShowPoster(normalizedFileName);

    if (!poster) {
      return new NextResponse("Not found.", { status: 404 });
    }

    return new NextResponse(poster, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, must-revalidate"
      }
    });
  } catch {
    return new NextResponse("Not found.", { status: 404 });
  }
}

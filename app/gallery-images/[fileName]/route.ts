import { NextResponse } from "next/server";
import { readGalleryImage } from "@/lib/shows-db";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> }
) {
  const { fileName } = await context.params;
  const galleryImage = readGalleryImage(fileName);

  if (!galleryImage) {
    return new NextResponse("Not found.", { status: 404 });
  }

  return new NextResponse(new Uint8Array(galleryImage.content), {
    headers: {
      "Content-Type": galleryImage.image.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}

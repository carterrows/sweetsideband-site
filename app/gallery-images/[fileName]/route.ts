import { NextResponse } from "next/server";
import {
  readGalleryImageFile,
  sanitizeGalleryImageFileName
} from "@/lib/gallery-image-files";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> }
) {
  try {
    const { fileName } = await context.params;
    const normalizedFileName = sanitizeGalleryImageFileName(fileName);
    const galleryImage = readGalleryImageFile(normalizedFileName);

    if (!galleryImage) {
      return new NextResponse("Not found.", { status: 404 });
    }

    return new NextResponse(galleryImage, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Not found.", { status: 404 });
  }
}

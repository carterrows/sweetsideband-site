import { connection, NextResponse } from "next/server";
import {
  getGalleryImageContentType,
  readGalleryImageFile,
  sanitizeGalleryImageFileName
} from "@/lib/gallery-image-files";

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> }
) {
  // Uploaded files live in writable runtime storage, including files added after build.
  await connection();

  try {
    const { fileName } = await context.params;
    const normalizedFileName = sanitizeGalleryImageFileName(fileName);
    const galleryImage = readGalleryImageFile(normalizedFileName);

    if (!galleryImage) {
      return new NextResponse("Not found.", { status: 404 });
    }

    return new NextResponse(galleryImage, {
      headers: {
        "Content-Type": getGalleryImageContentType(normalizedFileName),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Not found.", { status: 404 });
  }
}

import { connection, NextResponse } from "next/server";
import {
  getVideoThumbnailContentType,
  readVideoThumbnailFile,
  sanitizeVideoThumbnailFileName
} from "@/lib/video-thumbnail-files";

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> }
) {
  // Uploaded files live in writable runtime storage, including files added after build.
  await connection();

  try {
    const { fileName } = await context.params;
    const normalizedFileName = sanitizeVideoThumbnailFileName(fileName);
    const thumbnail = readVideoThumbnailFile(normalizedFileName);

    if (!thumbnail) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(thumbnail, {
      headers: {
        "Content-Type": getVideoThumbnailContentType(normalizedFileName),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

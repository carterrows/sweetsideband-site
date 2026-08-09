import fs from "fs";
import path from "path";

function getVideoThumbnailsDir() {
  const configuredDatabasePath = process.env.SHOWS_DB_PATH?.trim();

  if (configuredDatabasePath) {
    const absoluteDatabasePath = path.resolve(
      /* turbopackIgnore: true */ process.cwd(),
      configuredDatabasePath
    );
    return path.join(
      /* turbopackIgnore: true */ path.dirname(absoluteDatabasePath),
      "video-thumbnails"
    );
  }

  return path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "storage",
    "video-thumbnails"
  );
}

function ensureVideoThumbnailsDir() {
  fs.mkdirSync(/* turbopackIgnore: true */ getVideoThumbnailsDir(), {
    recursive: true
  });
}

function normalizeVideoThumbnailFileName(fileName: string) {
  return path.basename(fileName.trim());
}

function getVideoThumbnailPath(fileName: string) {
  return path.join(
    /* turbopackIgnore: true */ getVideoThumbnailsDir(),
    normalizeVideoThumbnailFileName(fileName)
  );
}

export function getVideoThumbnailSrc(fileName?: string): string | undefined {
  if (!fileName) {
    return undefined;
  }

  const normalizedFileName = normalizeVideoThumbnailFileName(fileName);
  const filePath = getVideoThumbnailPath(normalizedFileName);

  if (!fs.existsSync(/* turbopackIgnore: true */ filePath)) {
    return undefined;
  }

  return `/video-thumbnails/${encodeURIComponent(normalizedFileName)}`;
}

export async function saveVideoThumbnailFile(
  fileName: string,
  bytes: Uint8Array
) {
  ensureVideoThumbnailsDir();
  await fs.promises.writeFile(
    /* turbopackIgnore: true */ getVideoThumbnailPath(fileName),
    bytes
  );
}

export async function deleteVideoThumbnailFile(fileName?: string) {
  if (!fileName) {
    return;
  }

  const filePath = getVideoThumbnailPath(fileName);
  if (fs.existsSync(/* turbopackIgnore: true */ filePath)) {
    await fs.promises.unlink(/* turbopackIgnore: true */ filePath);
  }
}

export function sanitizeVideoThumbnailFileName(fileName: string) {
  const normalizedFileName = normalizeVideoThumbnailFileName(fileName);
  const extension = path.extname(normalizedFileName).toLowerCase();

  if (extension !== ".jpg" && extension !== ".jpeg" && extension !== ".png") {
    throw new Error("Video thumbnails must use .jpg, .jpeg, or .png.");
  }

  return normalizedFileName;
}

export function getVideoThumbnailContentType(fileName: string) {
  const extension = path.extname(sanitizeVideoThumbnailFileName(fileName))
    .toLowerCase();

  return extension === ".png" ? "image/png" : "image/jpeg";
}

export function readVideoThumbnailFile(fileName: string) {
  const normalizedFileName = sanitizeVideoThumbnailFileName(fileName);
  const filePath = getVideoThumbnailPath(normalizedFileName);

  if (!fs.existsSync(/* turbopackIgnore: true */ filePath)) {
    return null;
  }

  return fs.readFileSync(/* turbopackIgnore: true */ filePath);
}

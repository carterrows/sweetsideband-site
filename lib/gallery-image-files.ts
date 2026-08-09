import fs from "fs";
import path from "path";

function getGalleryImagesDir() {
  const configuredDatabasePath = process.env.SHOWS_DB_PATH?.trim();

  if (configuredDatabasePath) {
    const absoluteDatabasePath = path.resolve(
      process.cwd(),
      configuredDatabasePath
    );
    return path.join(path.dirname(absoluteDatabasePath), "gallery-images");
  }

  return path.join(process.cwd(), "storage", "gallery-images");
}

function ensureGalleryImagesDir() {
  fs.mkdirSync(getGalleryImagesDir(), { recursive: true });
}

function normalizeGalleryImageFileName(fileName: string) {
  return path.basename(fileName.trim());
}

function getGalleryImagePath(fileName: string) {
  return path.join(
    getGalleryImagesDir(),
    normalizeGalleryImageFileName(fileName)
  );
}

export function getGalleryImageSrc(fileName?: string): string | undefined {
  if (!fileName) {
    return undefined;
  }

  const normalizedFileName = normalizeGalleryImageFileName(fileName);
  const filePath = getGalleryImagePath(normalizedFileName);

  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  return `/gallery-images/${encodeURIComponent(normalizedFileName)}`;
}

export async function saveGalleryImageFile(
  fileName: string,
  bytes: Uint8Array
) {
  ensureGalleryImagesDir();
  await fs.promises.writeFile(getGalleryImagePath(fileName), bytes);
}

export async function deleteGalleryImageFile(fileName?: string) {
  if (!fileName) {
    return;
  }

  const filePath = getGalleryImagePath(fileName);
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
}

export function sanitizeGalleryImageFileName(fileName: string) {
  const normalizedFileName = normalizeGalleryImageFileName(fileName);
  const extension = path.extname(normalizedFileName).toLowerCase();

  if (
    extension !== ".jpg" &&
    extension !== ".jpeg" &&
    extension !== ".webp"
  ) {
    throw new Error("Unsupported gallery image extension.");
  }

  return normalizedFileName;
}

export function getGalleryImageContentType(fileName: string) {
  return path.extname(fileName).toLowerCase() === ".webp"
    ? "image/webp"
    : "image/jpeg";
}

export function readGalleryImageFile(fileName: string) {
  const normalizedFileName = sanitizeGalleryImageFileName(fileName);
  const filePath = getGalleryImagePath(normalizedFileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return fs.readFileSync(filePath);
}

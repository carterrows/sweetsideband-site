import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import type { GalleryImage } from "./types";
import {
  deleteGalleryImageFile,
  readGalleryImageFile,
  saveGalleryImageFile
} from "./gallery-image-files";
import {
  deleteGalleryImage,
  getManagedGalleryImageById,
  getManagedGalleryImages,
  insertGalleryImage,
  updateGalleryImagePreview
} from "./shows-db";

export type GalleryImageUpload = {
  bytes: Uint8Array;
  fileName: string;
};

export const MAX_IMAGE_UPLOAD_BYTES = 1024 * 1024;
const PREVIEW_WIDTH = 1200;
const PREVIEW_QUALITY = 80;

function normalizeBaseName(fileName: string) {
  const parsed = path.parse(path.basename(fileName.trim()));
  const baseName = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return baseName || "gallery-image";
}

function titleFromFileName(fileName: string) {
  return path
    .parse(path.basename(fileName.trim()))
    .name.replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isJpegFileName(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return extension === ".jpg" || extension === ".jpeg";
}

export function isJpegImage(bytes: Uint8Array) {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff &&
    bytes[bytes.length - 2] === 0xff &&
    bytes[bytes.length - 1] === 0xd9
  );
}

export function validateGalleryImageUpload(upload: GalleryImageUpload) {
  if (!isJpegFileName(upload.fileName)) {
    throw new Error("Gallery images must use the .jpg or .jpeg extension.");
  }

  if (upload.bytes.length === 0) {
    throw new Error("Gallery images cannot be empty.");
  }

  if (upload.bytes.length > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Each gallery image must be 1 MB or smaller.");
  }

  if (!isJpegImage(upload.bytes)) {
    throw new Error("Gallery images must be valid JPEG files.");
  }
}

function getPreviewFileName(fileName: string) {
  const parsed = path.parse(fileName);
  return `${parsed.name}-preview.webp`;
}

async function createGalleryImagePreview(bytes: Uint8Array) {
  return sharp(bytes, { failOn: "error" })
    .rotate()
    .resize({
      width: PREVIEW_WIDTH,
      withoutEnlargement: true
    })
    .webp({ quality: PREVIEW_QUALITY })
    .toBuffer();
}

async function saveValidatedGalleryImageUpload(upload: GalleryImageUpload) {
  const id = randomUUID();
  const fileName = `${id}-${normalizeBaseName(upload.fileName)}.jpg`;
  const previewFileName = getPreviewFileName(fileName);
  const title = titleFromFileName(upload.fileName) || "Gallery image";
  const previewBytes = await createGalleryImagePreview(upload.bytes);

  await saveGalleryImageFile(fileName, upload.bytes);

  try {
    await saveGalleryImageFile(previewFileName, previewBytes);
    insertGalleryImage({
      id,
      fileName,
      title,
      byteSize: upload.bytes.length,
      previewFileName,
      previewByteSize: previewBytes.length,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    await Promise.all([
      deleteGalleryImageFile(fileName),
      deleteGalleryImageFile(previewFileName)
    ]);
    throw error;
  }

  const savedImage = getManagedGalleryImageById(id);

  if (!savedImage) {
    throw new Error("Unable to save gallery image.");
  }

  return savedImage;
}

export async function backfillGalleryImagePreviews() {
  let generatedCount = 0;
  let failedCount = 0;

  for (const image of getManagedGalleryImages()) {
    if (image.previewSrc) {
      continue;
    }

    const originalBytes = readGalleryImageFile(image.fileName);
    if (!originalBytes) {
      failedCount += 1;
      continue;
    }

    const previewFileName =
      image.previewFileName ?? getPreviewFileName(image.fileName);

    try {
      const previewBytes = await createGalleryImagePreview(originalBytes);
      await saveGalleryImageFile(previewFileName, previewBytes);

      if (
        !updateGalleryImagePreview(
          image.id,
          previewFileName,
          previewBytes.length
        )
      ) {
        await deleteGalleryImageFile(previewFileName);
        failedCount += 1;
        continue;
      }

      generatedCount += 1;
    } catch {
      await deleteGalleryImageFile(previewFileName);
      failedCount += 1;
    }
  }

  return { generatedCount, failedCount };
}

export function saveGalleryImageUploads(
  uploads: GalleryImageUpload[]
): Promise<GalleryImage[]> {
  for (const upload of uploads) {
    validateGalleryImageUpload(upload);
  }

  return (async () => {
    for (const upload of uploads) {
      await saveValidatedGalleryImageUpload(upload);
    }

    return getManagedGalleryImages();
  })();
}

export async function removeGalleryImage(id: string) {
  const normalizedId = id.trim();

  if (!normalizedId) {
    throw new Error("Image ID is required.");
  }

  const image = getManagedGalleryImageById(normalizedId);

  if (!image) {
    throw new Error("Gallery image was not found.");
  }

  await Promise.all([
    deleteGalleryImageFile(image.fileName),
    deleteGalleryImageFile(image.previewFileName)
  ]);

  if (!deleteGalleryImage(normalizedId)) {
    throw new Error("Gallery image was not found.");
  }

  return getManagedGalleryImages();
}

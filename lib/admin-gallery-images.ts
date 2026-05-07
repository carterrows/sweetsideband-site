import path from "path";
import { randomUUID } from "crypto";
import type { GalleryImage } from "./types";
import {
  deleteGalleryImageFile,
  saveGalleryImageFile
} from "./gallery-image-files";
import {
  deleteGalleryImage,
  getManagedGalleryImageById,
  getManagedGalleryImages,
  insertGalleryImage
} from "./shows-db";

export type GalleryImageUpload = {
  bytes: Uint8Array;
  fileName: string;
};

export const MAX_IMAGE_UPLOAD_BYTES = 1024 * 1024;

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

async function saveValidatedGalleryImageUpload(upload: GalleryImageUpload) {
  const id = randomUUID();
  const fileName = `${id}-${normalizeBaseName(upload.fileName)}.jpg`;
  const title = titleFromFileName(upload.fileName) || "Gallery image";

  await saveGalleryImageFile(fileName, upload.bytes);

  try {
    insertGalleryImage({
      id,
      fileName,
      title,
      byteSize: upload.bytes.length,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    await deleteGalleryImageFile(fileName);
    throw error;
  }

  const savedImage = getManagedGalleryImageById(id);

  if (!savedImage) {
    throw new Error("Unable to save gallery image.");
  }

  return savedImage;
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

  await deleteGalleryImageFile(image.fileName);

  if (!deleteGalleryImage(normalizedId)) {
    throw new Error("Gallery image was not found.");
  }

  return getManagedGalleryImages();
}

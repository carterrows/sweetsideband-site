import path from "path";
import { randomUUID } from "crypto";
import type { GalleryVideo } from "./types";
import {
  deleteVideoThumbnailFile,
  saveVideoThumbnailFile
} from "./video-thumbnail-files";
import { getManagedGalleryVideos, replaceGalleryVideos } from "./shows-db";

export type VideoSyncInput = {
  clientKey: string;
  originalId: string | null;
  title: string;
  youtubeUrl: string;
};

export type VideoThumbnailUpload = {
  bytes: Uint8Array;
  fileName: string;
};

export type VideoThumbnailUploadMap = Map<string, VideoThumbnailUpload>;

type NormalizedVideoInput = {
  clientKey: string;
  originalId: string | null;
  title: string;
  youtubeUrl: string;
  sortOrder: number;
};

export const MAX_VIDEO_THUMBNAIL_BYTES = 250 * 1024;

const PNG_SIGNATURE = new Uint8Array([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a
]);

function normalizeRequiredValue(value: string, field: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required.`);
  }

  return normalized;
}

function normalizeBaseName(fileName: string) {
  const parsed = path.parse(path.basename(fileName.trim()));
  const baseName = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return baseName || "video-thumbnail";
}

function normalizeThumbnailExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (extension !== ".jpg" && extension !== ".jpeg" && extension !== ".png") {
    throw new Error("Video thumbnails must use .jpg, .jpeg, or .png.");
  }

  return extension === ".jpeg" ? ".jpg" : extension;
}

function isPngImage(bytes: Uint8Array) {
  if (bytes.length < PNG_SIGNATURE.length) {
    return false;
  }

  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

function isJpegImage(bytes: Uint8Array) {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff &&
    bytes[bytes.length - 2] === 0xff &&
    bytes[bytes.length - 1] === 0xd9
  );
}

export function validateVideoThumbnailUpload(upload: VideoThumbnailUpload) {
  const extension = normalizeThumbnailExtension(upload.fileName);

  if (upload.bytes.length === 0) {
    throw new Error("Video thumbnails cannot be empty.");
  }

  if (upload.bytes.length > MAX_VIDEO_THUMBNAIL_BYTES) {
    throw new Error("Each video thumbnail must be 250 KB or smaller.");
  }

  if (extension === ".png" && !isPngImage(upload.bytes)) {
    throw new Error("Video thumbnails must be valid PNG images.");
  }

  if (extension === ".jpg" && !isJpegImage(upload.bytes)) {
    throw new Error("Video thumbnails must be valid JPEG images.");
  }
}

function normalizeYoutubeUrl(value: string) {
  const normalized = normalizeRequiredValue(value, "YouTube URL");
  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("YouTube URL must be a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("YouTube URL must begin with http:// or https://.");
  }

  const hostname = parsed.hostname.toLowerCase();
  const allowedHosts = new Set([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be"
  ]);

  if (!allowedHosts.has(hostname)) {
    throw new Error("YouTube URL must be a youtube.com or youtu.be link.");
  }

  return normalized;
}

export function validateVideoSyncPayload(rawPayload: string) {
  let payload: unknown;

  try {
    payload = JSON.parse(rawPayload);
  } catch {
    throw new Error("Sync payload is not valid JSON.");
  }

  if (!Array.isArray(payload)) {
    throw new Error("Sync payload must be an array.");
  }

  const videos: NormalizedVideoInput[] = [];
  const seenOriginalIds = new Set<string>();

  payload.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error("Each video payload must be an object.");
    }

    const input = item as VideoSyncInput;
    const clientKey = normalizeRequiredValue(input.clientKey, "Client key");
    const originalId = input.originalId?.trim() || null;

    if (originalId) {
      if (seenOriginalIds.has(originalId)) {
        throw new Error(`Duplicate video ID "${originalId}" detected.`);
      }

      seenOriginalIds.add(originalId);
    }

    videos.push({
      clientKey,
      originalId,
      title: normalizeRequiredValue(input.title, "Title"),
      youtubeUrl: normalizeYoutubeUrl(input.youtubeUrl),
      sortOrder: index
    });
  });

  return videos;
}

function thumbnailFileNameForUpload(upload: VideoThumbnailUpload) {
  const extension = normalizeThumbnailExtension(upload.fileName);
  return `${randomUUID()}-${normalizeBaseName(upload.fileName)}${extension}`;
}

export async function syncGalleryVideos(
  inputs: NormalizedVideoInput[],
  uploadsByClientKey: VideoThumbnailUploadMap
) {
  for (const upload of uploadsByClientKey.values()) {
    validateVideoThumbnailUpload(upload);
  }

  const existingVideos = getManagedGalleryVideos();
  const existingVideosById = new Map(
    existingVideos.map((video) => [video.id, video])
  );
  const retainedOriginalIds = new Set(
    inputs
      .map((input) => input.originalId)
      .filter((value): value is string => Boolean(value))
  );
  const now = new Date().toISOString();
  const videos: GalleryVideo[] = [];
  const pendingUploads: Array<{
    existingThumbnailFileName?: string;
    nextThumbnailFileName: string;
    bytes: Uint8Array;
  }> = [];

  for (const input of inputs) {
    const existingVideo = input.originalId
      ? existingVideosById.get(input.originalId)
      : undefined;
    const upload = uploadsByClientKey.get(input.clientKey);

    if (input.originalId && !existingVideo) {
      throw new Error("Video was not found.");
    }

    if (!existingVideo && !upload) {
      throw new Error("A thumbnail is required for each new video.");
    }

    const thumbnailFileName = upload
      ? thumbnailFileNameForUpload(upload)
      : existingVideo?.thumbnailFileName;
    const thumbnailByteSize = upload
      ? upload.bytes.length
      : existingVideo?.thumbnailByteSize;

    if (upload && thumbnailFileName) {
      pendingUploads.push({
        existingThumbnailFileName: existingVideo?.thumbnailFileName,
        nextThumbnailFileName: thumbnailFileName,
        bytes: upload.bytes
      });
    }

    videos.push({
      id: existingVideo?.id ?? randomUUID(),
      title: input.title,
      youtubeUrl: input.youtubeUrl,
      thumbnailFileName,
      thumbnailByteSize,
      sortOrder: input.sortOrder,
      createdAt: existingVideo?.createdAt ?? now,
      updatedAt: now
    });
  }

  for (const upload of pendingUploads) {
    if (upload.existingThumbnailFileName) {
      await deleteVideoThumbnailFile(upload.existingThumbnailFileName);
    }

    await saveVideoThumbnailFile(upload.nextThumbnailFileName, upload.bytes);
  }

  replaceGalleryVideos(videos);

  for (const existingVideo of existingVideos) {
    if (!retainedOriginalIds.has(existingVideo.id)) {
      await deleteVideoThumbnailFile(existingVideo.thumbnailFileName);
    }
  }

  return getManagedGalleryVideos();
}

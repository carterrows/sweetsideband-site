import type { ManagedShow, ShowBucket } from "./types";
import { deleteShowPoster, renameShowPoster, saveShowPoster } from "./show-posters";
import { getManagedShows, replaceShows } from "./shows-db";

export type ShowSyncInput = {
  clientKey: string;
  originalId: string | null;
  id: string;
  bucket: ShowBucket;
  date: string;
  city: string;
  venue: string;
  venueUrl?: string;
  venueAddress?: string;
  showTime?: string;
  doorsOpenTime?: string;
  coverFee?: string;
};

export type PosterUploadMap = Map<string, Uint8Array>;

const showIdPattern = /^[a-z0-9][a-z0-9-]*$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function normalizeRequiredValue(value: string, field: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required.`);
  }

  return normalized;
}

function normalizeOptionalValue(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizeUrl(value?: string) {
  const normalized = normalizeOptionalValue(value);

  if (!normalized) {
    return undefined;
  }

  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("Venue URL must be a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Venue URL must begin with http:// or https://.");
  }

  return normalized;
}

function normalizeShowInput(input: ShowSyncInput, sortOrder: number): ManagedShow {
  const id = normalizeRequiredValue(input.id, "Show ID").toLowerCase();

  if (!showIdPattern.test(id)) {
    throw new Error(
      "Show ID may only contain lowercase letters, numbers, and hyphens."
    );
  }

  const date = normalizeRequiredValue(input.date, "Date");
  if (!isoDatePattern.test(date)) {
    throw new Error("Date must use YYYY-MM-DD.");
  }

  if (input.bucket !== "upcoming" && input.bucket !== "past") {
    throw new Error("Show bucket must be upcoming or past.");
  }

  return {
    id,
    bucket: input.bucket,
    sortOrder,
    date,
    city: normalizeRequiredValue(input.city, "City"),
    venue: normalizeRequiredValue(input.venue, "Venue"),
    venueUrl: normalizeUrl(input.venueUrl),
    venueAddress: normalizeOptionalValue(input.venueAddress),
    showTime: normalizeOptionalValue(input.showTime),
    doorsOpenTime: normalizeOptionalValue(input.doorsOpenTime),
    coverFee: normalizeOptionalValue(input.coverFee)
  };
}

export function validateShowSyncPayload(rawPayload: string) {
  let payload: unknown;

  try {
    payload = JSON.parse(rawPayload);
  } catch {
    throw new Error("Sync payload is not valid JSON.");
  }

  if (!Array.isArray(payload)) {
    throw new Error("Sync payload must be an array.");
  }

  const nextSortOrder: Record<ShowBucket, number> = {
    upcoming: 0,
    past: 0
  };
  const shows: ManagedShow[] = [];
  const seenIds = new Set<string>();
  const originalIdsByClientKey = new Map<string, string | null>();
  const idsByClientKey = new Map<string, string>();

  for (const item of payload) {
    if (!item || typeof item !== "object") {
      throw new Error("Each show payload must be an object.");
    }

    const input = item as ShowSyncInput;
    const clientKey = normalizeRequiredValue(input.clientKey, "Client key");
    const normalizedShow = normalizeShowInput(
      input,
      nextSortOrder[input.bucket]++
    );

    if (seenIds.has(normalizedShow.id)) {
      throw new Error(`Duplicate show ID "${normalizedShow.id}" detected.`);
    }

    seenIds.add(normalizedShow.id);
    originalIdsByClientKey.set(clientKey, input.originalId?.trim() || null);
    idsByClientKey.set(clientKey, normalizedShow.id);
    shows.push(normalizedShow);
  }

  return {
    shows,
    originalIdsByClientKey,
    idsByClientKey
  };
}

export function syncShows(
  shows: ManagedShow[],
  originalIdsByClientKey: Map<string, string | null>,
  idsByClientKey: Map<string, string>,
  uploadsByClientKey: PosterUploadMap
) {
  const existingShows = getManagedShows();
  const nextIds = new Set(shows.map((show) => show.id));

  replaceShows(shows);

  for (const [clientKey, originalId] of originalIdsByClientKey) {
    const nextId = idsByClientKey.get(clientKey);

    if (!originalId || !nextId || originalId === nextId) {
      continue;
    }

    if (uploadsByClientKey.has(clientKey)) {
      deleteShowPoster(originalId);
      continue;
    }

    renameShowPoster(originalId, nextId);
  }

  for (const [clientKey, bytes] of uploadsByClientKey) {
    const nextId = idsByClientKey.get(clientKey);

    if (!nextId) {
      continue;
    }

    saveShowPoster(nextId, bytes);
  }

  for (const existingShow of existingShows) {
    if (!nextIds.has(existingShow.id)) {
      deleteShowPoster(existingShow.id);
    }
  }

  return getManagedShows();
}

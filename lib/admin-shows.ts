import type { ManagedShow, ShowBucket } from "./types";
import {
  deleteShowPoster,
  saveShowPoster,
  sanitizePosterFileName
} from "./show-posters";
import { getManagedShows, replaceShows } from "./shows-db";
import { deriveShowId, isIsoShowDate } from "./show-id";

export type ShowSyncInput = {
  clientKey: string;
  originalId: string | null;
  bucket: ShowBucket;
  date: string;
  city: string;
  venue: string;
  venueUrl?: string;
  ticketsUrl?: string;
  venueAddress?: string;
  showTime?: string;
  doorsOpenTime?: string;
  coverFee?: string;
};

export type PosterUploadMap = Map<
  string,
  {
    bytes: Uint8Array;
    fileName: string;
  }
>;

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

function normalizeTicketsUrl(value?: string) {
  const normalized = normalizeOptionalValue(value);

  if (!normalized) {
    return undefined;
  }

  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("Tickets URL must be a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Tickets URL must begin with http:// or https://.");
  }

  return normalized;
}

function normalizeShowInput(input: ShowSyncInput, sortOrder: number): ManagedShow {
  const date = normalizeRequiredValue(input.date, "Date");
  if (!isIsoShowDate(date)) {
    throw new Error("Date must use YYYY-MM-DD.");
  }

  if (input.bucket !== "upcoming" && input.bucket !== "past") {
    throw new Error("Show bucket must be upcoming or past.");
  }

  const id = deriveShowId(date);
  const detailFields =
    input.bucket === "upcoming"
      ? {
          venueUrl: normalizeUrl(input.venueUrl),
          ticketsUrl: normalizeTicketsUrl(input.ticketsUrl),
          venueAddress: normalizeOptionalValue(input.venueAddress),
          showTime: normalizeOptionalValue(input.showTime),
          doorsOpenTime: normalizeOptionalValue(input.doorsOpenTime),
          coverFee: normalizeOptionalValue(input.coverFee)
        }
      : {
          venueUrl: undefined,
          ticketsUrl: undefined,
          venueAddress: undefined,
          showTime: undefined,
          doorsOpenTime: undefined,
          coverFee: undefined
        };

  return {
    id,
    bucket: input.bucket,
    sortOrder,
    date,
    city: normalizeRequiredValue(input.city, "City"),
    venue: normalizeRequiredValue(input.venue, "Venue"),
    ...detailFields
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

export async function syncShows(
  shows: ManagedShow[],
  originalIdsByClientKey: Map<string, string | null>,
  idsByClientKey: Map<string, string>,
  uploadsByClientKey: PosterUploadMap
) {
  const existingShows = getManagedShows();
  const existingShowsById = new Map(existingShows.map((show) => [show.id, show]));
  const showsById = new Map(shows.map((show) => [show.id, show]));
  const nextShowsByOriginalId = new Map<string, ManagedShow>();
  const retainedOriginalIds = new Set(
    [...originalIdsByClientKey.values()].filter(
      (value): value is string => Boolean(value)
    )
  );
  const assignedPosterFileNames = new Map<string, string>();
  const pendingUploads: Array<{
    existingPosterFileName?: string;
    nextPosterFileName: string;
    bytes: Uint8Array;
  }> = [];

  for (const [clientKey, nextId] of idsByClientKey) {
    const show = showsById.get(nextId);
    const originalId = originalIdsByClientKey.get(clientKey) ?? null;
    const existingPosterFileName = originalId
      ? existingShowsById.get(originalId)?.posterFileName
      : undefined;
    const upload = uploadsByClientKey.get(clientKey);

    if (!show) {
      continue;
    }

    if (originalId) {
      nextShowsByOriginalId.set(originalId, show);
    }

    if (show.bucket === "past") {
      show.posterFileName = undefined;
    } else if (upload) {
      const sanitizedFileName = sanitizePosterFileName(upload.fileName);
      show.posterFileName = sanitizedFileName;
      pendingUploads.push({
        existingPosterFileName,
        nextPosterFileName: sanitizedFileName,
        bytes: upload.bytes
      });
    } else {
      show.posterFileName = existingPosterFileName;
    }

    if (show.posterFileName) {
      const normalizedPosterKey = show.posterFileName.toLowerCase();
      const assignedShowId = assignedPosterFileNames.get(normalizedPosterKey);

      if (assignedShowId && assignedShowId !== show.id) {
        throw new Error(
          `Poster filename "${show.posterFileName}" is already assigned to another show.`
        );
      }

      assignedPosterFileNames.set(normalizedPosterKey, show.id);
    }
  }

  for (const upload of pendingUploads) {
    if (
      upload.existingPosterFileName &&
      upload.existingPosterFileName.toLowerCase() !==
        upload.nextPosterFileName.toLowerCase()
    ) {
      await deleteShowPoster(upload.existingPosterFileName);
    }

    await saveShowPoster(upload.nextPosterFileName, upload.bytes);
  }

  replaceShows(shows);

  for (const existingShow of existingShows) {
    const retainedShow = nextShowsByOriginalId.get(existingShow.id);

    if (
      !retainedOriginalIds.has(existingShow.id) ||
      retainedShow?.bucket === "past"
    ) {
      await deleteShowPoster(existingShow.posterFileName);
    }
  }

  return getManagedShows();
}

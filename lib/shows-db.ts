import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import type {
  GalleryImage,
  GalleryVideo,
  ManagedShow,
  MediaItem,
  ShowBucket,
  ShowsData
} from "./types";
import { getGalleryImageSrc } from "./gallery-image-files";
import { getShowPosterSrc } from "./show-posters";
import { getVideoThumbnailSrc } from "./video-thumbnail-files";

type ShowRow = {
  id: string;
  bucket: ShowBucket;
  sort_order: number;
  date: string;
  city: string;
  venue: string;
  venue_url: string | null;
  tickets_url: string | null;
  venue_address: string | null;
  show_time: string | null;
  doors_open_time: string | null;
  cover_fee: string | null;
  poster_file_name: string | null;
};

type GalleryImageRow = {
  id: string;
  file_name: string;
  title: string;
  byte_size: number;
  created_at: string;
};

type GalleryVideoRow = {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_file_name: string | null;
  thumbnail_byte_size: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const dataDir = path.join(process.cwd(), "data");
const databasePath = process.env.SHOWS_DB_PATH?.trim()
  ? path.resolve(process.cwd(), process.env.SHOWS_DB_PATH.trim())
  : path.join(dataDir, "shows.sqlite");

let database: Database.Database | null = null;

function getDatabase() {
  if (database) {
    return database;
  }

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA synchronous = NORMAL;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS shows (
      id TEXT PRIMARY KEY,
      bucket TEXT NOT NULL CHECK(bucket IN ('upcoming', 'past')),
      sort_order INTEGER NOT NULL,
      date TEXT NOT NULL,
      city TEXT NOT NULL,
      venue TEXT NOT NULL,
      venue_url TEXT,
      tickets_url TEXT,
      venue_address TEXT,
      show_time TEXT,
      doors_open_time TEXT,
      cover_fee TEXT,
      poster_file_name TEXT
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      byte_size INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery_videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      thumbnail_file_name TEXT UNIQUE,
      thumbnail_byte_size INTEGER,
      sort_order INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  database = db;

  return database;
}

function mapGalleryImageRow(row: GalleryImageRow): GalleryImage {
  return {
    id: row.id,
    fileName: row.file_name,
    title: row.title,
    src: getGalleryImageSrc(row.file_name),
    byteSize: row.byte_size,
    createdAt: row.created_at
  };
}

function mapGalleryVideoRow(row: GalleryVideoRow): GalleryVideo {
  return {
    id: row.id,
    title: row.title,
    youtubeUrl: row.youtube_url,
    thumbnailFileName: row.thumbnail_file_name ?? undefined,
    thumbnailSrc: getVideoThumbnailSrc(row.thumbnail_file_name ?? undefined),
    thumbnailByteSize: row.thumbnail_byte_size ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapShowRow(row: ShowRow): ManagedShow {
  return {
    id: row.id,
    bucket: row.bucket,
    sortOrder: row.sort_order,
    date: row.date,
    city: row.city,
    venue: row.venue,
    venueUrl: row.venue_url ?? undefined,
    ticketsUrl: row.tickets_url ?? undefined,
    venueAddress: row.venue_address ?? undefined,
    showTime: row.show_time ?? undefined,
    doorsOpenTime: row.doors_open_time ?? undefined,
    coverFee: row.cover_fee ?? undefined,
    posterFileName: row.poster_file_name ?? undefined,
    posterSrc: getShowPosterSrc(row.poster_file_name ?? undefined)
  };
}

function normalizeNullableValue(value?: string) {
  return value ? value : null;
}

function sortShowsByDateAscending(shows: ManagedShow[]) {
  return [...shows].sort((left, right) => left.date.localeCompare(right.date));
}

function sortShowsByDateDescending(shows: ManagedShow[]) {
  return [...shows].sort((left, right) => right.date.localeCompare(left.date));
}

export function getManagedShows(): ManagedShow[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
        SELECT
          id,
          bucket,
          sort_order,
          date,
          city,
          venue,
          venue_url,
          tickets_url,
          venue_address,
          show_time,
          doors_open_time,
          cover_fee,
          poster_file_name
        FROM shows
        ORDER BY
          CASE bucket WHEN 'upcoming' THEN 0 ELSE 1 END,
          sort_order ASC;
      `
    )
    .all() as ShowRow[];

  return rows.map(mapShowRow);
}

export function getShowsFromDatabase(): ShowsData {
  const shows = getManagedShows();
  const upcoming = shows.filter((show) => show.bucket === "upcoming");
  const past = shows.filter((show) => show.bucket === "past");

  return {
    upcoming: sortShowsByDateAscending(upcoming),
    past: sortShowsByDateDescending(past)
  };
}

export function replaceShows(shows: ManagedShow[]) {
  const db = getDatabase();
  const insert = db.prepare(`
    INSERT INTO shows (
      id,
      bucket,
      sort_order,
      date,
      city,
      venue,
      venue_url,
      tickets_url,
      venue_address,
      show_time,
      doors_open_time,
      cover_fee,
      poster_file_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  db.exec("BEGIN IMMEDIATE;");

  try {
    db.exec("DELETE FROM shows;");

    for (const show of shows) {
      insert.run(
        show.id,
        show.bucket,
        show.sortOrder,
        show.date,
        show.city,
        show.venue,
        normalizeNullableValue(show.venueUrl),
        normalizeNullableValue(show.ticketsUrl),
        normalizeNullableValue(show.venueAddress),
        normalizeNullableValue(show.showTime),
        normalizeNullableValue(show.doorsOpenTime),
        normalizeNullableValue(show.coverFee),
        normalizeNullableValue(show.posterFileName)
      );
    }

    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}

export function getManagedGalleryImages(): GalleryImage[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
        SELECT
          id,
          file_name,
          title,
          byte_size,
          created_at
        FROM gallery_images
        ORDER BY created_at DESC, file_name ASC;
      `
    )
    .all() as GalleryImageRow[];

  return rows.map(mapGalleryImageRow);
}

export function getManagedGalleryVideos(): GalleryVideo[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
        SELECT
          id,
          title,
          youtube_url,
          thumbnail_file_name,
          thumbnail_byte_size,
          sort_order,
          created_at,
          updated_at
        FROM gallery_videos
        ORDER BY sort_order ASC, created_at DESC;
      `
    )
    .all() as GalleryVideoRow[];

  return rows.map(mapGalleryVideoRow);
}

export function getManagedGalleryVideoById(id: string): GalleryVideo | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
        SELECT
          id,
          title,
          youtube_url,
          thumbnail_file_name,
          thumbnail_byte_size,
          sort_order,
          created_at,
          updated_at
        FROM gallery_videos
        WHERE id = ?;
      `
    )
    .get(id.trim()) as GalleryVideoRow | undefined;

  return row ? mapGalleryVideoRow(row) : null;
}

export function getManagedGalleryImageById(id: string): GalleryImage | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
        SELECT
          id,
          file_name,
          title,
          byte_size,
          created_at
        FROM gallery_images
        WHERE id = ?;
      `
    )
    .get(id.trim()) as GalleryImageRow | undefined;

  return row ? mapGalleryImageRow(row) : null;
}

function shuffle<T>(items: T[]): T[] {
  const randomized = [...items];
  for (let i = randomized.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomized[i], randomized[j]] = [randomized[j], randomized[i]];
  }
  return randomized;
}

export function getGalleryPhotosFromDatabase(): MediaItem[] {
  return shuffle(
    getManagedGalleryImages()
      .filter(
        (image): image is GalleryImage & { src: string } =>
          typeof image.src === "string"
      )
      .map((image) => ({
        id: image.id,
        type: "image" as const,
        title: image.title,
        src: image.src,
        link: image.src,
        alt: image.title
      }))
  );
}

export function getGalleryVideosFromDatabase(): MediaItem[] {
  return getManagedGalleryVideos()
    .filter(
      (video): video is GalleryVideo & { thumbnailSrc: string } =>
        typeof video.thumbnailSrc === "string"
    )
    .map((video) => ({
      id: video.id,
      type: "video" as const,
      title: video.title,
      thumbnail: video.thumbnailSrc,
      link: video.youtubeUrl,
      alt: video.title
    }));
}

export function insertGalleryImage({
  id,
  fileName,
  title,
  byteSize,
  createdAt
}: {
  id: string;
  fileName: string;
  title: string;
  byteSize: number;
  createdAt: string;
}) {
  const db = getDatabase();

  db.prepare(
    `
      INSERT INTO gallery_images (
        id,
        file_name,
        title,
        byte_size,
        created_at
      ) VALUES (?, ?, ?, ?, ?);
    `
  ).run(id, fileName, title, byteSize, createdAt);
}

export function deleteGalleryImage(id: string) {
  const db = getDatabase();
  const result = db
    .prepare("DELETE FROM gallery_images WHERE id = ?;")
    .run(id.trim());

  return result.changes > 0;
}

function normalizeNullableNumber(value?: number) {
  return typeof value === "number" ? value : null;
}

export function replaceGalleryVideos(videos: GalleryVideo[]) {
  const db = getDatabase();
  const insert = db.prepare(`
    INSERT INTO gallery_videos (
      id,
      title,
      youtube_url,
      thumbnail_file_name,
      thumbnail_byte_size,
      sort_order,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `);

  db.exec("BEGIN IMMEDIATE;");

  try {
    db.exec("DELETE FROM gallery_videos;");

    for (const video of videos) {
      insert.run(
        video.id,
        video.title,
        video.youtubeUrl,
        normalizeNullableValue(video.thumbnailFileName),
        normalizeNullableNumber(video.thumbnailByteSize),
        video.sortOrder,
        video.createdAt,
        video.updatedAt
      );
    }

    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}

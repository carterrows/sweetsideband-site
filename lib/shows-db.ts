import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import type { ManagedShow, ShowBucket, ShowsData } from "./types";
import { getShowPosterSrc } from "./show-posters";

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
  database = db;

  return database;
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

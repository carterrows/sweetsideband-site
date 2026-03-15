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
  venue_address: string | null;
  show_time: string | null;
  doors_open_time: string | null;
  cover_fee: string | null;
};

const dataDir = path.join(process.cwd(), "data");
const databasePath = process.env.SHOWS_DB_PATH?.trim()
  ? path.resolve(process.cwd(), process.env.SHOWS_DB_PATH.trim())
  : path.join(dataDir, "shows.sqlite");
const seedPath = path.join(dataDir, "shows.json");

let database: Database.Database | null = null;

function getDatabase() {
  if (database) {
    return database;
  }

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  database = new Database(databasePath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA synchronous = NORMAL;");
  database.exec(`
    CREATE TABLE IF NOT EXISTS shows (
      id TEXT PRIMARY KEY,
      bucket TEXT NOT NULL CHECK(bucket IN ('upcoming', 'past')),
      sort_order INTEGER NOT NULL,
      date TEXT NOT NULL,
      city TEXT NOT NULL,
      venue TEXT NOT NULL,
      venue_url TEXT,
      venue_address TEXT,
      show_time TEXT,
      doors_open_time TEXT,
      cover_fee TEXT
    );
  `);

  seedDatabaseIfEmpty(database);

  return database;
}

function seedDatabaseIfEmpty(db: Database.Database) {
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM shows;").get() as {
    count: number;
  };

  if (countRow.count > 0 || !fs.existsSync(seedPath)) {
    return;
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, "utf-8")) as ShowsData;
  const incomingShows: ManagedShow[] = [
    ...seed.upcoming.map((show, index) => ({
      ...show,
      bucket: "upcoming" as const,
      sortOrder: index
    })),
    ...seed.past.map((show, index) => ({
      ...show,
      bucket: "past" as const,
      sortOrder: index
    }))
  ];

  replaceShows(incomingShows);
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
    venueAddress: row.venue_address ?? undefined,
    showTime: row.show_time ?? undefined,
    doorsOpenTime: row.doors_open_time ?? undefined,
    coverFee: row.cover_fee ?? undefined,
    posterSrc: getShowPosterSrc(row.id)
  };
}

function normalizeNullableValue(value?: string) {
  return value ? value : null;
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
          venue_address,
          show_time,
          doors_open_time,
          cover_fee
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

  return {
    upcoming: shows.filter((show) => show.bucket === "upcoming"),
    past: shows.filter((show) => show.bucket === "past")
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
      venue_address,
      show_time,
      doors_open_time,
      cover_fee
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
        normalizeNullableValue(show.venueAddress),
        normalizeNullableValue(show.showTime),
        normalizeNullableValue(show.doorsOpenTime),
        normalizeNullableValue(show.coverFee)
      );
    }

    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}

import fs from "fs";
import path from "path";
import type { Band, ShowsData, Member, MediaItem } from "./types";

const dataDir = path.join(process.cwd(), "data");
const showsImagesDir = path.join(process.cwd(), "public", "images", "shows");
const showPostersDir = path.join(process.cwd(), "public", "images", "posters");
const allowedFiles = new Set(["band.json", "shows.json", "members.json", "media.json"]);
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const posterExtensions = new Set([".jpeg", ".jpg", ".png"]);

function readJson<T>(fileName: string): T {
  if (!allowedFiles.has(fileName)) {
    throw new Error(`Unsupported data file: ${fileName}`);
  }
  const filePath = path.join(dataDir, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

// Swap these helpers for SQLite queries later without touching components.
export function getBand(): Band {
  return readJson<Band>("band.json");
}

export function getShows(): ShowsData {
  const shows = readJson<ShowsData>("shows.json");
  const posters = getShowPosterLookup();

  return {
    upcoming: shows.upcoming.map((show) => ({
      ...show,
      posterSrc: posters.get(show.id.toLowerCase())
    })),
    past: shows.past
  };
}

export function getMembers(): Member[] {
  return readJson<Member[]>("members.json");
}

export function getMedia(): MediaItem[] {
  return readJson<MediaItem[]>("media.json");
}

function shuffle<T>(items: T[]): T[] {
  const randomized = [...items];
  for (let i = randomized.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomized[i], randomized[j]] = [randomized[j], randomized[i]];
  }
  return randomized;
}

function toTitle(fileName: string): string {
  const baseName = path.parse(fileName).name;
  return baseName
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getShowPosterLookup(): Map<string, string> {
  if (!fs.existsSync(showPostersDir)) {
    return new Map();
  }

  return new Map(
    fs
      .readdirSync(showPostersDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .filter((entry) => posterExtensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => [
        path.parse(entry.name).name.toLowerCase(),
        `/images/posters/${encodeURIComponent(entry.name)}`
      ])
  );
}

export function getShowPhotos(): MediaItem[] {
  if (!fs.existsSync(showsImagesDir)) {
    return [];
  }

  const images = fs
    .readdirSync(showsImagesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const fileName = entry.name;
      const src = `/images/shows/${encodeURIComponent(fileName)}`;
      const title = toTitle(fileName);

      return {
        id: `show-photo-${fileName.toLowerCase()}`,
        type: "image" as const,
        title,
        src,
        link: src,
        alt: title
      };
    });

  return shuffle(images);
}

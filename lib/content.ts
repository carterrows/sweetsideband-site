import fs from "fs";
import path from "path";
import type { Band, ShowsData, Member, MediaItem } from "./types";

const dataDir = path.join(process.cwd(), "data");
const allowedFiles = new Set(["band.json", "shows.json", "members.json", "media.json"]);

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
  return readJson<ShowsData>("shows.json");
}

export function getMembers(): Member[] {
  return readJson<Member[]>("members.json");
}

export function getMedia(): MediaItem[] {
  return readJson<MediaItem[]>("media.json");
}

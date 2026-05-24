import fs from "fs";
import path from "path";
import type { Band, ShowsData, Member, MediaItem } from "./types";
import {
  getGalleryPhotosFromDatabase,
  getGalleryVideosFromDatabase,
  getShowsFromDatabase
} from "./shows-db";

const dataDir = path.join(process.cwd(), "data");
const allowedFiles = new Set(["band.json", "members.json", "media.json"]);

function readJson<T>(fileName: string): T {
  if (!allowedFiles.has(fileName)) {
    throw new Error(`Unsupported data file: ${fileName}`);
  }
  const filePath = path.join(dataDir, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getBand(): Band {
  return readJson<Band>("band.json");
}

export function getShows(): ShowsData {
  return getShowsFromDatabase();
}

export function getMembers(): Member[] {
  return readJson<Member[]>("members.json");
}

export function getMedia(): MediaItem[] {
  return getGalleryVideosFromDatabase();
}

export function getShowPhotos(): MediaItem[] {
  return getGalleryPhotosFromDatabase();
}

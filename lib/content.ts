import { cacheLife, cacheTag } from "next/cache";
import { CONTENT_CACHE_TAGS } from "./content-cache";
import fs from "fs";
import path from "path";
import type { Band, ShowsData, Member, MediaItem } from "./types";
import {
  getGalleryPhotosFromDatabase,
  getGalleryVideosFromDatabase,
  getShowsFromDatabase
} from "./shows-db";

const dataDir = path.join(process.cwd(), "data");
const allowedFiles = new Set(["band.json", "members.json"]);

function readJson<T>(fileName: string): T {
  if (!allowedFiles.has(fileName)) {
    throw new Error(`Unsupported data file: ${fileName}`);
  }
  const filePath = path.join(dataDir, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export async function getBand(): Promise<Band> {
  "use cache";
  cacheLife("max");
  return readJson<Band>("band.json");
}

export async function getShows(): Promise<ShowsData> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_CACHE_TAGS.shows);
  return getShowsFromDatabase();
}

export async function getMembers(): Promise<Member[]> {
  "use cache";
  cacheLife("max");
  return readJson<Member[]>("members.json");
}

export async function getMedia(): Promise<MediaItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_CACHE_TAGS.videos);
  return getGalleryVideosFromDatabase();
}

export async function getShowPhotos(): Promise<MediaItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_CACHE_TAGS.photos);
  return getGalleryPhotosFromDatabase();
}

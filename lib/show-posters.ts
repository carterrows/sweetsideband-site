import fs from "fs";
import path from "path";

const showPostersDir = path.join(process.cwd(), "public", "images", "posters");

function ensurePosterDir() {
  fs.mkdirSync(showPostersDir, { recursive: true });
}

function normalizePosterFileName(fileName: string) {
  return path.basename(fileName.trim());
}

function getPosterPath(fileName: string) {
  return path.join(showPostersDir, normalizePosterFileName(fileName));
}

export function getShowPosterSrc(fileName?: string): string | undefined {
  if (!fileName) {
    return undefined;
  }

  const normalizedFileName = normalizePosterFileName(fileName);
  const filePath = getPosterPath(normalizedFileName);

  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  return `/images/posters/${encodeURIComponent(normalizedFileName)}`;
}

export function saveShowPoster(fileName: string, bytes: Uint8Array) {
  ensurePosterDir();
  fs.writeFileSync(getPosterPath(fileName), bytes);
}

export function deleteShowPoster(fileName?: string) {
  if (!fileName) {
    return;
  }

  const filePath = getPosterPath(fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function sanitizePosterFileName(fileName: string) {
  const normalizedFileName = normalizePosterFileName(fileName);

  if (!normalizedFileName.toLowerCase().endsWith(".png")) {
    throw new Error("Poster files must use the .png extension.");
  }

  return normalizedFileName;
}

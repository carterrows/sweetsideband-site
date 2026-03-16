import fs from "fs";
import path from "path";

function getShowPostersDir() {
  const configuredDatabasePath = process.env.SHOWS_DB_PATH?.trim();

  if (configuredDatabasePath) {
    const absoluteDatabasePath = path.resolve(
      process.cwd(),
      configuredDatabasePath
    );
    return path.join(path.dirname(absoluteDatabasePath), "posters");
  }

  return path.join(process.cwd(), "storage", "posters");
}

function ensurePosterDir() {
  fs.mkdirSync(getShowPostersDir(), { recursive: true });
}

function normalizePosterFileName(fileName: string) {
  return path.basename(fileName.trim());
}

function getPosterPath(fileName: string) {
  return path.join(getShowPostersDir(), normalizePosterFileName(fileName));
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

  return `/posters/${encodeURIComponent(normalizedFileName)}`;
}

export async function saveShowPoster(fileName: string, bytes: Uint8Array) {
  ensurePosterDir();
  await fs.promises.writeFile(getPosterPath(fileName), bytes);
}

export async function deleteShowPoster(fileName?: string) {
  if (!fileName) {
    return;
  }

  const filePath = getPosterPath(fileName);
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
}

export function sanitizePosterFileName(fileName: string) {
  const normalizedFileName = normalizePosterFileName(fileName);

  if (!normalizedFileName.toLowerCase().endsWith(".png")) {
    throw new Error("Poster files must use the .png extension.");
  }

  return normalizedFileName;
}

export function readShowPoster(fileName: string) {
  const normalizedFileName = sanitizePosterFileName(fileName);
  const filePath = getPosterPath(normalizedFileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return fs.readFileSync(filePath);
}

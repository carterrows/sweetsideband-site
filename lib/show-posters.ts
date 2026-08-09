import fs from "fs";
import path from "path";

function getShowPostersDir() {
  const configuredDatabasePath = process.env.SHOWS_DB_PATH?.trim();

  if (configuredDatabasePath) {
    const absoluteDatabasePath = path.resolve(
      /* turbopackIgnore: true */ process.cwd(),
      configuredDatabasePath
    );
    return path.join(
      /* turbopackIgnore: true */ path.dirname(absoluteDatabasePath),
      "posters"
    );
  }

  return path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "storage",
    "posters"
  );
}

function ensurePosterDir() {
  fs.mkdirSync(/* turbopackIgnore: true */ getShowPostersDir(), {
    recursive: true
  });
}

function normalizePosterFileName(fileName: string) {
  return path.basename(fileName.trim());
}

function getPosterPath(fileName: string) {
  return path.join(
    /* turbopackIgnore: true */ getShowPostersDir(),
    normalizePosterFileName(fileName)
  );
}

export function getShowPosterSrc(fileName?: string): string | undefined {
  if (!fileName) {
    return undefined;
  }

  const normalizedFileName = normalizePosterFileName(fileName);
  const filePath = getPosterPath(normalizedFileName);

  if (!fs.existsSync(/* turbopackIgnore: true */ filePath)) {
    return undefined;
  }

  return `/posters/${encodeURIComponent(normalizedFileName)}`;
}

export async function saveShowPoster(fileName: string, bytes: Uint8Array) {
  ensurePosterDir();
  await fs.promises.writeFile(
    /* turbopackIgnore: true */ getPosterPath(fileName),
    bytes
  );
}

export async function deleteShowPoster(fileName?: string) {
  if (!fileName) {
    return;
  }

  const filePath = getPosterPath(fileName);
  if (fs.existsSync(/* turbopackIgnore: true */ filePath)) {
    await fs.promises.unlink(/* turbopackIgnore: true */ filePath);
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

  if (!fs.existsSync(/* turbopackIgnore: true */ filePath)) {
    return null;
  }

  return fs.readFileSync(/* turbopackIgnore: true */ filePath);
}

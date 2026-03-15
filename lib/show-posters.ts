import fs from "fs";
import path from "path";

const showPostersDir = path.join(process.cwd(), "public", "images", "posters");
const legacyPosterExtensions = [".png", ".jpg", ".jpeg"];

function ensurePosterDir() {
  fs.mkdirSync(showPostersDir, { recursive: true });
}

function getPosterPath(id: string) {
  return path.join(showPostersDir, `${id}.png`);
}

export function getShowPosterSrc(id: string): string | undefined {
  for (const extension of legacyPosterExtensions) {
    const fileName = `${id}${extension}`;
    const filePath = path.join(showPostersDir, fileName);

    if (fs.existsSync(filePath)) {
      return `/images/posters/${encodeURIComponent(fileName)}`;
    }
  }

  return undefined;
}

export function saveShowPoster(id: string, bytes: Uint8Array) {
  ensurePosterDir();
  fs.writeFileSync(getPosterPath(id), bytes);
}

export function deleteShowPoster(id: string) {
  for (const extension of legacyPosterExtensions) {
    const filePath = path.join(showPostersDir, `${id}${extension}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

export function renameShowPoster(previousId: string, nextId: string) {
  if (previousId === nextId) {
    return;
  }

  ensurePosterDir();

  for (const extension of legacyPosterExtensions) {
    const existingPath = path.join(showPostersDir, `${previousId}${extension}`);
    if (!fs.existsSync(existingPath)) {
      continue;
    }

    const nextPath = getPosterPath(nextId);
    if (existingPath === nextPath) {
      return;
    }

    if (fs.existsSync(nextPath)) {
      fs.unlinkSync(nextPath);
    }

    fs.renameSync(existingPath, nextPath);
    return;
  }
}

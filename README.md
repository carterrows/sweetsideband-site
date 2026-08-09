# Sweetside Band Website

Modern, mobile-first band website built with Next.js (App Router), React, TypeScript, and Tailwind CSS. Band and member content live in local JSON files, while shows and gallery media are stored in SQLite. Docker is ready for Raspberry Pi 5.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production build (local)

```bash
npm run build
npm start
```

## Docker (production)

```bash
docker compose up --build
```

Site runs at http://127.0.0.1:3000

## JSON content editing

Edit the JSON files under `data/`:

- `data/band.json` - name, location, socials, streaming
- `data/members.json` - band member cards

Shows and gallery media are managed through `/admin`, not JSON.

### Streaming links (Spotify / Apple Music)

Streaming buttons are driven by `data/band.json` → `streaming`.

- To show a clickable button, set the value to a URL string:

```json
{
  "streaming": {
    "spotify": "https://open.spotify.com/artist/REAL_ID",
    "appleMusic": "https://music.apple.com/artist/REAL_ID"
  }
}
```

When Spotify is set to a supported Spotify URL (`artist`, `album`, `track`, `playlist`, `show`, or `episode`), the home page also renders an embedded Spotify preview player under `Listen`.

- To show a non-clickable "Coming Soon" label, set the value to a URL string
  that equals `coming soon` (case-insensitive), or to:

```json
{
  "streaming": {
    "spotify": { "status": "coming-soon" },
    "appleMusic": { "status": "coming-soon" }
  }
}
```

## Images and media

Videos on `/video` and photos on `/video/photos` are loaded from admin gallery metadata in SQLite. Uploaded gallery files live in runtime storage. Use `/admin` → `Videos` to add, edit, delete, or sync video cards, and `/admin` → `Images` to upload, delete, or sync gallery photos.

Place other images in `public/images/` and reference them by absolute path in JSON, e.g.

- `/images/members/avery.svg`
- `/images/logos/sweetside-logo.png`

Video thumbnails are uploaded through `/admin` and served from runtime storage through `/video-thumbnails/:fileName`. Thumbnails must be `.jpg`, `.jpeg`, or `.png` files up to 250 KB.

## Environment config

Copy `.env.example` to `.env` or `.env.local`.

Available variables:

- `SITE_URL` - canonical site URL used for metadata, sitemap, and robots
- `ADMIN_PASSWORD_HASH` - salted scrypt hash for the fixed `admin` username. Escape both `$` delimiters as `\$` when saving it in `.env` or `.env.local`.
- `ADMIN_SESSION_SECRET` - random secret for signing the admin session cookie
- `SHOWS_DB_PATH` - optional override for the SQLite database path

## Shows storage

Shows load through `lib/shows-db.ts`.

- Local default database path is `data/shows.sqlite`.
- Docker stores the database in a named volume mounted at `/app/storage/shows.sqlite`.
- Public pages still read through `lib/content.ts`, so the UI contracts stay the same.
- Show IDs use the immutable `ss-xxxxxxxx` format, with eight random lowercase hex characters. Existing databases migrate automatically on first startup.
- Uploaded posters are stored in runtime storage.
- Local poster storage defaults to `storage/posters/`.
- Docker poster storage lives beside the database inside the mounted `/app/storage` volume.
- Posters are served through `/posters/:fileName`.
- Uploaded gallery images are stored in runtime storage.
- Local gallery image storage defaults to `storage/gallery-images/`.
- Docker gallery image storage lives beside the database inside the mounted `/app/storage` volume.
- Original gallery JPEGs and generated WebP previews are served through `/gallery-images/:fileName` with immutable cache headers.
- Uploads generate a WebP preview up to 1,200 px wide at 80% quality; both files live in the same gallery image storage directory and Docker volume.
- Uploaded video thumbnails are stored in runtime storage.
- Local video thumbnail storage defaults to `storage/video-thumbnails/`.
- Docker video thumbnail storage lives beside the database inside the mounted `/app/storage` volume.
- Video thumbnails are served through `/video-thumbnails/:fileName` with immutable cache headers.
- Upcoming shows may also store an optional `tickets_url` value in SQLite for the public Tickets button.

## Admin

The admin UI lives at `/admin`.

Use the admin UI for show management. JSON editing no longer applies to shows.

The admin dashboard lets you:

- review upcoming and past shows
- edit any show fields
- add or clear optional upcoming-only ticket links
- add and delete shows
- upload PNG posters only
- upload posters up to 5 MB each, with a 20 MB combined upload cap per sync
- upload and delete photo gallery images
- upload photo gallery images as `.jpg` or `.jpeg` files up to 1 MB each
- add, edit, delete, and sync video gallery cards
- upload video thumbnails as `.jpg`, `.jpeg`, or `.png` files up to 250 KB each
- sync show draft state and revalidate `/` and `/shows`
- sync video draft state and revalidate `/video`

Admin API protection:

- login and sync endpoints use an in-memory process-wide rate limiter
- logout clears the admin session cookie server-side and the client navigates directly to `/admin/login`
- sync validates poster extension, PNG file signature, upload size limits, and show writes in the same request
- gallery image uploads validate extension, JPEG file signature, and upload size before storing files on disk and metadata in SQLite
- opening the admin dashboard or using Images → Save changes idempotently backfills missing WebP previews for existing photos
- video sync validates YouTube links, thumbnail extension, image file signature, and upload size before storing files on disk and metadata in SQLite

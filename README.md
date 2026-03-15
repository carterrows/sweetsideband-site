# Sweetside Band Website

Modern, mobile-first band website built with Next.js (App Router), React, TypeScript, and Tailwind CSS. Band, member, and media content live in local JSON files, while shows are stored in SQLite. Docker is ready for Raspberry Pi 5.

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

Site runs at http://localhost:3000

## JSON content editing

Edit the JSON files under `data/`:

- `data/band.json` - name, location, socials, streaming
- `data/members.json` - band member cards
- `data/media.json` - video gallery cards

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

Photos on `/video/photos` are loaded automatically from `public/images/shows/` and shuffled during site build/static generation (not on every request).

Place other images in `public/images/` and reference them by absolute path in JSON, e.g.

- `/images/members/avery.svg`
- `/images/thumbnails/superstar.png`

Videos should use external links (YouTube/Vimeo) in `data/media.json`.

- Example JSON in `media.json`:

```json
{
  "id": "media-2",
  "type": "video",
  "title": "Live at Voltage Hall",
  "thumbnail": "/images/thumbnails/money_man.jpg",
  "link": "https://www.youtube.com/watch?v=5NV6Rdv1a3I"
}
```

Pull YouTube thumbnails using: http://img.youtube.com/vi/VIDEOID/maxresdefault.jpg

## Environment config

Copy `.env.example` to `.env` if you want to set `SITE_URL`.

## Shows storage

Shows load through `lib/shows-db.ts`.

- Local default database path is `data/shows.sqlite`.
- Docker stores the database in a named volume mounted at `/app/storage/shows.sqlite`.
- Public pages still read through `lib/content.ts`, so the UI contracts stay the same.
- Uploaded posters are stored in runtime storage and served from `/posters/:fileName`.

## Admin

The admin UI lives at `/admin`.

Use the admin UI for show management. JSON editing no longer applies to shows.

Required environment variables:

- `ADMIN_PASSWORD_HASH` - salted scrypt hash for the fixed `admin` username
- `ADMIN_SESSION_SECRET` - random secret for signing the admin session cookie
- `SHOWS_DB_PATH` - optional override for the SQLite file location

The admin dashboard lets you:

- review upcoming and past shows
- edit any show fields
- add and delete shows
- upload PNG posters only
- sync the draft state and revalidate `/` and `/shows`

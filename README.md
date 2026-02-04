# Sweetside Band Website

Modern, mobile-first band website built with Next.js (App Router), React, TypeScript, and Tailwind CSS. Content lives in local JSON files for easy editing, and Docker is ready for Raspberry Pi 5.

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

## Content editing (no code changes)

Edit the JSON files under `data/`:

- `data/band.json` - name, location, socials, streaming
- `data/shows.json` - upcoming and past shows
- `data/members.json` - band member cards
- `data/media.json` - past show photos/videos

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

Place images in `public/images/` and reference them by absolute path in JSON, e.g.

- `/images/members/avery.svg`
- `/images/thumbnails/superstar.png`

Videos should use external links (YouTube/Vimeo) in `data/media.json`.

- Example JSON in `media.json`:

```json
{
  "id": "media-1",
  "type": "image",
  "title": "Static Room, Austin",
  "src": "/images/thumbnails/superstar.png",
  "alt": "Sweetside live at Static Room",
  "link": "/images/thumbnails/superstar.png"
},
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

## Upgrade path: SQLite

The content loader lives in `lib/content.ts`. When you want a database, swap the JSON reads for SQLite queries and keep the same return types (see `lib/types.ts`). Components won’t need changes.

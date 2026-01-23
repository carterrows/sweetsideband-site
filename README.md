# Sweetside - Band Site Prototype

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

- `data/band.json` - name, bio, location, socials, streaming
- `data/shows.json` - upcoming and past shows
- `data/members.json` - band member cards
- `data/media.json` - past show photos/videos

## Images and media

Place images in `public/images/` and reference them by absolute path in JSON, e.g.

- `/images/members/avery.svg`
- `/images/past/show-1.svg`

Videos should use external links (YouTube/Vimeo) in `data/media.json`.

## Environment config

Copy `.env.example` to `.env` if you want to set `NEXT_PUBLIC_SITE_URL`.

## Upgrade path: SQLite

The content loader lives in `lib/content.ts`. When you want a database, swap the JSON reads for SQLite queries and keep the same return types (see `lib/types.ts`). Components won’t need changes.

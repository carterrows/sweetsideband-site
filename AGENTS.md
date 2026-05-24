# Sweetside Band Site - Agent Context

## Project Purpose
- This repository powers the public website for the band **Sweetside**.
- Primary goals: show upcoming/past shows, media gallery, streaming links, merch placeholder, and booking contact.
- Band/member content is file-driven, while shows, video gallery metadata, and photo gallery metadata are stored in SQLite.

## Tech Stack
- **Next.js 16** (App Router) + **React 18** + **TypeScript (strict)**.
- **Tailwind CSS 3** for styling.
- **lucide-react** + custom SVG icons for social/streaming brands.
- Deployed via Node runtime or Docker (multi-stage image).

## Repository Layout
- `app/`: App Router pages, metadata routes, global styles.
- `components/`: UI and interaction components.
- `data/`: Editable site content and the local SQLite file for shows.
- `lib/`: Typed models and content loading helpers.
- `public/`: Static assets (backgrounds, logos, member photos, show photos, icons).
- `Dockerfile`, `docker-compose.yml`: Production container build/run.
- `next.config.js`: security headers + image formats.

## Routing and Page Behavior
- `/` (`app/page.tsx`):
  - Hero with background image and CTA from Spotify status.
  - Sections: upcoming shows (first 3 from the SQLite-backed upcoming list), streaming links, members, contact form.
- `/shows`:
  - Full upcoming + past show listings.
  - Booking mailto link.
- `/admin`:
  - Admin dashboard for editing shows, videos, and gallery images in SQLite.
- `/admin/login`:
  - Fixed-username admin login page.
- `/posters/[fileName]`:
  - Runtime route that serves uploaded poster PNGs from writable storage.
- `/video`:
  - Dedicated video gallery page with large video cards.
  - Video cards are loaded from SQLite-backed admin video metadata.
  - Top pill selector to switch between `Video` and `Photo`.
- `/video/photos`:
  - Masonry-style photo gallery (mixed aspect ratios, spaced grid).
  - In-page lightbox with blur backdrop, close button, and click-outside close.
- `/merch`:
  - “Coming Soon” placeholder page.
- `/contact`:
  - Redirects to `/#contact`.
- Metadata routes:
  - `app/robots.ts` and `app/sitemap.ts` use `SITE_URL` (fallback: `http://localhost:3000`).

## Content System (Important)
- Content loader: `lib/content.ts`.
- Uses synchronous JSON reads from `data/` with a strict allowlist:
  - `band.json`
  - `members.json`
- Show data is loaded from SQLite through `lib/shows-db.ts`.
- Upcoming show records may include optional `venue_url`, `tickets_url`, time, fee, address, and poster fields.
- Public show lists are sorted by date descending within `upcoming` and `past`.
- Videos for `/video` and show photos for `/video/photos` are loaded from SQLite-backed admin gallery metadata, not from JSON or `public/images/shows/`.
- Components/pages rely on these TypeScript types in `lib/types.ts`.

## Data Files: What They Drive
- `data/band.json`:
  - band name, location, booking email, socials, streaming links.
- `data/members.json`:
  - member cards shown on home page.
- `data/shows.sqlite`:
  - local default SQLite database for shows, video gallery metadata, and photo gallery image metadata during non-Docker development.
  - upcoming rows may include `tickets_url` for the public Tickets button.
- `storage/posters/`:
  - local default writable poster storage outside `public/`.
- Docker volume storage:
  - `/app/storage/shows.sqlite`
  - `/app/storage/posters/`
- Video gallery:
  - source of truth for metadata is the `gallery_videos` table in SQLite.
  - uploaded thumbnail files are stored in runtime storage.
  - local default thumbnail storage is `storage/video-thumbnails/`.
  - Docker thumbnail storage lives beside the database inside the mounted `/app/storage` volume.
  - public thumbnails are served through `/video-thumbnails/[fileName]`.
  - public thumbnail responses use immutable cache headers because uploaded filenames are stable and UUID-prefixed.
  - admin uploads accept `.jpg`, `.jpeg`, and `.png` files only, 250 KB max each.
  - use the admin Videos sync button to revalidate the static video gallery from SQLite.
- Photo gallery images:
  - source of truth for metadata is the `gallery_images` table in SQLite.
  - uploaded image files are stored in runtime storage.
  - local default gallery image storage is `storage/gallery-images/`.
  - Docker gallery image storage lives beside the database inside the mounted `/app/storage` volume.
  - public images are served through `/gallery-images/[fileName]`.
  - public image responses use immutable cache headers because uploaded filenames are stable and UUID-prefixed.
  - admin uploads accept `.jpg` and `.jpeg` files only, 1 MB max each.
  - gallery records are shuffled during static generation.
  - use the admin Images sync button to revalidate the static gallery from SQLite.

## Streaming Link Rules
- `spotify`/`appleMusic` accept:
  - URL string (renders clickable icon/button), or
  - `"coming soon"` (case-insensitive string), or
  - `{ "status": "coming-soon" }` (renders disabled state).
- Logic is handled in:
  - `components/StreamingLinks.tsx`
  - `components/SocialLinks.tsx`
  - Home hero CTA in `app/page.tsx`

## Key UI/Interaction Components
- `components/Navbar.tsx` + `NavbarHeroContext.tsx` + `HomeHeroObserver.tsx`:
  - Navbar appearance changes over home hero (transparent/white on hero, paper/accent elsewhere).
  - Handles route navigation, top scroll behavior, and contact-anchor behavior.
  - On mobile, contact click scrolls to center-ish position of contact card.
- `components/GalleryModeTabs.tsx`:
  - Pill-style `Video`/`Photo` selector shared by gallery subpages.
- `components/PhotoMasonryGrid.tsx`:
  - Adaptive masonry photo layout + in-page lightbox interaction.
  - Receives database-backed image media from `getShowPhotos()`.
- `components/MediaGrid.tsx`:
  - Video card grid used on the default gallery route.
  - Receives database-backed video media from `getMedia()`.
- `components/ContactSection.tsx`:
  - Client-side form builds a `mailto:` URL (no backend API).

## Styling and Design System
- Tailwind content paths:
  - `./app/**/*.{ts,tsx}`
  - `./components/**/*.{ts,tsx}`
- Theme extension (`tailwind.config.js`):
  - custom colors (`paper`, `haze`, `ink`, `accent`)
  - custom glow shadow
  - display/body fonts via CSS variables
- Fonts are loaded in `app/layout.tsx` with `next/font/google`:
  - `Bebas Neue` (display)
  - `Inter` (body)

## SEO, Security, Analytics
- Metadata is centralized in `app/layout.tsx` with Open Graph defaults.
- Google site verification token is configured in layout metadata.
- Umami analytics script is loaded in layout:
  - `https://cloud.umami.is/script.js`
- Security headers in `next.config.js` include:
  - CSP
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
- Admin APIs use an in-memory process-wide rate limiter for login and sync requests.
- Logout clears the admin session cookie server-side and the client navigates directly to `/admin/login`.

## Environment Variables
- `.env.example` contains:
  - `SITE_URL=`
- `.env.example` also documents:
  - `ADMIN_PASSWORD_HASH=`
  - `ADMIN_SESSION_SECRET=`
  - `SHOWS_DB_PATH=`
- `SITE_URL` influences metadata base URL, sitemap, and robots URLs.
- Docker build/run also passes `SITE_URL`.
- In Docker Compose, `SHOWS_DB_PATH` is set to `/app/storage/shows.sqlite`.

## Local Development
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Start prod build: `npm start`
- Lint: `npm run lint`

## Docker
- `docker compose up --build` runs production container on `127.0.0.1:3000`.
- Dockerfile uses multi-stage Node 24 bookworm-slim build:
  - install deps (`npm ci`)
  - install native build tools for `better-sqlite3`
  - build Next app
  - prune dev dependencies
  - copy runtime artifacts to non-root `node` user image.

## Known Caveats / Maintenance Notes
- There are currently no automated tests in the repo.
- Shows now exist only in SQLite, so local edits to show listings should go through the admin UI or direct DB changes.
- When a show is moved from `upcoming` to `past`, upcoming-only fields such as `venue_url`, `tickets_url`, and `poster_file_name` are cleared.
- The rate limiter is in-memory, process-wide, and assumes a single app instance.
- Admin poster uploads are limited to valid PNG files, 5 MB each, and 20 MB combined per sync request.
- Admin video thumbnail uploads are limited to valid JPG, JPEG, or PNG files, 250 KB each.
- Many `next/image` usages set `unoptimized`; keep this in mind before changing image optimization strategy.
- `next-env.d.ts` is generated-style and should not be manually edited.
- `node_modules`, `.next`, `.env*`, and `tsconfig.tsbuildinfo` are ignored by git.

## Fast Start Checklist for Future Agents
1. Read `README.md` and this file.
2. Check `data/*.json` for the latest real content before making assumptions.
3. If content-only change: edit JSON + ensure referenced files exist in `public/images/...`.
   For gallery videos, use the admin Videos tab.
   For show photos specifically, use the admin Images tab instead of adding files to `public/images/shows/`.
   For show listings, inspect the admin flow and SQLite helpers.
   For show posters, inspect `lib/show-posters.ts` and the `/posters/[fileName]` route instead of `public/`.
4. If UI change: inspect the specific page in `app/` and related component(s) in `components/`.
5. Run `npm run lint` after code edits.
6. If route/metadata/security behavior changes, review `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, and `next.config.js`.

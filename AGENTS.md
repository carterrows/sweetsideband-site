# Sweetside Band Site - Agent Context

## Project Purpose
- This repository powers the public website for the band **Sweetside**.
- Primary goals: show upcoming/past shows, media gallery, streaming links, merch placeholder, and booking contact.
- Content is file-driven (JSON + static assets), not DB-driven.

## Tech Stack
- **Next.js 16** (App Router) + **React 18** + **TypeScript (strict)**.
- **Tailwind CSS 3** for styling.
- **lucide-react** + custom SVG icons for social/streaming brands.
- Deployed via Node runtime or Docker (multi-stage image).

## Repository Layout
- `app/`: App Router pages, metadata routes, global styles.
- `components/`: UI and interaction components.
- `data/`: Editable site content (band/shows/members/media JSON).
- `lib/`: Typed models and content loading helpers.
- `public/`: Static assets (backgrounds, logos, member photos, show photos, thumbnails, icons).
- `Dockerfile`, `docker-compose.yml`: Production container build/run.
- `next.config.js`: security headers + image formats.

## Routing and Page Behavior
- `/` (`app/page.tsx`):
  - Hero with background image and CTA from Spotify status.
  - Sections: upcoming shows (first 3), streaming links, members, contact form.
- `/shows`:
  - Full upcoming + past show listings.
  - Booking mailto link.
- `/video`:
  - Photo slideshow (images) + video grid.
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
  - `shows.json`
  - `members.json`
  - `media.json`
- Components/pages rely on these TypeScript types in `lib/types.ts`.
- If moving to a DB later, keep return shapes unchanged and swap internals of `lib/content.ts`.

## Data Files: What They Drive
- `data/band.json`:
  - band name, location, booking email, socials, streaming links.
- `data/shows.json`:
  - `upcoming[]` and `past[]` lists.
  - No automatic date sorting/migration; maintain manually.
- `data/members.json`:
  - member cards shown on home page.
- `data/media.json`:
  - mixed list of `video` and `image` items for gallery page.

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
- `components/PhotoSlideshow.tsx`:
  - Swipe, arrows, keyboard nav, lightbox, click-through handling.
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

## Environment Variables
- `.env.example` contains:
  - `SITE_URL=`
- `SITE_URL` influences metadata base URL, sitemap, and robots URLs.
- Docker build/run also passes `SITE_URL`.

## Local Development
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Start prod build: `npm start`
- Lint: `npm run lint`

## Docker
- `docker compose up --build` runs production container on `127.0.0.1:3000`.
- Dockerfile uses multi-stage Node 24 Alpine build:
  - install deps (`npm ci`)
  - build Next app
  - prune dev dependencies
  - copy runtime artifacts to non-root `node` user image.

## Known Caveats / Maintenance Notes
- There are currently no automated tests in the repo.
- `data/shows.json` requires manual upkeep to move dates between `upcoming` and `past`.
- Many `next/image` usages set `unoptimized`; keep this in mind before changing image optimization strategy.
- `next-env.d.ts` is generated-style and should not be manually edited.
- `node_modules`, `.next`, `.env*`, and `tsconfig.tsbuildinfo` are ignored by git.

## Fast Start Checklist for Future Agents
1. Read `README.md` and this file.
2. Check `data/*.json` for the latest real content before making assumptions.
3. If content-only change: edit JSON + ensure referenced files exist in `public/images/...`.
4. If UI change: inspect the specific page in `app/` and related component(s) in `components/`.
5. Run `npm run lint` after code edits.
6. If route/metadata/security behavior changes, review `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, and `next.config.js`.

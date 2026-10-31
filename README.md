# Ghanamaxxing

A place to discover and back the apps and startups coming out of Ghana, with a live map of where they're made.
Live at **https://www.ghanamaxxing.com**. A project of [August Engine](https://www.augustengine.com).

**Stack:** Next.js 15 (App Router, Turbopack) · TypeScript · Tailwind v4 · Supabase (Postgres, auth, storage) ·
MapLibre + OpenFreeMap · Vercel

## What's on the site

- **Hero:** the word GHANAMAXXING in satin 3D bubble letters (GHANA gold, MAXXING Ghana green, over Ghana's black star) filling the first
  screen. Five characters made in Higgsfield walk out from behind the straight-edged letters (H, N, M) as an
  overlapping chain, then rest and repeat. See [Hero characters](#hero-characters).
- **Explore** (`/launches`): browse by **Newest** or **Shuffle** (reshuffled every visit), filter by type.
  Nothing is ranked.
- **Launch pages** (`/launch/[slug]`): logo, one-liner, type, city, link, and the **Ayekoo** button.
- **Ayekoo** ("well done" in Twi): a one-tap cheer. No sign-in. Fills with gold, bursts into confetti, then offers
  share buttons and three more launches to cheer. Counts show only on a launch's own page and are never used to sort.
- **Spotlight of the week:** a random weekly pick (or a pinned one), on the home page.
- **Map** (`/map` and on the home page): dark map with neon-ringed logo pins, clustering when zoomed out,
  type filter chips, and a fly-in to Accra.
- **Add yours** (`/submit`): no-account form; submissions are saved as `pending` for review.
- **Suggest an edit** (`/launch/[slug]/suggest`) and **Remove a listing** (`/remove`): one-box forms, rate-limited.
- **Admin** (`/admin`): launches by status, CSV/JSON import, add one, suggestions queue. Needs Google sign-in
  (not set up yet; see below).
- Google Analytics (`G-745YHYCMWY`), custom favicon/app icons.

## Run it locally

```bash
npm install          # also copies the MapLibre worker into public/maplibre (postinstall)
npm run dev
```

Needs `.env.local` (see below). Without Supabase keys the site falls back to `data/seed-launches.json`.

## Environment variables

| Name | Used for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL, just `https://<ref>.supabase.co` (no `/rest/v1`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public key; row-level security protects the data |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Ayekoo, Add yours and `npm run seed` write with it. Never expose it. |
| `AYEKOO_SALT` | Random string for hashing visitor IPs (spam limits). Falls back to the service key. |
| `NEXT_PUBLIC_SITE_URL` | Canonical links and share previews: `https://www.ghanamaxxing.com` in production |

All five are set in Vercel (production and preview). Locally they live in `.env.local` (git-ignored).

## Database (Supabase)

Everything lives in its own **`ghanamaxxing` schema**, because the Supabase project is shared with another app
(its tables are in `public`; don't touch them). Nothing runs on the shared `auth.users` table: a profile is created
on first sign-in (`ghanamaxxing.ensure_profile()`, called from `/auth/callback`).

Migrations are run **by hand in the Supabase SQL Editor**, in order:

1. `supabase/migrations/20261029000001_init.sql`: schema, tables, triggers, row-level security, storage bucket
2. `supabase/migrations/20261029000002_suggestions.sql`: Suggest an edit
3. `supabase/migrations/20261030000003_ayekoo.sql`: renames stars to ayekoos (all four are applied in production)
4. `supabase/migrations/20261030000004_submissions.sql`: private `launch_submissions` for Add yours

`ghanamaxxing` must be listed in **Project Settings → Data API → Exposed schemas**, or the site can't reach it.

| Table | What it holds |
|---|---|
| `launches` | One row per launch. `status`: pending / approved / rejected / removed. `source`: ghanamaxxing (we added it) or maker. `ayekoo_count` kept in sync by a trigger. |
| `ayekoos` | One per browser per launch (`voter_key` cookie id), plus a salted IP hash. Written only by the server. |
| `launch_submissions` | Who submitted a pending launch (optional email, "I built this"). Private. |
| `suggestions`, `removal_requests` | Visitor reports, private until reviewed. |
| `spotlights` | Spotlight of the week, keyed by Monday (not written by the app yet; the pick is computed). |
| `profiles`, `claims`, `hubs` | Sign-in profiles (`is_admin`), claim requests and a map hubs layer, for later. |

**Approving submissions** (until admin sign-in exists): Table Editor → schema `ghanamaxxing` → `launches` → set
`status` from `pending` to `approved`. The submitter's details are in `launch_submissions`.

## Adding launches in bulk

```bash
npm run seed -- data/my-launches.csv            # preview only
npm run seed -- data/my-launches.csv --commit   # save to the database (approved, "Added by Ghanamaxxing")
```

Start from `data/launches-template.csv` (JSON works too). Existing links are skipped, so re-running is safe.
Logos go in `public/logos/<slug>.webp` and are referenced as `/logos/<slug>.webp`. Launches given only a city or
area (see `src/config/places.ts`) are spread a little around it so pins don't stack.

| Column | Required | Notes |
|---|---|---|
| `name`, `tagline`, `url`, `type` | ✔ | tagline max 100; type is a label or value from `src/config/launch-types.ts` |
| `description`, `logo_url`, `image_url`, `city`, `lat`, `lng`, `maker_name` | | |
| `maker_x`, `maker_instagram`, `maker_linkedin`, `maker_github`, `maker_tiktok`, `maker_website` | | full URLs |
| `launched_at` | | `YYYY-MM-DD`; if empty, 30 days ago so the seed list doesn't fill "Newest" |

## Things you'll want to edit

| What | File |
|---|---|
| Launch types (labels, ring colours) | `src/config/launch-types.ts` |
| Hero characters, timing, size, walk-out letters | `src/config/characters.ts` |
| MAXXING colour | `MAXXING_TINT` in `src/components/hero/hero.tsx` |
| Ayekoo word/language (rotation) | `src/config/ayekoo.ts` |
| Spotlight pin, preview sizes | `src/config/rankings.ts` |
| Nav, footer, contact email, analytics ID | `src/config/site.ts` |
| Known cities/areas and coordinates | `src/config/places.ts` |
| Colours, buttons, hero/map CSS | `src/app/globals.css` |

## Hero characters

Each character is three files in `public/hero/characters/`: `<id>.webm` (VP9 with alpha, for Chrome/Firefox),
`<id>.mov` (HEVC with alpha, for Safari) and `<id>.webp` (still, for reduced motion and blocked playback).
Clips are square, start and end on an empty frame, and the character enters and leaves through the right edge;
the page mirrors them when needed. Each character in `src/config/characters.ts` is tuned to its clip: `feet` (where
they stand), `edge` (how close to the letter), `handoffAt` (when the next one starts), `bumpAt` and `exit` (a push home
so they're behind the letter before the clip's fade at 4.67s).

To make a new one: generate the clip in Higgsfield on a plain grey background, run it through Higgsfield's
background remover, then:

```bash
python3 scripts/hero/make_character_clip.py original.mp4 nobg.mp4 public/hero/characters/<id>
```

Letter colours for MAXXING: `python3 scripts/hero/tint_letters.py <name> <r> <g> <b>`.
Both scripts need numpy and Pillow; the clip script needs ffmpeg on macOS (for HEVC alpha).

**Safari:** in Low Power Mode Safari refuses to autoplay video. The hero detects this, shows a still character,
and unlocks both video players inside the visitor's first tap/click/key press (scrolling doesn't count).

## Deploying

Deploys are done **from this folder with the Vercel CLI** (GitHub isn't connected to the Vercel project yet, so
pushes don't deploy):

```bash
npx vercel deploy --prod
```

Vercel project: `ghanamaxxing` under *august osei's projects* (Hobby plan; switch to Pro before the site makes
money). Domains: `ghanamaxxing.com` → `www.ghanamaxxing.com`. `.vercelignore` keeps `.env*` and build output out of
uploads. If a build fails fetching Google Fonts, just redeploy (it's a transient Vercel/Google error).

To run a production build locally next to `npm run dev`: `NEXT_DIST_DIR=.next-build npm run build`.

## Not built yet

- Google sign-in (needed for `/admin`), claim-a-listing, removal requests queue in admin
- Saving the Spotlight pick to `spotlights` (no-repeat rule, admin override)
- Share images per launch (Open Graph), Hubs map layer, weekly ayekoo email to makers
- Ayekoo phrases in other Ghanaian languages (add to `src/config/ayekoo.ts` once checked by fluent speakers)

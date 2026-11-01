# Ghanamaxxing: notes for Claude

Read README.md for setup, the data model and deploy steps. This file is the "why" and the house rules.

## What it is

A site to **discover and back the apps and startups coming out of Ghana**, with a live map of where they're
made. Built by Augustine Osei (August Engine) in one night, launched on X/LinkedIn. Live at www.ghanamaxxing.com.

## Product principles (decided with the owner; don't undo without asking)

- **Supportive, never competitive.** The makers didn't ask to be listed. No rankings, leaderboards, "most popular",
  vote counts in lists, winners or "people's choice". Counts appear only on a launch's own page.
- **Ayekoo, not votes or stars.** One tap, no sign-in, "Ayekoo (Well done, Twi)". The phrase rotates through
  Ghanaian languages via `src/config/ayekoo.ts`; only add phrases checked by fluent speakers.
- **Spotlight of the week** is a celebration, picked at random (or pinned), never by count.
- **Honest copy.** Don't overpromise ("everything Ghana is building" was rejected). The home caption is the owner's
  own first-person voice. Describe what it is; don't describe what it isn't. Plain words: "apps and startups"
  (not "launches"/"entries"/"builds") in visitor-facing copy.
- **Listings we added** show one quiet line: "Is this yours? Claim it to update the details." The owner dropped the
  longer "we added this / take it down" caption because it read as unsure. Removal stays in the footer and on About.
- **Keep listings simple:** logo, name, one-liner, type, city, link. Don't nag for missing details.

## Design system

- Dark graphite base, satin bubble letters: GHANA in deep gold, MAXXING in Ghana green, over a dense wall of faint
  Adinkra symbols behind the hero and the section under it (`scripts/hero/adinkra_pattern.py`;
  public domain or CC0 only, and don't redraw or add one without checking it with someone who knows them). Satin on purpose: full gloss looked like inflatable vinyl, and matte clay lost the charm. Letters come
  from `scripts/hero/satin_letters.py`, then the icons and share card from `scripts/hero/brand_images.py`. No cream or
  yellow elsewhere in the UI (beyond the word, its G logo and icons, gold appears only in the Ayekoo button's filled
  state).
- Fonts: Fredoka (display, rounded) and Figtree (body). Sentence case; no all-caps labels.
- Buttons: `.btn` (glossy black bubble) and `.btn-quiet` (outline), in `globals.css`.
- Colour comes from content: each launch type has a ring colour (`src/config/launch-types.ts`).
- Mobile first: most visitors are on phones on Ghanaian mobile data. Keep pages light.

## Architecture map

- `src/components/hero/hero.tsx`: letter grid (3 per row on phones, GHANA/MAXXING wide) and the walk-out
  sequencer: two reusable `<video>` players, overlapping chain, rest after a cycle, a cut inside the letter so
  nothing shows through its gaps, Safari Low Power Mode unlock. A frame-by-frame loop fires the bump and handoff and
  pushes characters home. Per-character tuning (`feet`, `edge`, `handoffAt`, `bumpAt`, `exit`) is in
  `src/config/characters.ts`; values are measured from the clips.
- `src/components/map/launch-map.tsx`: MapLibre (lazy-loaded) + OpenFreeMap dark style + Supercluster. The worker
  is served from `public/maplibre/` (copied by `postinstall`) because bundling breaks MapLibre's worker URL.
- `src/app/api/ayekoo/route.ts`: GET state / POST toggle, service role, cookie `gm_vk`, IP-hash limits.
- `src/app/submit/actions.ts`: Add yours, inserts a `pending` launch plus a private `launch_submissions` row.
- `src/lib/boards.ts`: Newest, Shuffle, Spotlight of the week. `src/lib/launches.ts`: public reads.
- `src/lib/supabase/*`: clients, all pinned to the `ghanamaxxing` schema (`DB_SCHEMA`); `service.ts` is server-only.
- `src/components/footer-arch.tsx`: the footer's picture, the Independence Arch in dense ASCII on black (`scripts/hero/arch_ascii.py`, cut out of a CC BY photo credited in the footer) with clouds drifting above it. One colour, crisp silhouette, nothing stray, and the star is negative space. Earlier versions were rejected: photo grain and line art looked messy, and a white footer was too jarring on a dark site. Only runs near the screen.
- `src/lib/maker-email.ts` + `src/app/api/maker-emails/route.ts`: emails to whoever submits a listing: a receipt on submitting, and "it's live" once approved. n8n (`n8n/build_maker_emails_workflow.py`) calls the route every 10 minutes and sends through Gmail, currently from augustministry@gmail.com with the sender name Ghanamaxxing; a domain address (Zoho) is planned.
- `src/lib/notify.ts`: form alerts. Posts to the n8n workflow (`n8n/build_alerts_workflow.py`), which emails August through Gmail.
- New listing logos can go in the Supabase bucket `ghanamaxxing-media` (`logos/<slug>.webp`), which needs no deploy; files in `public/logos` do.
- `src/lib/import/launch-input.ts`: shared validation for seed import, admin import and Add yours.
- `src/config/collections.ts` + `src/app/[collection]/page.tsx`: pages for searches like "games made in Ghana". Add a
  page by adding an entry; it reaches the sitemap, footer and Explore by itself. Plain lists, no "top" or "best". No city gets linked from the site, because it's all of Ghana: the Accra page is search-only.
  Structured data goes through `src/components/json-ld.tsx`.

## House rules

- **Batch commits.** Don't commit/push after every change; wait for a meaningful batch or the owner's go-ahead.
- **Deploy only when asked** ("push it live"): commit, push, then `npx vercel deploy --prod` (GitHub isn't
  connected to Vercel, so a push alone doesn't deploy). Check the live site afterwards.
- **Never print or paste secrets.** Read `.env.local` with `process.loadEnvFile` and pipe values; Vercel env vars are
  set with `npx vercel env add ... < stdin`.
- **Database changes** go in a new numbered migration in `supabase/migrations/`; the owner runs it in the SQL
  Editor. Test it first in PGlite with a stubbed `auth`/`storage`/`extensions` schema. Never touch `public.*`.
- Verify UI changes in the browser at phone (375px) and desktop widths before reporting done.
- Clean up any test data written to the real database.

## Known gaps / things worth auditing

- **Google sign-in isn't configured in Supabase**, so the header's Sign in button is removed until it is. `/signin`
  and `/admin` still exist and depend on it. Put the button back in `site-header.tsx` once it works.
- **Every clip has a fade baked in from 4.67s** (`HERO_TIMING.fadeStartsAt`). A character must be behind their letter
  by then or they ghost out in plain view. Check this for any new clip, and use `edge`/`exit` to get there.
- The five shipped clips also have a sliver wrapped round to the far edges (fixed in the script for new clips, hidden
  by `clip-path` on `.gm-walker` for these). Re-rendering them from the originals would remove both this and the fade.
- Admin pages (`src/app/admin/*`) were built early and only lightly restyled.
- `src/components/home/rankings-preview.tsx` and `src/config/rankings.ts` keep old names; they now hold the
  Newest/Shuffle preview and Spotlight settings.
- Spotlight of the week is computed, not yet saved to `spotlights` (no-repeat rule not enforced).
- No per-launch share images (Open Graph) yet; previews use the screenshot, logo or the site card
  (`src/app/opengraph-image.png`, made from the hero letters).
- The About page says "no rankings or leaderboards", which describes what the site isn't. Left for the owner's voice.
- `hero.tsx` was reformatted mid-session; formatting is inconsistent with the rest (no Prettier config in repo).
- Safari HEVC playback was only tested via a Chrome simulation of Safari's autoplay rules, not in real Safari.
- Listings with no city have no map pin, so the map legend leaves them out.

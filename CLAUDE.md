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
- **Listings we added** say so and offer "Claim it / ask us to take it down".
- **Keep listings simple:** logo, name, one-liner, type, city, link. Don't nag for missing details.

## Design system

- Dark graphite base, glossy black bubble letters, MAXXING in Ghana green. No cream or yellow in the UI
  (gold appears only in the Ayekoo button's filled state).
- Fonts: Fredoka (display, rounded) and Figtree (body). Sentence case; no all-caps labels.
- Buttons: `.btn` (glossy black bubble) and `.btn-quiet` (outline), in `globals.css`.
- Colour comes from content: each launch type has a ring colour (`src/config/launch-types.ts`).
- Mobile first: most visitors are on phones on Ghanaian mobile data. Keep pages light.

## Architecture map

- `src/components/hero/hero.tsx`: letter grid (3 per row on phones, GHANA/MAXXING wide) and the walk-out
  sequencer: two reusable `<video>` players, overlapping chain (`handoffAt`), rest after a cycle, clipping so a
  character is only visible past the letter's outer edge, Safari Low Power Mode unlock. Timing/size in
  `src/config/characters.ts`.
- `src/components/map/launch-map.tsx`: MapLibre (lazy-loaded) + OpenFreeMap dark style + Supercluster. The worker
  is served from `public/maplibre/` (copied by `postinstall`) because bundling breaks MapLibre's worker URL.
- `src/app/api/ayekoo/route.ts`: GET state / POST toggle, service role, cookie `gm_vk`, IP-hash limits.
- `src/app/submit/actions.ts`: Add yours, inserts a `pending` launch plus a private `launch_submissions` row.
- `src/lib/boards.ts`: Newest, Shuffle, Spotlight of the week. `src/lib/launches.ts`: public reads.
- `src/lib/supabase/*`: clients, all pinned to the `ghanamaxxing` schema (`DB_SCHEMA`); `service.ts` is server-only.
- `src/lib/import/launch-input.ts`: shared validation for seed import, admin import and Add yours.

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

- **Sign in is in the header but Google sign-in isn't configured in Supabase**, so it doesn't work yet. Either set
  it up (README step) or hide the button until it is. `/admin` depends on it.
- Admin pages (`src/app/admin/*`) were built early and only lightly restyled.
- `src/components/home/rankings-preview.tsx` and `src/config/rankings.ts` keep old names; they now hold the
  Newest/Shuffle preview and Spotlight settings.
- Spotlight of the week is computed, not yet saved to `spotlights` (no-repeat rule not enforced).
- No per-launch share images (Open Graph) yet; previews use the logo or screenshot.
- `hero.tsx` was reformatted mid-session; formatting is inconsistent with the rest (no Prettier config in repo).
- Safari HEVC playback was only tested via a Chrome simulation of Safari's autoplay rules, not in real Safari.
- 3 seed launches have no logo (Kowri, Redbird Health, Asoriba) and show initials.

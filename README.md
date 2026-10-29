# Ghanamaxxing

The launch board and live map of what Ghanaians are building. ghanamaxxing.com

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres, auth, storage) · Vercel

> **Status: phase 1 of 5.** Database schema, seed import, launches list and launch pages.
> Voting, rankings and spotlight come in phase 2, the map in phase 3, the landing hero in phase 4, and share cards, claims and removals in phase 5.

---

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. **Before Supabase is connected, the site shows the example launches** from
`data/sample-launches.json`, so you can preview the UI. Sign-in and admin need Supabase.

## Connect Supabase (one-time setup)

1. **Create a project** at [supabase.com](https://supabase.com) (the free tier is fine to start). Pick the region closest to Ghana; *West EU (London)* or *Central EU (Frankfurt)* are the closest options.
2. **Create the tables.** In the Supabase dashboard open **SQL Editor**, paste the whole of
   `supabase/migrations/20261029000001_init.sql` and click **Run**.
   (Or with the CLI: `npx supabase login`, then `npx supabase link --project-ref <ref>`, then `npx supabase db push`.)
3. **Add your keys.** Copy `.env.example` to `.env.local` and fill in the values from
   **Project Settings → API**: the project URL, the `anon` key and the `service_role` key.
4. **Turn on Google sign-in:**
   1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an **OAuth client ID** (type: *Web application*).
   2. Under *Authorised redirect URIs*, add `https://<your-project-ref>.supabase.co/auth/v1/callback`.
   3. In Supabase go to **Authentication → Sign In / Providers → Google**, paste the client ID and secret, and enable it.
   4. In Supabase go to **Authentication → URL Configuration**. Set *Site URL* to your live URL, and add
      `http://localhost:3000/**` and `https://<your-domain>/**` to *Redirect URLs*.
5. **Make yourself admin.** Sign in once on the site, then run this in the SQL Editor:
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'you@example.com');
   ```
   Then open `/admin`.

## Environment variables

| Name | Where it's used |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Everywhere (Supabase project URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Everywhere (public key, protected by row-level security) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Only** the `npm run seed` script. Server-only; never expose it in the browser or add it to Vercel unless needed. |
| `NEXT_PUBLIC_SITE_URL` | Canonical links and share images, e.g. `https://ghanamaxxing.com` |

## Seeding launches

Seeded launches are approved immediately, labelled **"Added by Ghanamaxxing"** and start at **0 votes**.
Rows whose link (or chosen slug) already exists are skipped, so re-running an import is safe.

**From the admin (easiest):** go to `/admin/import` and upload a CSV or JSON file. You'll see a preview with any
errors before anything is saved. Use `/admin/new` to add one launch at a time, including logo and screenshot uploads.

**From the command line:**

```bash
npm run seed -- data/my-launches.csv            # preview only
npm run seed -- data/my-launches.csv --commit   # save to the database
```

### File format

Start from `data/launches-template.csv`. JSON is an array of objects with the same keys, or
`{ "launches": [...] }`. The maker links can also go in a nested `maker_socials` object; see
`data/sample-launches.json`.

| Column | Required | Notes |
|---|---|---|
| `name` | ✔ | max 80 characters |
| `tagline` | ✔ | one line, max 100 |
| `url` | ✔ | must start with `https://` or `http://` |
| `type` | ✔ | `AI`, `Fintech`, `Games`, `Edtech`, `Creative`, `Student projects`, `Other` (label or value, any case) |
| `description` | | max 800 |
| `logo_url`, `image_url` | | public image URLs (square logo, 16:9 screenshot) |
| `city` | | city or Accra area. Known places (see `src/config/places.ts`) fill in coordinates automatically |
| `lat`, `lng` | | override coordinates |
| `maker_name` | | |
| `maker_x`, `maker_instagram`, `maker_linkedin`, `maker_github`, `maker_tiktok`, `maker_website` | | full URLs |
| `launched_at` | | `YYYY-MM-DD`. **If empty, it defaults to 30 days ago** so a day-one import doesn't flood "Built This Week" and "Rising" (change this in `src/config/rankings.ts`) |
| `slug` | | defaults to the name, e.g. `kente-pay` |

## Things you'll want to edit

| What | File |
|---|---|
| Launch types (labels, colours) | `src/config/launch-types.ts` |
| Ranking and spotlight thresholds | `src/config/rankings.ts` |
| Nav, footer links, contact email | `src/config/site.ts` |
| Known cities and areas with coordinates | `src/config/places.ts` |
| Colour palette | `src/app/globals.css` (`@theme`) |

## Project layout

```
src/app/            pages and routes (admin under src/app/admin)
src/components/     shared UI
src/config/         everything you're likely to tweak
src/lib/            data access, Supabase clients, import validation
supabase/migrations database schema, security rules and triggers
scripts/seed.mts    CLI seed import
data/               CSV template and example launches
```

## Data model (summary)

- `launches`: one row per launch. `status` is `pending`, `approved`, `rejected` or `removed`; `source` is `ghanamaxxing` or `maker`.
  `vote_count` is kept in sync by a trigger. Non-admins can't change status, source, ownership or votes (enforced in the database).
- `votes`: one per account per launch (primary key). Admin can soft-remove suspicious votes (`removed_at`).
- `spotlights`, `claims`, `removal_requests`, `hubs`: created now, used in later phases.
- `profiles`: created automatically on first sign-in. `is_admin` gives access to `/admin`.

## Deploying (Vercel)

1. Import the GitHub repo in Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` as environment variables.
3. Add the Vercel URL (and later `https://ghanamaxxing.com/**`) to Supabase's **Redirect URLs**.

> Vercel's free **Hobby** plan is for non-commercial use. It's fine while building, but switch to **Pro ($20/month)**
> before the site makes money (ads, sponsorships, paid listings).

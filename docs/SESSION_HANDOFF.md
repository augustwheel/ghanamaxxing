# Session handoff — 2 November 2026

The site is live at https://www.ghanamaxxing.com. Read `AGENTS.md` for product and design decisions and `README.md` for setup, the data model and deployment.

## Current discovery experience

- The header search suggests approved apps by name as a visitor types; `/launches` has search and type filtering. The implementation is in `src/components/app-search.tsx`, `src/lib/search.ts` and `src/app/api/search/route.ts`.
- Each approved app has a `/launch/[slug]` page with metadata. Search-focused category collection pages come from `src/config/collections.ts`.
- The homepage has ten category cards, including Health tech, Agritech and Logistics. Counts show approved apps, directly above each category name. Inline SVG characters react briefly on hover, focus or touch. The grid is in `src/components/home/category-grid.tsx`.
- The homepage intro is centered at desktop widths. Newest and Shuffle show four apps each so their card balances the Spotlight card.
- Four Corners is pinned as Spotlight of the week in `src/config/rankings.ts`. Its detailed content is in `src/config/featured-launches.ts`. The home card has one subtle pointer tilt, a static image and a border that encloses the whole card.

## Data and operations

- The combined migration `supabase/migrations/20261102000009_healthtech.sql` adds Ayekoo email preference fields and moves selected apps from Other into Health tech, Agritech and Logistics. On 2 November, production Supabase showed the new fields and the checked apps in their new types; the migration is already applied.
- `src/config/legacy-launch-types.ts` maps older Other rows during public reads. Revisit it once all relevant rows are cleanly reclassified.
- Deploy with `npx vercel deploy --prod` after pushing; GitHub is not connected to the Vercel project. Check the live custom domain afterward.
- Google sign-in and the admin flow remain unconfigured. Spotlight picks are computed rather than stored, and individual launch share images are still missing.

## Next session

Start with the new request, then inspect `git status`, this note and the relevant source. Keep `AGENTS.md` product rules intact. Batch commits and deploy only when asked.

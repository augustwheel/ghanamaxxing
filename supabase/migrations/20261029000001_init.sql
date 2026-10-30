-- Ghanamaxxing v1 schema.
--
-- Everything lives in its own `ghanamaxxing` schema so it can share a Supabase project with other
-- apps: no name clashes, and nothing here runs for other apps' users. After running this, add
-- `ghanamaxxing` to Project Settings → API → Exposed schemas so the site can reach it.

create schema if not exists ghanamaxxing;
create extension if not exists citext with schema extensions;

-- ─── Enums ────────────────────────────────────────────────────────────────
create type ghanamaxxing.launch_source as enum ('ghanamaxxing', 'maker');
create type ghanamaxxing.launch_status as enum ('pending', 'approved', 'rejected', 'removed');
create type ghanamaxxing.request_status as enum ('pending', 'approved', 'rejected');

-- ─── Profiles ─────────────────────────────────────────────────────────────
-- One row per person who has signed into Ghanamaxxing (not every user in the shared project).
create table ghanamaxxing.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Called by the app right after sign-in. Creates the profile from the Google name and avatar.
create function ghanamaxxing.ensure_profile()
returns void
language sql
security definer
set search_path = ''
as $$
  insert into ghanamaxxing.profiles (id, display_name, avatar_url)
  select u.id,
         coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
         coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
    from auth.users u
   where u.id = auth.uid()
  on conflict (id) do nothing;
$$;

-- Used by RLS policies. security definer so it can read profiles regardless of policies.
create function ghanamaxxing.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from ghanamaxxing.profiles where id = auth.uid()), false);
$$;

-- ─── Launches ─────────────────────────────────────────────────────────────
create table ghanamaxxing.launches (
  id uuid primary key default gen_random_uuid(),
  slug extensions.citext not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  tagline text not null check (char_length(tagline) between 1 and 100),
  description text check (char_length(description) <= 800),
  url text not null check (url ~* '^https?://'),
  logo_url text,
  image_url text,
  -- Validated against src/config/launch-types.ts in the app, so types can change without a migration.
  type text not null,
  city text,
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  maker_name text,
  maker_socials jsonb not null default '{}'::jsonb,
  -- Normalised maker identity (lower-case, single spaces).
  maker_key text generated always as (
    nullif(lower(regexp_replace(btrim(coalesce(maker_name, '')), '\s+', ' ', 'g')), '')
  ) stored,
  source ghanamaxxing.launch_source not null default 'maker',
  status ghanamaxxing.launch_status not null default 'pending',
  submitted_by uuid references auth.users (id) on delete set null,
  claimed_by uuid references auth.users (id) on delete set null,
  -- When the launch counts as launched (for "Newest"). Set on approval, or by admin on import.
  launched_at timestamptz,
  star_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index launches_status_launched_idx on ghanamaxxing.launches (status, launched_at desc);
create index launches_type_idx on ghanamaxxing.launches (type) where status = 'approved';
create unique index launches_url_unique on ghanamaxxing.launches (lower(url));

create function ghanamaxxing.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger launches_updated_at
  before update on ghanamaxxing.launches
  for each row execute function ghanamaxxing.set_updated_at();

-- Stamp launched_at the first time a launch is approved.
create function ghanamaxxing.stamp_launched_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and new.launched_at is null then
    new.launched_at := now();
  end if;
  return new;
end;
$$;

create trigger launches_stamp_launched_at
  before insert or update of status on ghanamaxxing.launches
  for each row execute function ghanamaxxing.stamp_launched_at();

-- Non-admins can't change moderation/ownership fields on their own launches.
create function ghanamaxxing.guard_launch_fields()
returns trigger
language plpgsql
as $$
begin
  -- Admins, the service role (seed import, star counting) and the SQL editor (postgres) skip the guard.
  if current_user not in ('anon', 'authenticated') or ghanamaxxing.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.source := 'maker';
    new.submitted_by := auth.uid();
    new.claimed_by := null;
    new.launched_at := null;
    new.star_count := 0;
  else
    new.status := old.status;
    new.source := old.source;
    new.submitted_by := old.submitted_by;
    new.claimed_by := old.claimed_by;
    new.launched_at := old.launched_at;
    new.star_count := old.star_count;
    new.slug := old.slug;
  end if;
  return new;
end;
$$;

create trigger launches_guard_fields
  before insert or update on ghanamaxxing.launches
  for each row execute function ghanamaxxing.guard_launch_fields();

-- ─── Stars ────────────────────────────────────────────────────────────────
-- One star per browser per launch, no sign-in needed. Stars are written only by the site's server
-- (service role), which identifies a browser by a random id in a private cookie (voter_key) and
-- keeps a salted hash of the IP address to rate-limit and spot abuse.
create table ghanamaxxing.stars (
  launch_id uuid not null references ghanamaxxing.launches (id) on delete cascade,
  voter_key text not null check (char_length(voter_key) between 16 and 64),
  user_id uuid references auth.users (id) on delete set null, -- set if they were signed in
  ip_hash text,
  created_at timestamptz not null default now(),
  -- Soft-removed by admin (suspicious stars). Removed stars never count.
  removed_at timestamptz,
  removed_reason text,
  primary key (launch_id, voter_key)
);

create index stars_launch_created_idx on ghanamaxxing.stars (launch_id, created_at desc) where removed_at is null;
create index stars_ip_created_idx on ghanamaxxing.stars (ip_hash, created_at desc);

-- Keep launches.star_count equal to the number of active stars.
create function ghanamaxxing.sync_star_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.launch_id, old.launch_id);
begin
  update ghanamaxxing.launches
     set star_count = (
       select count(*) from ghanamaxxing.stars s
        where s.launch_id = target and s.removed_at is null
     )
   where id = target;
  return null;
end;
$$;

create trigger stars_sync_count
  after insert or delete or update of removed_at on ghanamaxxing.stars
  for each row execute function ghanamaxxing.sync_star_count();

-- ─── Star of the week ─────────────────────────────────────────────────────
-- One row per week, keyed by that week's Monday.
create table ghanamaxxing.spotlights (
  week_start date primary key check (extract(isodow from week_start) = 1),
  launch_id uuid not null references ghanamaxxing.launches (id) on delete cascade,
  picked_by text not null default 'auto' check (picked_by in ('auto', 'admin')),
  created_at timestamptz not null default now()
);

-- ─── Claims & removal requests ────────────────────────────────────────────
create table ghanamaxxing.claims (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references ghanamaxxing.launches (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_email text not null,
  proof_url text,
  note text check (char_length(note) <= 1000),
  status ghanamaxxing.request_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table ghanamaxxing.removal_requests (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid references ghanamaxxing.launches (id) on delete set null,
  launch_reference text, -- what the requester typed (URL or name), in case it didn't match
  requester_name text not null,
  requester_email text not null,
  reason text not null check (char_length(reason) <= 2000),
  status ghanamaxxing.request_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── Hubs (optional map layer) ────────────────────────────────────────────
create table ghanamaxxing.hubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'coworking' check (kind in ('coworking', 'incubator', 'other')),
  city text,
  lat double precision not null,
  lng double precision not null,
  url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Access ───────────────────────────────────────────────────────────────
-- The API roles can reach the schema; row-level security below decides what each can do.
grant usage on schema ghanamaxxing to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema ghanamaxxing to anon, authenticated, service_role;
grant execute on all functions in schema ghanamaxxing to anon, authenticated, service_role;

alter table ghanamaxxing.profiles enable row level security;
alter table ghanamaxxing.launches enable row level security;
alter table ghanamaxxing.stars enable row level security;
alter table ghanamaxxing.spotlights enable row level security;
alter table ghanamaxxing.claims enable row level security;
alter table ghanamaxxing.removal_requests enable row level security;
alter table ghanamaxxing.hubs enable row level security;

-- Profiles: public names/avatars, users edit their own (but can't make themselves admin).
create policy "profiles are public" on ghanamaxxing.profiles for select using (true);
create policy "users update own profile" on ghanamaxxing.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and is_admin = (select p.is_admin from ghanamaxxing.profiles p where p.id = auth.uid()));

-- Launches
create policy "approved launches are public" on ghanamaxxing.launches for select
  using (status = 'approved' or submitted_by = auth.uid() or claimed_by = auth.uid() or ghanamaxxing.is_admin());
create policy "signed-in users submit launches" on ghanamaxxing.launches for insert
  to authenticated with check (true); -- guard_launch_fields forces pending/maker/submitted_by
create policy "owners edit their launches" on ghanamaxxing.launches for update
  to authenticated using (submitted_by = auth.uid() or claimed_by = auth.uid() or ghanamaxxing.is_admin());
create policy "admin deletes launches" on ghanamaxxing.launches for delete using (ghanamaxxing.is_admin());

-- Stars: written by the server only (service role bypasses RLS). Admin can read and moderate.
-- Counts are public through launches.star_count.
create policy "admin reads stars" on ghanamaxxing.stars for select using (ghanamaxxing.is_admin());
create policy "admin moderates stars" on ghanamaxxing.stars for update using (ghanamaxxing.is_admin());

-- Star of the week: public read, admin writes.
create policy "spotlights are public" on ghanamaxxing.spotlights for select using (true);
create policy "admin manages spotlights" on ghanamaxxing.spotlights for all
  using (ghanamaxxing.is_admin()) with check (ghanamaxxing.is_admin());

-- Claims: claimant sees own, admin sees all.
create policy "users create claims" on ghanamaxxing.claims for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');
create policy "users see own claims" on ghanamaxxing.claims for select using (user_id = auth.uid() or ghanamaxxing.is_admin());
create policy "admin reviews claims" on ghanamaxxing.claims for update using (ghanamaxxing.is_admin());

-- Removal requests: anyone can file, only admin can read.
create policy "anyone requests removal" on ghanamaxxing.removal_requests for insert with check (status = 'pending');
create policy "admin reads removals" on ghanamaxxing.removal_requests for select using (ghanamaxxing.is_admin());
create policy "admin reviews removals" on ghanamaxxing.removal_requests for update using (ghanamaxxing.is_admin());

-- Hubs
create policy "active hubs are public" on ghanamaxxing.hubs for select using (active or ghanamaxxing.is_admin());
create policy "admin manages hubs" on ghanamaxxing.hubs for all
  using (ghanamaxxing.is_admin()) with check (ghanamaxxing.is_admin());

-- ─── Storage: logos and screenshots ───────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ghanamaxxing-media', 'ghanamaxxing-media', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'])
on conflict (id) do nothing;

-- Policy names are shared across all apps on storage.objects, so they're prefixed.
create policy "ghanamaxxing: media is public" on storage.objects for select
  using (bucket_id = 'ghanamaxxing-media');
create policy "ghanamaxxing: admin uploads media" on storage.objects for insert
  with check (bucket_id = 'ghanamaxxing-media' and ghanamaxxing.is_admin());
-- Signed-in makers upload into a folder named after their user id.
create policy "ghanamaxxing: users upload own media" on storage.objects for insert to authenticated
  with check (bucket_id = 'ghanamaxxing-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "ghanamaxxing: admin deletes media" on storage.objects for delete
  using (bucket_id = 'ghanamaxxing-media' and ghanamaxxing.is_admin());

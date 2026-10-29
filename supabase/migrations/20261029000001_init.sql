-- Ghanamaxxing v1 schema.
-- Everything shown on the site is computed from these tables.

create extension if not exists citext;

-- ─── Enums ────────────────────────────────────────────────────────────────
create type public.launch_source as enum ('ghanamaxxing', 'maker');
create type public.launch_status as enum ('pending', 'approved', 'rejected', 'removed');
create type public.request_status as enum ('pending', 'approved', 'rejected');

-- ─── Profiles ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Create a profile whenever someone signs up (Google fills name + avatar).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Used by RLS policies. security definer so it can read profiles regardless of policies.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ─── Launches ─────────────────────────────────────────────────────────────
create table public.launches (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
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
  -- Normalised maker identity, used for "first-time maker" in the Underdog ranking.
  maker_key text generated always as (
    nullif(lower(regexp_replace(btrim(coalesce(maker_name, '')), '\s+', ' ', 'g')), '')
  ) stored,
  source public.launch_source not null default 'maker',
  status public.launch_status not null default 'pending',
  submitted_by uuid references public.profiles (id) on delete set null,
  claimed_by uuid references public.profiles (id) on delete set null,
  -- When the launch counts as "launched" for rankings. Set on approval, or by admin on import.
  launched_at timestamptz,
  star_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index launches_status_launched_idx on public.launches (status, launched_at desc);
create index launches_type_idx on public.launches (type) where status = 'approved';
create index launches_maker_key_idx on public.launches (maker_key);
create unique index launches_url_unique on public.launches (lower(url));

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger launches_updated_at
  before update on public.launches
  for each row execute function public.set_updated_at();

-- Stamp launched_at the first time a launch is approved.
create function public.stamp_launched_at()
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
  before insert or update of status on public.launches
  for each row execute function public.stamp_launched_at();

-- Non-admins can't change moderation/ownership fields on their own launches.
create function public.guard_launch_fields()
returns trigger
language plpgsql
as $$
begin
  -- Admins, the service role (seed import) and the SQL editor (postgres) skip the guard.
  if current_user not in ('anon', 'authenticated') or public.is_admin() then
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
  before insert or update on public.launches
  for each row execute function public.guard_launch_fields();

-- ─── Stars ────────────────────────────────────────────────────────────────
create table public.stars (
  launch_id uuid not null references public.launches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Soft-removed by admin (suspicious stars). Removed stars never count.
  removed_at timestamptz,
  removed_reason text,
  primary key (launch_id, user_id)
);

create index stars_launch_created_idx on public.stars (launch_id, created_at desc) where removed_at is null;
create index stars_user_created_idx on public.stars (user_id, created_at desc);

-- Keep launches.star_count equal to the number of active stars.
create function public.sync_star_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.launch_id, old.launch_id);
begin
  update public.launches
     set star_count = (
       select count(*) from public.stars v
        where v.launch_id = target and v.removed_at is null
     )
   where id = target;
  return null;
end;
$$;

create trigger stars_sync_count
  after insert or delete or update of removed_at on public.stars
  for each row execute function public.sync_star_count();

-- ─── Spotlights ───────────────────────────────────────────────────────────
-- Star of the week: one row per week, keyed by that week's Monday.
create table public.spotlights (
  week_start date primary key check (extract(isodow from week_start) = 1),
  launch_id uuid not null references public.launches (id) on delete cascade,
  picked_by text not null default 'auto' check (picked_by in ('auto', 'admin')),
  created_at timestamptz not null default now()
);

-- ─── Claims & removal requests ────────────────────────────────────────────
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.launches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  contact_email text not null,
  proof_url text,
  note text check (char_length(note) <= 1000),
  status public.request_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.removal_requests (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid references public.launches (id) on delete set null,
  launch_reference text, -- what the requester typed (URL or name), in case it didn't match
  requester_name text not null,
  requester_email text not null,
  reason text not null check (char_length(reason) <= 2000),
  status public.request_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── Hubs (optional map layer) ────────────────────────────────────────────
create table public.hubs (
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

-- ─── Row-level security ───────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.launches enable row level security;
alter table public.stars enable row level security;
alter table public.spotlights enable row level security;
alter table public.claims enable row level security;
alter table public.removal_requests enable row level security;
alter table public.hubs enable row level security;

-- Profiles: public names/avatars (for "Backed by"), users edit their own.
create policy "profiles are public" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));

-- Launches
create policy "approved launches are public" on public.launches for select
  using (status = 'approved' or submitted_by = auth.uid() or claimed_by = auth.uid() or public.is_admin());
create policy "signed-in users submit launches" on public.launches for insert
  to authenticated with check (true); -- guard_launch_fields forces pending/maker/submitted_by
create policy "owners edit their launches" on public.launches for update
  to authenticated using (submitted_by = auth.uid() or claimed_by = auth.uid() or public.is_admin());
create policy "admin deletes launches" on public.launches for delete using (public.is_admin());

-- Stars: counts are public; users add/remove only their own (rules tightened in phase 2).
create policy "stars are public" on public.stars for select using (removed_at is null or public.is_admin());
create policy "users star" on public.stars for insert to authenticated
  with check (
    user_id = auth.uid()
    and removed_at is null
    and exists (select 1 from public.launches l where l.id = launch_id and l.status = 'approved')
  );
create policy "users unstar" on public.stars for delete to authenticated
  using (user_id = auth.uid() and removed_at is null);
create policy "admin moderates stars" on public.stars for update using (public.is_admin());

-- Spotlights: public read, admin writes (auto-pick runs as security definer in phase 2).
create policy "spotlights are public" on public.spotlights for select using (true);
create policy "admin manages spotlights" on public.spotlights for all using (public.is_admin()) with check (public.is_admin());

-- Claims: claimant sees own, admin sees all.
create policy "users create claims" on public.claims for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');
create policy "users see own claims" on public.claims for select using (user_id = auth.uid() or public.is_admin());
create policy "admin reviews claims" on public.claims for update using (public.is_admin());

-- Removal requests: anyone can file, only admin can read.
create policy "anyone requests removal" on public.removal_requests for insert
  with check (status = 'pending');
create policy "admin reads removals" on public.removal_requests for select using (public.is_admin());
create policy "admin reviews removals" on public.removal_requests for update using (public.is_admin());

-- Hubs
create policy "active hubs are public" on public.hubs for select using (active or public.is_admin());
create policy "admin manages hubs" on public.hubs for all using (public.is_admin()) with check (public.is_admin());

-- ─── Storage: logos and screenshots ───────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('launch-media', 'launch-media', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'])
on conflict (id) do nothing;

create policy "launch media is public" on storage.objects for select
  using (bucket_id = 'launch-media');
create policy "admin uploads launch media" on storage.objects for insert
  with check (bucket_id = 'launch-media' and public.is_admin());
-- Signed-in makers upload into a folder named after their user id.
create policy "users upload own launch media" on storage.objects for insert to authenticated
  with check (bucket_id = 'launch-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "admin manages launch media" on storage.objects for delete
  using (bucket_id = 'launch-media' and public.is_admin());

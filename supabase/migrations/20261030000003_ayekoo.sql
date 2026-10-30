-- Stars become "ayekoos": a supportive one-tap "well done", never a ranking.
-- Renames only; there are no stars yet, and nothing else about how they're stored changes.

alter table ghanamaxxing.stars rename to ayekoos;
alter index ghanamaxxing.stars_launch_created_idx rename to ayekoos_launch_created_idx;
alter index ghanamaxxing.stars_ip_created_idx rename to ayekoos_ip_created_idx;
alter table ghanamaxxing.ayekoos rename constraint stars_pkey to ayekoos_pkey;
alter policy "admin reads stars" on ghanamaxxing.ayekoos rename to "admin reads ayekoos";
alter policy "admin moderates stars" on ghanamaxxing.ayekoos rename to "admin moderates ayekoos";

alter table ghanamaxxing.launches rename column star_count to ayekoo_count;

-- Recreate the count trigger with the new names.
drop trigger stars_sync_count on ghanamaxxing.ayekoos;
drop function ghanamaxxing.sync_star_count();

create function ghanamaxxing.sync_ayekoo_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.launch_id, old.launch_id);
begin
  update ghanamaxxing.launches
     set ayekoo_count = (
       select count(*) from ghanamaxxing.ayekoos a
        where a.launch_id = target and a.removed_at is null
     )
   where id = target;
  return null;
end;
$$;

create trigger ayekoos_sync_count
  after insert or delete or update of removed_at on ghanamaxxing.ayekoos
  for each row execute function ghanamaxxing.sync_ayekoo_count();

-- The launch guard referenced star_count; update it to the new column name.
create or replace function ghanamaxxing.guard_launch_fields()
returns trigger
language plpgsql
as $$
begin
  -- Admins, the service role (seed import, ayekoo counting) and the SQL editor (postgres) skip the guard.
  if current_user not in ('anon', 'authenticated') or ghanamaxxing.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.source := 'maker';
    new.submitted_by := auth.uid();
    new.claimed_by := null;
    new.launched_at := null;
    new.ayekoo_count := 0;
  else
    new.status := old.status;
    new.source := old.source;
    new.submitted_by := old.submitted_by;
    new.claimed_by := old.claimed_by;
    new.launched_at := old.launched_at;
    new.ayekoo_count := old.ayekoo_count;
    new.slug := old.slug;
  end if;
  return new;
end;
$$;

grant execute on function ghanamaxxing.sync_ayekoo_count() to anon, authenticated, service_role;

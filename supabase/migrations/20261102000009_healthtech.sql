-- Apply the pending Ayekoo email preference fields and reclassify existing
-- Health tech, Agritech and Logistics listings in one SQL Editor run.
-- Only move rows still in Other, respecting any later maker or editor changes.
-- Keep AI-focused minoHealth under AI.
begin;

alter table ghanamaxxing.claim_requests
  add column if not exists ayekoo_updates_opted_in_at timestamptz;

alter table ghanamaxxing.launch_submissions
  add column if not exists ayekoo_updates_opted_in_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'launch_submissions_ayekoo_updates_maker_check'
      and conrelid = 'ghanamaxxing.launch_submissions'::regclass
  ) then
    alter table ghanamaxxing.launch_submissions
      add constraint launch_submissions_ayekoo_updates_maker_check
      check (ayekoo_updates_opted_in_at is null or (made_it and contact_email is not null));
  end if;
end
$$;

update ghanamaxxing.launches
set type = 'healthtech'
where type = 'other'
  and slug in ('mpharma', 'rivia-clinics', 'yemaachi-biotech', 'drdogood');

update ghanamaxxing.launches
set type = 'agritech'
where type = 'other'
  and slug in (
    'agrocenta', 'complete-farmer', 'esoko', 'farmerline',
    'farmsmart', 'sesi-technologies', 'trotro-tractor'
  );

update ghanamaxxing.launches
set type = 'logistics'
where type = 'other'
  and slug in ('shaq-express', 'swoove', 'vdl-fulfilment');

commit;

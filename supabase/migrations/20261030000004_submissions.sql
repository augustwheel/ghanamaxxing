-- "Add yours": anyone can submit a launch without an account. The launch itself is created as
-- `pending` (invisible until the admin approves it). Who submitted it, and how to reach them, is
-- kept here, privately: never on the public launches table.

create table ghanamaxxing.launch_submissions (
  launch_id uuid primary key references ghanamaxxing.launches (id) on delete cascade,
  contact_email text check (contact_email is null or char_length(contact_email) <= 200),
  made_it boolean not null default false, -- "I built this"
  ip_hash text,
  created_at timestamptz not null default now()
);

create index launch_submissions_ip_created_idx on ghanamaxxing.launch_submissions (ip_hash, created_at desc);

grant select, insert, update, delete on ghanamaxxing.launch_submissions to anon, authenticated, service_role;
alter table ghanamaxxing.launch_submissions enable row level security;

-- Written only by the site's server (service role). Only the admin can read them.
create policy "admin reads submissions" on ghanamaxxing.launch_submissions for select using (ghanamaxxing.is_admin());
create policy "admin manages submissions" on ghanamaxxing.launch_submissions for update using (ghanamaxxing.is_admin());

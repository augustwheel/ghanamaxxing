-- "Claim it": a maker can ask for their listing without an account. `claims` needs a signed-in user, and
-- this works without one. The contact details stay private: anyone can file, only the admin can read.

create table ghanamaxxing.claim_requests (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid references ghanamaxxing.launches (id) on delete set null,
  launch_reference text not null check (char_length(launch_reference) <= 300), -- what the requester typed
  requester_name text not null check (char_length(requester_name) <= 120),
  requester_email text not null check (char_length(requester_email) <= 200),
  connection text not null check (char_length(connection) <= 2000), -- how they're connected to it
  status ghanamaxxing.request_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on ghanamaxxing.claim_requests to anon, authenticated, service_role;
alter table ghanamaxxing.claim_requests enable row level security;

create policy "anyone requests a claim" on ghanamaxxing.claim_requests for insert with check (status = 'pending');
create policy "admin reads claim requests" on ghanamaxxing.claim_requests for select using (ghanamaxxing.is_admin());
create policy "admin reviews claim requests" on ghanamaxxing.claim_requests for update using (ghanamaxxing.is_admin());

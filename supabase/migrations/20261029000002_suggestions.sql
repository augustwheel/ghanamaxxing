-- Visitors can suggest missing or corrected details for a listing. Suggestions are private
-- until the admin reviews them. One free-text box: "what should we fix or add?"

create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.launches (id) on delete cascade,
  field text not null default 'other' check (field in ('maker', 'socials', 'location', 'description', 'logo', 'link', 'type', 'closed', 'other')),
  value text not null check (char_length(value) between 1 and 1000),
  contact_email text check (contact_email is null or char_length(contact_email) <= 200),
  user_id uuid references public.profiles (id) on delete set null,
  status public.request_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index suggestions_pending_idx on public.suggestions (created_at desc) where status = 'pending';

alter table public.suggestions enable row level security;

-- Anyone, signed in or not, can suggest. They can't read suggestions back or set the status.
create policy "anyone suggests" on public.suggestions for insert
  with check (status = 'pending' and (user_id is null or user_id = auth.uid()));
create policy "admin reads suggestions" on public.suggestions for select using (public.is_admin());
create policy "admin reviews suggestions" on public.suggestions for update using (public.is_admin());
create policy "admin deletes suggestions" on public.suggestions for delete using (public.is_admin());

-- Basic flood control: at most 5 suggestions per launch per 10 minutes, and 200 site-wide per hour.
create function public.limit_suggestions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.suggestions s
       where s.launch_id = new.launch_id and s.created_at > now() - interval '10 minutes') >= 5
     or (select count(*) from public.suggestions s where s.created_at > now() - interval '1 hour') >= 200 then
    raise exception 'Too many suggestions right now. Try again in a few minutes.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger suggestions_limit
  before insert on public.suggestions
  for each row execute function public.limit_suggestions();

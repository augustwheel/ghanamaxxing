-- Email signup list. Addresses and tokens stay private; visitors can only use server actions.

create table ghanamaxxing.newsletter_subscribers (
  email extensions.citext primary key check (char_length(email::text) <= 200),
  status text not null default 'pending' check (status in ('pending', 'active', 'unsubscribed')),
  confirmation_token_hash text unique,
  confirmation_sent_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  consent_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'active' or confirmed_at is not null)
);

create index newsletter_subscribers_ip_created_idx
  on ghanamaxxing.newsletter_subscribers (ip_hash, created_at desc);

create trigger newsletter_subscribers_updated_at
  before update on ghanamaxxing.newsletter_subscribers
  for each row execute function ghanamaxxing.set_updated_at();

-- Reserved for future issue delivery records so retries can skip completed sends.
create table ghanamaxxing.newsletter_deliveries (
  issue_month date not null,
  email extensions.citext not null references ghanamaxxing.newsletter_subscribers (email) on delete cascade,
  sent_at timestamptz not null default now(),
  primary key (issue_month, email),
  check (extract(day from issue_month) = 1)
);

revoke all on ghanamaxxing.newsletter_subscribers from anon, authenticated;
revoke all on ghanamaxxing.newsletter_deliveries from anon, authenticated;
grant select, insert, update, delete on ghanamaxxing.newsletter_subscribers to service_role;
grant select, insert, update, delete on ghanamaxxing.newsletter_deliveries to service_role;
alter table ghanamaxxing.newsletter_subscribers enable row level security;
alter table ghanamaxxing.newsletter_deliveries enable row level security;

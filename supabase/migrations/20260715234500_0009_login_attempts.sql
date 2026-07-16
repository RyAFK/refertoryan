-- Durable (cross-instance) store for login-attempt rate limiting / account
-- lockout / brute-force + credential-stuffing detection (§3). No RLS policy
-- is defined for any role, so with RLS enabled this table is deny-all for
-- anon/authenticated — only a server-side client using the service_role key
-- (which bypasses RLS) can read or write it. That client must never be used
-- outside trusted server code.
create table public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  email_normalized text not null,
  ip_address text,
  outcome text not null check (outcome in ('success', 'failure')),
  reason text,
  created_at timestamptz not null default now()
);

alter table public.login_attempts enable row level security;

create index login_attempts_email_idx on public.login_attempts(email_normalized, created_at);
create index login_attempts_ip_idx on public.login_attempts(ip_address, created_at);

comment on table public.login_attempts is
  'Server-only (service_role) rate-limiting store. No RLS policies exist for anon/authenticated by design - this table must never be queried with the publishable/anon key.';

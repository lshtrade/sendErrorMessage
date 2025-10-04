-- Supabase Error Logger table schema
-- Run this script in Supabase SQL Editor

create table if not exists error_logs (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  stack text,
  level text not null check (level in ('error','warning','info')),
  timestamp timestamptz not null,
  user_id text,
  session_id text,
  url text,
  user_agent text,
  metadata jsonb,
  status integer,
  status_text text,
  created_at timestamptz not null default now()
);

-- Performance indexes
create index if not exists error_logs_level_timestamp_idx on error_logs(level, timestamp desc);
create index if not exists error_logs_user_id_idx on error_logs(user_id) where user_id is not null;
create index if not exists error_logs_status_idx on error_logs(status) where status is not null;
create index if not exists error_logs_created_at_idx on error_logs(created_at desc);

-- RLS (Row Level Security) policies (optional)
-- Set so only administrators can view all logs
alter table error_logs enable row level security;

-- Policy for administrator role (assumes admin column exists in auth.users table)
create policy "Admins can view all error logs" on error_logs
  for select using (
    exists (
      select 1 from auth.users 
      where auth.users.id = auth.uid() 
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only authenticated users can insert logs
create policy "Authenticated users can insert error logs" on error_logs
  for insert with check (auth.uid() is not null);

-- Auto cleanup policy (optional - delete logs older than 30 days)
-- Set up cron job to run this function periodically
create or replace function cleanup_old_error_logs()
returns void as $$
begin
  delete from error_logs 
  where created_at < now() - interval '30 days';
end;
$$ language plpgsql;

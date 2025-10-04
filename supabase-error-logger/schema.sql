-- Supabase Error Logger 테이블 스키마
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

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

-- 성능을 위한 인덱스
create index if not exists error_logs_level_timestamp_idx on error_logs(level, timestamp desc);
create index if not exists error_logs_user_id_idx on error_logs(user_id) where user_id is not null;
create index if not exists error_logs_status_idx on error_logs(status) where status is not null;
create index if not exists error_logs_created_at_idx on error_logs(created_at desc);

-- RLS (Row Level Security) 정책 (선택사항)
-- 관리자만 모든 로그를 볼 수 있도록 설정
alter table error_logs enable row level security;

-- 관리자 역할을 위한 정책 (auth.users 테이블에 admin 컬럼이 있다고 가정)
create policy "Admins can view all error logs" on error_logs
  for select using (
    exists (
      select 1 from auth.users 
      where auth.users.id = auth.uid() 
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 로그 삽입은 인증된 사용자만 가능
create policy "Authenticated users can insert error logs" on error_logs
  for insert with check (auth.uid() is not null);

-- 자동 정리 정책 (선택사항 - 30일 이상 된 로그 삭제)
-- 이 함수를 주기적으로 실행하도록 cron job 설정
create or replace function cleanup_old_error_logs()
returns void as $$
begin
  delete from error_logs 
  where created_at < now() - interval '30 days';
end;
$$ language plpgsql;

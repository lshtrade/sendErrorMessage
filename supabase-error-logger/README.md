## Supabase Error Logger

Sentry 스타일의 `captureException`/`captureMessage` API를 제공하고, 로그를 Supabase 테이블에 저장하는 가벼운 로거입니다.

### 설치

```bash
npm i supabase-error-logger @supabase/supabase-js
```

### 테이블 스키마 예시

```sql
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
  created_at timestamptz not null default now()
);

-- Optional index
create index if not exists error_logs_level_timestamp_idx on error_logs(level, timestamp desc);
```

### 사용법

```ts
import { SupabaseErrorLogger } from 'supabase-error-logger';

const logger = new SupabaseErrorLogger({
  supabaseUrl: process.env.VITE_SUPABASE_URL!,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY!,
  tableName: 'error_logs',
  enabled: true,
});

// 사용자/세션 식별자 설정
logger.setUser('user-123');
logger.setSession('session-abc');

// 예외 로깅 (Sentry.captureException 과 유사)
try {
  // ...
} catch (err) {
  await logger.captureException(err as Error, { status: 500 });
}

// 메시지 로깅
await logger.captureMessage('just info');
await logger.captureMessage('warning!', 'warning', { area: 'checkout' });

// 런타임 중 설정 변경
logger.configure({ enabled: false });
```

### Remix `root.tsx` 연동 예시

```ts
// app/root.tsx 내부 ErrorBoundary 등에서 사용
import { SupabaseErrorLogger } from 'supabase-error-logger';

const errorLogger = new SupabaseErrorLogger({
  supabaseUrl: (globalThis as any).__ENV?.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: (globalThis as any).__ENV?.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
});

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    if (error.status !== 404) {
      errorLogger.captureException({ status: error.status, statusText: error.statusText, message: String(error) });
    }
    // ... 기존 렌더링 로직
  } else {
    errorLogger.captureException(error as any);
  }
  // ...
}
```

### 테스트

```bash
npm test
```



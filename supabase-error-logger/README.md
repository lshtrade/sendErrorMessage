## Supabase Error Logger

A lightweight logger that provides Sentry-style `captureException`/`captureMessage` API and stores logs in Supabase tables.

### Installation

```bash
npm i supabase-error-logger @supabase/supabase-js
```

### Table Schema Example

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

### Usage

```ts
import { SupabaseErrorLogger } from 'supabase-error-logger';

const logger = new SupabaseErrorLogger({
  supabaseUrl: process.env.VITE_SUPABASE_URL!,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY!,
  tableName: 'error_logs',
  enabled: true,
});

// Set user/session identifiers
logger.setUser('user-123');
logger.setSession('session-abc');

// Exception logging (similar to Sentry.captureException)
try {
  // ...
} catch (err) {
  await logger.captureException(err as Error, { status: 500 });
}

// Message logging
await logger.captureMessage('just info');
await logger.captureMessage('warning!', 'warning', { area: 'checkout' });

// Runtime configuration changes
logger.configure({ enabled: false });
```

### Remix `root.tsx` Integration Example

```ts
// Used in ErrorBoundary etc. inside app/root.tsx
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
    // ... existing rendering logic
  } else {
    errorLogger.captureException(error as any);
  }
  // ...
}
```

### Testing

```bash
npm test
```



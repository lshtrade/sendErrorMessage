# Supabase Error Logger 사용 예시

## Remix 프로젝트에서 사용하기

### 1. 설치
```bash
npm install supabase-error-logger @supabase/supabase-js
```

### 2. root.tsx에서 사용
```tsx
// app/root.tsx
import { SupabaseErrorLogger } from 'supabase-error-logger';

// 전역 로거 인스턴스 생성
const errorLogger = new SupabaseErrorLogger({
  supabaseUrl: (globalThis as any).__ENV?.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: (globalThis as any).__ENV?.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
  tableName: 'error_logs',
  enabled: true,
});

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    if (error.status !== 404) {
      // Sentry.captureException(error) 대신 사용
      errorLogger.captureException({ 
        status: error.status, 
        statusText: error.statusText, 
        message: String(error) 
      });
    }
    // ... 기존 에러 페이지 렌더링
  } else {
    // 일반 에러도 로깅
    errorLogger.captureException(error as any);
  }
  // ... 에러 페이지 렌더링
}
```

### 3. API 라우트에서 사용
```ts
// app/routes/api/some-action.ts
import { SupabaseErrorLogger } from 'supabase-error-logger';

const logger = new SupabaseErrorLogger({
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_ANON_KEY!,
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    // 비즈니스 로직
    return json({ success: true });
  } catch (error) {
    await logger.captureException(error as Error, { 
      action: 'some-action',
      method: request.method 
    });
    throw error;
  }
}
```

### 4. 클라이언트 사이드에서 사용
```tsx
// app/components/SomeComponent.tsx
import { SupabaseErrorLogger } from 'supabase-error-logger';

const logger = new SupabaseErrorLogger({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});

export function SomeComponent() {
  const handleError = async (error: Error) => {
    await logger.captureException(error, { 
      component: 'SomeComponent',
      userId: 'user-123' 
    });
  };

  return <div>...</div>;
}
```

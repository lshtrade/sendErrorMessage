# Supabase Error Logger Usage Example

## Using in Remix Project

### 1. Installation
```bash
npm install supabase-error-logger @supabase/supabase-js
```

### 2. Using in root.tsx
```tsx
// app/root.tsx
import { SupabaseErrorLogger } from 'supabase-error-logger';

// Create global logger instance
const errorLogger = new SupabaseErrorLogger({
  supabaseUrl: (globalThis as any).__ENV?.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: (globalThis as any).__ENV?.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
  tableName: 'error_logs',
  enabled: true,
});

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    if (error.status !== 404) {
      // Use instead of Sentry.captureException(error)
      errorLogger.captureException({ 
        status: error.status, 
        statusText: error.statusText, 
        message: String(error) 
      });
    }
    // ... existing error page rendering
  } else {
    // Log general errors too
    errorLogger.captureException(error as any);
  }
  // ... error page rendering
}
```

### 3. Using in API Routes
```ts
// app/routes/api/some-action.ts
import { SupabaseErrorLogger } from 'supabase-error-logger';

const logger = new SupabaseErrorLogger({
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_ANON_KEY!,
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Business logic
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

### 4. Using on Client Side
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

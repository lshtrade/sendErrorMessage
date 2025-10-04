# SendErrorMessage

A comprehensive error logging solution providing both database-backed and direct notification approaches for modern applications.

## 🚀 Overview

SendErrorMessage is a collection of TypeScript libraries designed to solve different error logging needs:

- **`error-logger-sendSMS`** - Direct Discord/Slack notifications without database dependencies
- **`supabase-error-logger`** - Database-backed error logging with Supabase integration

Both libraries provide Sentry-style APIs (`captureException`/`captureMessage`) with different storage strategies to fit various application architectures.

## 📦 Packages

### error-logger-sendSMS

**Zero-database error logging with instant Discord/Slack notifications**

```bash
npm install error-logger-sendsms
```

**Key Features:**
- 🚀 **Zero Database Required** - Direct webhook notifications
- 🔄 **Multiple Providers** - Discord and Slack support
- 🛡️ **Data Sanitization** - Automatic sensitive data protection
- 🔁 **Retry Logic** - Built-in retry with exponential backoff
- 🌍 **Environment Aware** - Automatic environment detection
- ⚡ **TypeScript First** - Full type safety and IntelliSense

**Quick Start:**
```typescript
import { ErrorLogger } from 'error-logger-sendsms';

const logger = new ErrorLogger({
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL!
  }
});

// Capture exceptions
try {
  throw new Error('Something went wrong!');
} catch (error) {
  await logger.captureException(error, { userId: '123' });
}

// Capture messages
await logger.captureMessage('User logged in', 'info', { userId: '123' });
```

**Perfect for:**
- Frontend applications (React, Vue, Angular)
- Microservices without centralized logging
- Quick prototyping and MVP development
- Teams using Discord/Slack for communication

### supabase-error-logger

**Database-backed error logging with Supabase integration**

```bash
npm install supabase-error-logger @supabase/supabase-js
```

**Key Features:**
- 🗄️ **Persistent Storage** - Errors stored in Supabase tables
- 📊 **Queryable Data** - SQL queries for error analysis
- 🔍 **Rich Context** - User sessions, URLs, metadata
- 🎯 **Sentry-like API** - Familiar `captureException`/`captureMessage`
- 🔧 **Runtime Configuration** - Update settings without restart

**Quick Start:**
```typescript
import { SupabaseErrorLogger } from 'supabase-error-logger';

const logger = new SupabaseErrorLogger({
  supabaseUrl: process.env.VITE_SUPABASE_URL!,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY!,
  tableName: 'error_logs'
});

// Set user/session context
logger.setUser('user-123');
logger.setSession('session-abc');

// Capture exceptions
try {
  // ...
} catch (err) {
  await logger.captureException(err as Error, { status: 500 });
}

// Capture messages
await logger.captureMessage('just info');
await logger.captureMessage('warning!', 'warning', { area: 'checkout' });
```

**Perfect for:**
- Production applications requiring error persistence
- Teams needing error analytics and reporting
- Applications with user session tracking
- Long-term error monitoring and analysis

## 🏗️ Project Structure

```
sendErrorMessage/
├── error-logger-sendSMS/          # Direct notification package
│   ├── src/                       # Source code
│   │   ├── index.ts              # Main ErrorLogger class
│   │   ├── providers/             # Discord/Slack providers
│   │   ├── config/                # Configuration management
│   │   ├── types/                 # TypeScript definitions
│   │   └── utils/                 # Utilities (sanitization, retry)
│   ├── examples/                  # Usage examples
│   ├── tests/                     # Test suite
│   └── README.md                  # Package documentation
├── supabase-error-logger/         # Database-backed package
│   ├── src/                       # Source code
│   │   ├── index.ts              # Main SupabaseErrorLogger class
│   │   ├── env-utils.ts          # Environment utilities
│   │   └── types/                # TypeScript definitions
│   ├── examples/                  # Usage examples
│   ├── schema.sql                # Database schema
│   ├── tests/                     # Test suite
│   └── README.md                  # Package documentation
├── docs/                          # Project documentation
│   ├── constitution-feature.md   # Project principles
│   └── specify/                   # Feature specifications
├── specs/                         # Technical specifications
└── README.md                      # This file
```

## 🎯 When to Use Which Package

### Choose `error-logger-sendSMS` when:

- ✅ You want **immediate notifications** without database setup
- ✅ Your team uses **Discord or Slack** for communication
- ✅ You need **zero infrastructure** dependencies
- ✅ You're building **frontend applications** or **microservices**
- ✅ You want **quick setup** and **minimal configuration**
- ✅ You prefer **real-time alerts** over **historical analysis**

### Choose `supabase-error-logger` when:

- ✅ You need **persistent error storage** for analysis
- ✅ You want to **query and analyze** error patterns
- ✅ You're building **production applications** with user sessions
- ✅ You need **long-term error monitoring** and reporting
- ✅ You want to **correlate errors** with user behavior
- ✅ You prefer **data-driven debugging** over **immediate alerts**

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- TypeScript 5.0+
- npm or yarn

### Installation

**For direct notifications (error-logger-sendSMS):**
```bash
npm install error-logger-sendsms
```

**For database logging (supabase-error-logger):**
```bash
npm install supabase-error-logger @supabase/supabase-js
```

### Environment Setup

**Discord/Slack Notifications:**
```env
# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN
DISCORD_USERNAME=ErrorBot

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#errors

# Global settings
ERROR_LOGGER_ENABLED=true
ERROR_LOGGER_ENVIRONMENT=production
```

**Supabase Database:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 Configuration

### error-logger-sendSMS Configuration

```typescript
const logger = new ErrorLogger({
  discord: {
    webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN',
    username: 'ErrorBot',
    avatarUrl: 'https://example.com/avatar.png'
  },
  slack: {
    webhookUrl: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
    channel: '#errors',
    username: 'ErrorBot'
  },
  enabled: true,
  environment: 'production',
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    jitter: true
  },
  sanitization: {
    enabled: true,
    customPatterns: ['password', 'token', 'secret']
  }
});
```

### supabase-error-logger Configuration

```typescript
const logger = new SupabaseErrorLogger({
  supabaseUrl: process.env.VITE_SUPABASE_URL!,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY!,
  tableName: 'error_logs',
  enabled: true
});

// Set user/session context
logger.setUser('user-123');
logger.setSession('session-abc');
```

## 📊 Database Schema (supabase-error-logger)

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

-- Optional index for performance
create index if not exists error_logs_level_timestamp_idx on error_logs(level, timestamp desc);
```

## 🧪 Testing

### Run Tests for All Packages

```bash
# Test error-logger-sendSMS
cd error-logger-sendSMS
npm test

# Test supabase-error-logger
cd supabase-error-logger
npm test
```

### Test Coverage

```bash
# Coverage for error-logger-sendSMS
cd error-logger-sendSMS
npm run test:coverage

# Coverage for supabase-error-logger
cd supabase-error-logger
npm run test:coverage
```

## 🛠️ Development

### Building Packages

```bash
# Build error-logger-sendSMS
cd error-logger-sendSMS
npm run build

# Build supabase-error-logger
cd supabase-error-logger
npm run build
```

### Development Mode

```bash
# Watch mode for error-logger-sendSMS
cd error-logger-sendSMS
npm run dev

# Watch mode for supabase-error-logger
cd supabase-error-logger
npm run dev
```

## 📚 Examples

### Express.js Integration (error-logger-sendSMS)

```typescript
import express from 'express';
import { ErrorLogger } from 'error-logger-sendsms';

const app = express();
const errorLogger = new ErrorLogger();

// Global error handler
app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
  await errorLogger.captureException(err, {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query
  });

  res.status(500).json({ error: 'Internal server error' });
});
```

### Remix Integration (supabase-error-logger)

```typescript
// app/root.tsx
import { SupabaseErrorLogger } from 'supabase-error-logger';

const errorLogger = new SupabaseErrorLogger({
  supabaseUrl: (globalThis as any).__ENV?.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: (globalThis as any).__ENV?.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
});

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    if (error.status !== 404) {
      errorLogger.captureException({ 
        status: error.status, 
        statusText: error.statusText, 
        message: String(error) 
      });
    }
  } else {
    errorLogger.captureException(error as any);
  }
  // ... existing rendering logic
}
```

## 🔒 Security & Privacy

### Data Sanitization

Both packages automatically sanitize sensitive data:

**Default Patterns:**
- `password`, `token`, `key`, `secret`
- `auth`, `credential`, `api_key`
- `access_token`, `refresh_token`

**Custom Patterns:**
```typescript
const logger = new ErrorLogger({
  sanitization: {
    enabled: true,
    customPatterns: ['custom_secret', 'internal_key']
  }
});
```

### Environment Variables

- Never commit webhook URLs or API keys to version control
- Use environment variables for all sensitive configuration
- Rotate webhook URLs and API keys regularly
- Use different webhooks for different environments

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with tests
4. **Run tests** (`npm test`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Setup

```bash
# Clone the repository
git clone https://github.com/lshtrade/sendErrorMessage.git
cd sendErrorMessage

# Install dependencies for both packages
cd error-logger-sendSMS && npm install
cd ../supabase-error-logger && npm install

# Run tests
cd ../error-logger-sendSMS && npm test
cd ../supabase-error-logger && npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 [GitHub Issues](https://github.com/lshtrade/sendErrorMessage/issues)
- 📖 [Documentation](https://github.com/lshtrade/sendErrorMessage#readme)
- 🏠 [Homepage](https://github.com/lshtrade/sendErrorMessage#readme)

## 🗺️ Roadmap

### Upcoming Features

- **Additional Providers**: Microsoft Teams, Telegram, Email notifications
- **Error Aggregation**: Group similar errors to reduce noise
- **Performance Monitoring**: Integration with performance metrics
- **Custom Dashboards**: Web-based error monitoring interface
- **Mobile Support**: React Native and Flutter integrations

### Version History

- **v1.0.1** - Initial release with Discord/Slack support
- **v1.0.0** - Stable release with comprehensive testing
- **v0.9.0** - Beta release with core functionality

---

**Made with ❤️ for developers who care about error monitoring**

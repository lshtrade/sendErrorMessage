# Error Logger SendSMS

Lightweight error logging with Discord/Slack notifications - no database required.

## Features

- 🚀 **Zero Database** - No database setup required
- 📢 **Multi-Platform** - Send to Discord and/or Slack webhooks
- 🔒 **Privacy First** - Automatic sanitization of sensitive data (passwords, tokens, PII)
- ♻️ **Retry Logic** - Exponential backoff with circuit breaker
- 🌍 **Environment Aware** - Auto-detects development/staging/production
- 📦 **Minimal Config** - Sensible defaults, works out of the box
- ⚡ **Fast** - <5s notification delivery, <100ms initialization
- 🎯 **TypeScript** - Full type safety with TypeScript

## Installation

```bash
npm install error-logger-sendsms
```

## Quick Start

### Option 1: Using Environment Variables (Recommended)

Create `.env` file:
```bash
# Discord configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN

# Or Slack configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#errors
```

Use in code:
```typescript
import { ErrorLogger } from 'error-logger-sendsms';

// Automatically loads configuration from environment variables
const logger = new ErrorLogger();

// Ready to use immediately!
try {
  throw new Error('Something went wrong!');
} catch (error) {
  await logger.captureException(error);
}

await logger.captureMessage('User logged in', 'info', { userId: '123' });
```

### Option 2: Explicit Configuration

```typescript
import { ErrorLogger } from 'error-logger-sendsms';

const logger = new ErrorLogger({
  discord: {
    webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN'
  }
});

// Capture exceptions
try {
  throw new Error('Something went wrong!');
} catch (error) {
  await logger.captureException(error);
}

// Capture messages
await logger.captureMessage('User logged in', 'info', { userId: '123' });
```

## Environment Variables

### Node.js / Backend

```bash
# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_USERNAME=Error Bot
DISCORD_AVATAR_URL=https://example.com/avatar.png

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_CHANNEL=#errors
SLACK_USERNAME=Error Monitor

# Global Settings
ERROR_LOGGER_ENABLED=true
ERROR_LOGGER_ENVIRONMENT=production
```

### Vite / Frontend

When using Vite, use the `VITE_` prefix:

```bash
# .env
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
VITE_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
VITE_ERROR_LOGGER_ENABLED=true
```

### Next.js

```bash
# .env.local
NEXT_PUBLIC_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
NEXT_PUBLIC_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

Use in code:
```typescript
const logger = new ErrorLogger({
  discord: {
    webhookUrl: process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL
  }
});
```

### Both Discord and Slack

```typescript
const logger = new ErrorLogger({
  discord: {
    webhookUrl: 'https://discord.com/api/webhooks/...'
  },
  slack: {
    webhookUrl: 'https://hooks.slack.com/services/...'
  }
});

// Sends to BOTH platforms
await logger.captureException(new Error('Critical error'));
```

## Configuration

### Retry Policy

```typescript
const logger = new ErrorLogger({
  discord: { webhookUrl: '...' },
  retry: {
    maxAttempts: 3,        // 1-5 attempts
    baseDelay: 1000,       // Initial delay (ms)
    maxDelay: 30000,       // Maximum delay (ms)
    jitter: true           // Add randomization
  }
});
```

### Data Sanitization

```typescript
const logger = new ErrorLogger({
  discord: { webhookUrl: '...' },
  sanitization: {
    enabled: true,
    customPatterns: ['creditCard', 'ssn'],
    excludeDefaults: false  // Use built-in patterns
  }
});
```

Default patterns automatically sanitize:
- Passwords (`password`, `passwd`, `pwd`)
- Tokens (`token`, `bearer`, `jwt`, `apikey`)
- Secrets (`secret`, `private_key`)
- Email addresses
- Credit card numbers
- Social Security Numbers

### Environment Detection

```typescript
// Auto-detects from NODE_ENV, import.meta.env, or window.location
const logger = new ErrorLogger({
  discord: { webhookUrl: '...' }
});

// Or set manually
const logger = new ErrorLogger({
  discord: { webhookUrl: '...' },
  environment: 'production'
});
```

### Runtime Configuration

```typescript
const logger = new ErrorLogger({
  discord: { webhookUrl: '...' }
});

// Disable temporarily
logger.configure({ enabled: false });

// Add Slack
logger.configure({
  enabled: true,
  slack: { webhookUrl: '...' }
});

// Change environment
logger.setEnvironment('staging');
```

## API Reference

### `ErrorLogger`

#### Constructor

```typescript
new ErrorLogger(config?: Partial<NotificationConfig>)
```

#### Methods

**`captureException(error: Error | string, metadata?: Record<string, any>): Promise<void>`**

Capture and send an exception.

```typescript
await logger.captureException(new Error('Failed'), { userId: '123' });
```

**`captureMessage(message: string, level?: 'error' | 'warning' | 'info', metadata?: Record<string, any>): Promise<void>`**

Capture and send a message.

```typescript
await logger.captureMessage('User action', 'info', { action: 'login' });
```

**`configure(config: Partial<NotificationConfig>): void`**

Update configuration at runtime.

```typescript
logger.configure({ enabled: false });
```

**`setEnvironment(environment: string): void`**

Set environment override.

```typescript
logger.setEnvironment('production');
```

## Examples

See the [examples/](./examples) directory for integration examples with:
- Basic usage
- Advanced configuration
- React applications
- Express.js servers

## Performance

- **Notification delivery**: <5 seconds
- **Initialization**: <100ms
- **Package size**: <10MB
- **Throughput**: 1000 notifications/minute

## Constitutional Principles

This package adheres to strict development principles:
- **Reliability First**: Never fails silently, implements fallbacks
- **Privacy by Design**: Automatic data sanitization
- **Test-First Development**: 85%+ code coverage
- **Minimal Configuration**: Works with sensible defaults
- **Performance Conscious**: Minimal overhead on applications

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests.

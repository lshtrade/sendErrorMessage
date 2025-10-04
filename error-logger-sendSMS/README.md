# Error Logger SendSMS

A lightweight, zero-dependency error logging library that sends notifications to Discord and Slack webhooks. Perfect for monitoring errors in production without requiring a database or external services.

## Features

- 🚀 **Zero Database Required** - Direct webhook notifications
- 🔄 **Multiple Providers** - Discord and Slack support
- 🛡️ **Data Sanitization** - Automatic sensitive data protection
- 🔁 **Retry Logic** - Built-in retry with exponential backoff
- 🌍 **Environment Aware** - Automatic environment detection
- ⚡ **TypeScript First** - Full type safety and IntelliSense
- 🎯 **Sentry-like API** - Familiar `captureException`/`captureMessage` methods
- 🔧 **Runtime Configuration** - Update settings without restart

## Installation

```bash
npm install error-logger-sendsms
```

## Quick Start

### 1. Environment Variables (Recommended)

Create a `.env` file:

```env
# Discord (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN
DISCORD_USERNAME=ErrorBot
DISCORD_AVATAR_URL=https://example.com/avatar.png

# Slack (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#errors
SLACK_USERNAME=ErrorBot

# Global settings
ERROR_LOGGER_ENABLED=true
ERROR_LOGGER_ENVIRONMENT=production
```

### 2. Basic Usage

```typescript
import { ErrorLogger } from 'error-logger-sendsms';

// Initialize with environment variables
const logger = new ErrorLogger();

// Capture exceptions
try {
  throw new Error('Something went wrong!');
} catch (error) {
  await logger.captureException(error, {
    userId: '123',
    action: 'purchase'
  });
}

// Capture messages
await logger.captureMessage('User logged in', 'info', { userId: '123' });
await logger.captureMessage('Payment warning', 'warning', { amount: 100 });
```

## Configuration

### Explicit Configuration

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

### Runtime Configuration

```typescript
// Temporarily disable logging
logger.configure({ enabled: false });

// Change environment
logger.setEnvironment('staging');

// Update configuration
logger.configure({
  discord: {
    webhookUrl: 'NEW_WEBHOOK_URL'
  }
});
```

## Express.js Integration

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

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason: any) => {
  await errorLogger.captureException(
    new Error(`Unhandled rejection: ${reason}`),
    { reason }
  );
});
```

## API Reference

### ErrorLogger Class

#### Constructor

```typescript
new ErrorLogger(config?: Partial<NotificationConfig>)
```

#### Methods

##### `captureException(error, metadata?)`

Capture and send an exception.

```typescript
await logger.captureException(new Error('Database connection failed'), {
  userId: '123',
  query: 'SELECT * FROM users'
});
```

##### `captureMessage(message, level?, metadata?)`

Capture and send a message with specified severity.

```typescript
await logger.captureMessage('User logged in', 'info', { userId: '123' });
await logger.captureMessage('High memory usage', 'warning', { usage: '85%' });
```

##### `configure(config)`

Update configuration at runtime.

```typescript
logger.configure({
  enabled: false,
  environment: 'staging'
});
```

##### `setEnvironment(environment)`

Set environment override.

```typescript
logger.setEnvironment('production');
```

### Configuration Types

#### NotificationConfig

```typescript
interface NotificationConfig {
  discord?: DiscordConfig;
  slack?: SlackConfig;
  retry?: Partial<RetryPolicy>;
  sanitization?: Partial<SanitizationConfig>;
  environment?: string;
  enabled?: boolean;
}
```

#### DiscordConfig

```typescript
interface DiscordConfig {
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
}
```

#### SlackConfig

```typescript
interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
}
```

#### RetryPolicy

```typescript
interface RetryPolicy {
  maxAttempts: number;    // 1-5, default: 3
  baseDelay: number;      // milliseconds, default: 1000
  maxDelay: number;       // milliseconds, default: 10000
  jitter: boolean;        // default: true
}
```

#### SanitizationConfig

```typescript
interface SanitizationConfig {
  enabled: boolean;           // default: true
  customPatterns?: string[];  // additional patterns to sanitize
  excludeDefaults?: boolean;  // skip default patterns
}
```

## Environment Variables

### Node.js Environment

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_WEBHOOK_URL` | Discord webhook URL | `https://discord.com/api/webhooks/...` |
| `DISCORD_USERNAME` | Custom bot username | `ErrorBot` |
| `DISCORD_AVATAR_URL` | Custom bot avatar | `https://example.com/avatar.png` |
| `SLACK_WEBHOOK_URL` | Slack webhook URL | `https://hooks.slack.com/services/...` |
| `SLACK_CHANNEL` | Target channel | `#errors` |
| `SLACK_USERNAME` | Custom bot username | `ErrorBot` |
| `ERROR_LOGGER_ENABLED` | Enable/disable logging | `true` |
| `ERROR_LOGGER_ENVIRONMENT` | Environment name | `production` |

### Vite/Import.meta Environment

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_DISCORD_WEBHOOK_URL` | Discord webhook URL | `https://discord.com/api/webhooks/...` |
| `VITE_DISCORD_USERNAME` | Custom bot username | `ErrorBot` |
| `VITE_DISCORD_AVATAR_URL` | Custom bot avatar | `https://example.com/avatar.png` |
| `VITE_SLACK_WEBHOOK_URL` | Slack webhook URL | `https://hooks.slack.com/services/...` |
| `VITE_SLACK_CHANNEL` | Target channel | `#errors` |
| `VITE_SLACK_USERNAME` | Custom bot username | `ErrorBot` |
| `VITE_ERROR_LOGGER_ENABLED` | Enable/disable logging | `true` |

## Data Sanitization

The library automatically sanitizes sensitive data:

### Default Patterns

- `password`
- `token`
- `key`
- `secret`
- `auth`
- `credential`
- `api_key`
- `access_token`
- `refresh_token`

### Custom Patterns

```typescript
const logger = new ErrorLogger({
  sanitization: {
    enabled: true,
    customPatterns: ['custom_secret', 'internal_key']
  }
});
```

## Error Severity Levels

- `error` - Critical errors requiring immediate attention
- `warning` - Non-critical issues that should be monitored
- `info` - Informational messages for tracking

## Browser Support

The library automatically detects browser environment and includes:

- Current URL (`window.location.href`)
- User Agent (`navigator.userAgent`)

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run lint
```

## Development

```bash
# Build
npm run build

# Build in watch mode
npm run dev
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

- 📧 [GitHub Issues](https://github.com/lshtrade/sendErrorMessage/issues)
- 📖 [Documentation](https://github.com/lshtrade/sendErrorMessage#readme)
- 🏠 [Homepage](https://github.com/lshtrade/sendErrorMessage#readme)
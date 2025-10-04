# Quickstart Guide: Error Logger SendSMS

## Installation

```bash
npm install error-logger-sendsms
```

Or with yarn:
```bash
yarn add error-logger-sendsms
```

## Basic Usage

### Discord Only

```typescript
import { ErrorLogger } from 'error-logger-sendsms';

const logger = new ErrorLogger({
  discord: {
    webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN'
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
await logger.captureMessage('Payment failed', 'error', { orderId: 'ABC' });
```

### Slack Only

```typescript
import { ErrorLogger } from 'error-logger-sendsms';

const logger = new ErrorLogger({
  slack: {
    webhookUrl: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
    channel: '#errors',
    username: 'Error Bot'
  }
});

await logger.captureException(new Error('Database connection failed'));
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

// Sends to BOTH Discord and Slack
await logger.captureException(new Error('Critical error'));
```

## Advanced Configuration

### Custom Retry Policy

```typescript
const logger = new ErrorLogger({
  discord: { webhookUrl: '...' },
  retry: {
    maxAttempts: 5,        // Try up to 5 times
    baseDelay: 2000,       // Start with 2s delay
    maxDelay: 60000,       // Max 60s delay
    jitter: true           // Add randomization
  }
});
```

### Custom Data Sanitization

```typescript
const logger = new ErrorLogger({
  discord: { webhookUrl: '...' },
  sanitization: {
    enabled: true,
    customPatterns: [
      'credit_card',
      'ssn',
      'api_token'
    ],
    excludeDefaults: false  // Still use built-in patterns
  }
});

// This will sanitize credit_card, ssn, api_token plus default patterns
await logger.captureException(
  new Error('Payment failed'),
  { credit_card: '4111111111111111' } // Will be sanitized
);
```

### Environment-Specific Configuration

```typescript
const logger = new ErrorLogger({
  discord: { webhookUrl: '...' },
  environment: 'production'  // Manual override
});

// Or let it auto-detect from NODE_ENV, import.meta.env, or window.location
const autoLogger = new ErrorLogger({
  discord: { webhookUrl: '...' }
  // Automatically detects: development, staging, production
});
```

### Runtime Configuration Updates

```typescript
const logger = new ErrorLogger({
  discord: { webhookUrl: '...' }
});

// Disable logging temporarily
logger.configure({ enabled: false });

// Re-enable and add Slack
logger.configure({
  enabled: true,
  slack: {
    webhookUrl: '...'
  }
});

// Change environment
logger.setEnvironment('staging');
```

## React Integration Example

```typescript
import { ErrorLogger } from 'error-logger-sendsms';
import { useEffect } from 'react';

// Initialize once
const errorLogger = new ErrorLogger({
  discord: {
    webhookUrl: import.meta.env.VITE_DISCORD_WEBHOOK
  },
  slack: {
    webhookUrl: import.meta.env.VITE_SLACK_WEBHOOK
  }
});

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      errorLogger.captureException(event.error, {
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return <>{children}</>;
}

// Usage in components
function PaymentForm() {
  const handleSubmit = async (data: PaymentData) => {
    try {
      await processPayment(data);
    } catch (error) {
      await errorLogger.captureException(error, {
        paymentAmount: data.amount,
        userId: data.userId
      });
      throw error;
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Node.js/Express Integration Example

```typescript
import express from 'express';
import { ErrorLogger } from 'error-logger-sendsms';

const app = express();
const errorLogger = new ErrorLogger({
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK!
  }
});

// Error handling middleware
app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
  await errorLogger.captureException(err, {
    method: req.method,
    url: req.url,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });

  res.status(500).json({ error: 'Internal server error' });
});

// Unhandled rejection handler
process.on('unhandledRejection', async (reason: any) => {
  await errorLogger.captureException(
    new Error(`Unhandled rejection: ${reason}`),
    { reason }
  );
  process.exit(1);
});
```

## Testing Your Setup

### Quick Test

```typescript
import { ErrorLogger } from 'error-logger-sendsms';

const logger = new ErrorLogger({
  discord: { webhookUrl: 'YOUR_WEBHOOK_URL' }
});

// Test different severity levels
await logger.captureMessage('Test info message', 'info');
await logger.captureMessage('Test warning message', 'warning');
await logger.captureMessage('Test error message', 'error');

// Test exception capture
try {
  throw new Error('Test exception');
} catch (error) {
  await logger.captureException(error, {
    testRun: true,
    timestamp: new Date().toISOString()
  });
}

console.log('✅ Check your Discord/Slack channel for test notifications');
```

### Validation Checklist

- [ ] Webhook URLs are valid and active
- [ ] Test messages appear in Discord/Slack
- [ ] Error severity colors are correct (red=error, yellow=warning, blue=info)
- [ ] Stack traces are included for exceptions
- [ ] Metadata appears in notifications
- [ ] Environment is detected correctly
- [ ] Sensitive data is sanitized (test with fake password/token)
- [ ] Retry works when webhook is temporarily unavailable

## Performance Considerations

### Async Fire-and-Forget Pattern

```typescript
// Don't block on logging (fire-and-forget)
logger.captureException(error).catch(console.error);

// Or use in non-critical paths
await processUserRequest();
logger.captureMessage('Request processed', 'info'); // Fire-and-forget
```

### Rate Limiting Awareness

```typescript
// Discord: 30 requests per 60 seconds
// Slack: 1 request per second

// High-frequency logging may queue notifications
for (let i = 0; i < 100; i++) {
  // These will be rate-limited automatically
  logger.captureMessage(`Loop iteration ${i}`, 'info');
}

// Queue size: 100 per provider
// Overflow behavior: Drop oldest notifications
```

## Troubleshooting

### Notifications Not Appearing

1. Verify webhook URLs are correct and active
2. Check console for error messages
3. Test webhook URLs with curl:

```bash
# Discord
curl -X POST "YOUR_DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'

# Slack
curl -X POST "YOUR_SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message"}'
```

### Rate Limiting Issues

- Discord allows 30 requests per 60 seconds
- Slack allows 1 request per second
- Reduce logging frequency or implement client-side aggregation

### Sensitive Data Leaking

```typescript
// Verify sanitization is enabled
const logger = new ErrorLogger({
  discord: { webhookUrl: '...' },
  sanitization: {
    enabled: true,  // ← Must be true
    customPatterns: ['your_sensitive_field']
  }
});

// Test with fake data
await logger.captureMessage('Test', 'info', {
  password: 'fake123',      // Should be sanitized
  token: 'abc123xyz',        // Should be sanitized
  custom_field: 'sensitive'  // Add to customPatterns
});
```

## Next Steps

- Review [API Documentation](../README.md#api) for complete method reference
- See [Examples](../examples/) for more integration patterns
- Check [Contributing Guide](../CONTRIBUTING.md) to report issues or contribute

---

**Quickstart Complete**: You're now ready to integrate error logging into your application!

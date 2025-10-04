# Data Model: Error Logger SendSMS

## Overview
This document defines the core data structures and their relationships for the Error Logger SendSMS package. All types are defined in TypeScript for type safety and developer experience.

## Core Entities

### ErrorNotification
Represents a complete error event with all contextual information needed for debugging.

**Fields**:
- `message` (string, required): The primary error message or description
- `severity` ('error' | 'warning' | 'info', required): Error level for routing and display
- `timestamp` (string, required): ISO 8601 timestamp of when error occurred
- `stack` (string, optional): Stack trace for Error objects
- `metadata` (Record<string, any>, optional): Additional context (user ID, session, etc.)
- `environment` (string, optional): Environment where error occurred (dev/staging/prod)
- `url` (string, optional): Current URL/route when error occurred
- `userAgent` (string, optional): Browser/client user agent string

**Relationships**:
- Sent to NotificationProvider(s) based on configuration
- Processed by DataSanitizer before transmission
- Stored temporarily in RetryQueue on failure

**Validation Rules**:
- message: non-empty string, max 4000 characters (after sanitization)
- severity: must be one of ['error', 'warning', 'info']
- timestamp: valid ISO 8601 format
- metadata: serializable to JSON, max 10KB after stringification

### NotificationConfig
Configuration for the error logger including webhook URLs, retry behavior, and sanitization rules.

**Fields**:
- `discord` (object, optional):
  - `webhookUrl` (string, required): Discord webhook URL
  - `username` (string, optional): Custom bot username (default: 'Error Logger')
  - `avatarUrl` (string, optional): Custom bot avatar URL
- `slack` (object, optional):
  - `webhookUrl` (string, required): Slack incoming webhook URL
  - `channel` (string, optional): Target channel override
  - `username` (string, optional): Custom bot username (default: 'Error Logger')
- `retry` (RetryPolicy, optional): Retry configuration (uses defaults if not provided)
- `sanitization` (SanitizationConfig, optional): Data sanitization rules
- `environment` (string, optional): Manual environment override
- `enabled` (boolean, optional): Global enable/disable flag (default: true)

**Relationships**:
- Used by ErrorLogger to initialize providers
- Passed to DiscordProvider and SlackProvider
- Validated on construction and configuration updates

**Validation Rules**:
- At least one provider (discord or slack) must be configured
- Webhook URLs must be valid HTTPS URLs
- Webhook URLs must match expected patterns (Discord/Slack domains)

### RetryPolicy
Defines retry behavior for failed webhook deliveries.

**Fields**:
- `maxAttempts` (number, optional): Maximum retry attempts (default: 3, range: 1-5)
- `baseDelay` (number, optional): Initial retry delay in ms (default: 1000, range: 100-10000)
- `maxDelay` (number, optional): Maximum retry delay in ms (default: 30000, range: 1000-60000)
- `jitter` (boolean, optional): Apply jitter to prevent thundering herd (default: true)

**Relationships**:
- Used by RetryManager to schedule retry attempts
- Applied per NotificationProvider independently

**Validation Rules**:
- maxAttempts: integer between 1 and 5
- baseDelay: positive integer ≥ 100ms
- maxDelay: must be ≥ baseDelay
- Calculated delay never exceeds maxDelay

**Retry Formula**:
```
delay = min(
  baseDelay * (2 ^ attemptNumber) * (jitter ? 1 ± 0.25 : 1),
  maxDelay
)
```

### SanitizationConfig
Configuration for sensitive data removal from error notifications.

**Fields**:
- `enabled` (boolean, optional): Enable/disable sanitization (default: true)
- `customPatterns` (string[], optional): Additional regex patterns to sanitize
- `excludeDefaults` (boolean, optional): Skip default patterns (default: false)

**Default Patterns** (when excludeDefaults = false):
- Password fields: `/password|passwd|pwd/i`
- Tokens: `/token|bearer|jwt|api[_-]?key/i`
- Secrets: `/secret|private[_-]?key/i`
- Email: `/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/`
- Credit cards: `/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/`
- SSN: `/\b\d{3}-\d{2}-\d{4}\b/`

**Relationships**:
- Used by DataSanitizer to clean ErrorNotification data
- Applied before any network transmission

**Validation Rules**:
- customPatterns: valid regex strings that compile without errors
- Patterns applied in order: custom patterns first, then defaults

### RateLimitConfig (Internal)
Per-provider rate limiting configuration (not user-configurable).

**Fields**:
- `tokensPerInterval` (number): Number of tokens refilled per interval
- `interval` (number): Interval duration in milliseconds
- `maxQueueSize` (number): Maximum queued notifications before overflow
- `burstSize` (number): Maximum burst tokens (equals tokensPerInterval)

**Provider Defaults**:
- **Discord**: 30 tokens/60000ms, queue: 100, burst: 30
- **Slack**: 1 token/1000ms, queue: 100, burst: 1

**Relationships**:
- Used internally by each NotificationProvider
- Controls notification send rate
- Manages retry queue per provider

## State Transitions

### Notification Lifecycle
```
[Created] → [Sanitized] → [Queued] → [Sent] → [Acknowledged]
                            ↓
                         [Failed] → [Retry Queue] → [Retry Attempt] → [Sent]
                            ↓                            ↓
                      [Max Retries]                [Failed Again] → [Retry Queue]
                            ↓                            ↓
                        [Dropped]                  [Circuit Breaker]
```

**States**:
1. **Created**: ErrorNotification constructed from error/message
2. **Sanitized**: Sensitive data removed by DataSanitizer
3. **Queued**: Placed in rate limiter queue for sending
4. **Sent**: HTTP request dispatched to webhook
5. **Acknowledged**: 2xx response received from webhook
6. **Failed**: Non-2xx response or network error
7. **Retry Queue**: Held for exponential backoff retry
8. **Retry Attempt**: Re-sent after backoff delay
9. **Dropped**: Exceeded max retries or queue overflow
10. **Circuit Breaker**: Too many consecutive failures, provider suspended

### Configuration Updates
```
[Initial Config] → [Validated] → [Applied]
                       ↓
                  [Invalid] → [Throw Error]

[Runtime Update] → [Validated] → [Merged with Existing] → [Applied]
                       ↓
                  [Invalid] → [Throw Error, Keep Existing]
```

## Relationships Diagram

```
ErrorNotification
  ├─> DataSanitizer (processes before send)
  ├─> NotificationProvider[] (sends to configured providers)
  │   ├─> DiscordProvider (if discord config present)
  │   └─> SlackProvider (if slack config present)
  └─> RetryManager (handles failures)

NotificationConfig
  ├─> ErrorLogger (main configuration)
  ├─> RetryPolicy (retry behavior)
  ├─> SanitizationConfig (data cleaning rules)
  └─> NotificationProvider[] (provider-specific config)

RetryManager
  ├─> RetryQueue (per-provider queues)
  ├─> RetryPolicy (backoff configuration)
  └─> CircuitBreaker (failure tracking)
```

## Validation Examples

### Valid ErrorNotification
```typescript
{
  message: "Database connection failed",
  severity: "error",
  timestamp: "2025-10-04T12:34:56.789Z",
  stack: "Error: ECONNREFUSED...",
  metadata: { userId: "123", attemptCount: 3 },
  environment: "production",
  url: "/api/users"
}
```

### Valid NotificationConfig
```typescript
{
  discord: {
    webhookUrl: "https://discord.com/api/webhooks/123/abc"
  },
  slack: {
    webhookUrl: "https://hooks.slack.com/services/T00/B00/xxx",
    channel: "#errors"
  },
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000
  },
  sanitization: {
    enabled: true,
    customPatterns: ["credit_card", "api_token"]
  }
}
```

### Invalid Examples
```typescript
// Missing required fields
{ severity: "error" } // ❌ No message

// Invalid severity
{ message: "test", severity: "critical" } // ❌ Not in allowed values

// Invalid webhook URL
{ discord: { webhookUrl: "http://example.com" } } // ❌ Not HTTPS

// No providers configured
{} // ❌ Must have discord or slack

// Invalid retry config
{ retry: { maxAttempts: 10 } } // ❌ Exceeds max of 5
```

---

**Data Model Complete**: All entities defined with validation rules and relationships. Ready for contract generation.

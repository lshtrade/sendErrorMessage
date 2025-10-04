# Research Findings: Error Logger SendSMS

## Discord Webhook Integration

**Decision**: Use Discord webhook URLs with JSON payloads via HTTPS POST

**Rationale**:
- Simple, reliable integration without OAuth complexity
- Supports rich embeds with colors, fields, and formatting
- Rate limit: 30 requests per 60 seconds per webhook
- No authentication tokens required beyond webhook URL
- Supports up to 6000 characters per message

**Alternatives Considered**:
- Discord Bot API: Requires OAuth, bot tokens, and server permissions setup (too complex)
- Discord.js library: Full-featured but adds 500KB+ to package size (overkill for simple notifications)

**Implementation Notes**:
- Endpoint: `POST https://discord.com/api/webhooks/{webhook.id}/{webhook.token}`
- Content-Type: `application/json`
- Embed format for rich error display with color-coded severity

## Slack Webhook Integration

**Decision**: Use Slack incoming webhooks with JSON payloads via HTTPS POST

**Rationale**:
- Direct integration without OAuth requirements
- Supports Block Kit for rich formatting
- Rate limit: 1 request per second per webhook URL
- No workspace permissions needed (webhook URL is authorization)
- Supports thread replies for error grouping

**Alternatives Considered**:
- Slack Web API: Requires OAuth token management and workspace app installation (unnecessary complexity)
- Slack SDK (@slack/web-api): Adds ~200KB dependency and OAuth overhead (not needed for simple webhooks)

**Implementation Notes**:
- Endpoint: Custom webhook URL from Slack workspace settings
- Content-Type: `application/json`
- Block Kit layout for structured error display with metadata

## Data Sanitization Strategy

**Decision**: Regex-based pattern matching with configurable patterns and default sensitive data detection

**Rationale**:
- Fast O(n) performance with minimal overhead (<5ms for typical error messages)
- Comprehensive coverage of common patterns (passwords, tokens, keys, emails, credit cards)
- User-configurable patterns for domain-specific sensitive data
- Works across all JavaScript environments (Node.js/Browser)

**Alternatives Considered**:
- AST parsing: Too slow (>50ms) and complex for runtime sanitization
- Manual field exclusion: Incomplete coverage, requires users to know all sensitive fields
- External sanitization libraries: Adds dependencies and still requires pattern configuration

**Default Patterns**:
```
- password/passwd/pwd (case-insensitive with surrounding context)
- token/bearer/jwt/api[_-]?key
- secret/private[_-]?key
- email addresses (RFC 5322 pattern)
- Credit card numbers (basic Luhn validation)
- SSN/social security formats
- Authorization headers (Bearer, Basic)
```

## Retry Mechanism

**Decision**: Exponential backoff with jitter, max 3 attempts, circuit breaker pattern

**Rationale**:
- Prevents thundering herd problem during outages
- Jitter (±25% randomization) prevents synchronized retry storms
- Reasonable retry limit balances reliability vs. resource usage
- Circuit breaker prevents endless retry loops (open after 5 consecutive failures)
- Backoff formula: `delay = min(baseDelay * (2 ^ attempt) * (1 ± jitter), maxDelay)`

**Alternatives Considered**:
- Linear backoff: Less efficient, doesn't scale well under load
- Unlimited retries: Resource waste, memory leaks for persistent failures
- Fixed delay retry: Causes synchronized thundering herd problems

**Configuration**:
- Base delay: 1000ms (1 second)
- Max delay: 30000ms (30 seconds)
- Max attempts: 3
- Jitter: ±25%
- Circuit breaker threshold: 5 consecutive failures
- Circuit breaker reset: 60 seconds

## Environment Detection

**Decision**: Multi-source environment detection with fallback hierarchy

**Rationale**:
- Works across Node.js (process.env), Vite (import.meta.env), browser (window)
- Automatic detection reduces configuration burden
- Fallback hierarchy ensures reliability
- Supports custom environment override via configuration

**Detection Hierarchy** (first match wins):
1. Explicit config.environment (user override)
2. process.env.NODE_ENV (Node.js)
3. import.meta.env.MODE (Vite/ES modules)
4. window.location.hostname (browser - dev/staging/production domains)
5. Default: 'development'

**Alternatives Considered**:
- Single source (process.env only): Fails in browser environments
- Manual configuration only: Places burden on users, error-prone
- User-agent detection: Unreliable, doesn't indicate environment

**Implementation Notes**:
- Detect common patterns: development, staging, production, test
- Support custom environment names
- Include environment in all notifications for debugging context

## Rate Limiting Strategy (FR-011 Clarification)

**Decision**: Per-channel token bucket rate limiter with queue overflow handling

**Rationale**:
- Respects Discord (30 req/60s) and Slack (1 req/s) rate limits
- Token bucket allows burst handling with controlled sustained rate
- Queue overflow prevents memory leaks during sustained high load
- Per-channel limiting prevents one channel from affecting others

**Configuration**:
- Discord: 30 tokens, refill 30 per 60 seconds
- Slack: 1 token, refill 1 per second
- Queue size: 100 notifications per channel
- Overflow behavior: Drop oldest notifications, log warning

**Alternatives Considered**:
- No rate limiting: Risks webhook URL invalidation from API abuse
- Global rate limiting: One channel's traffic affects all channels
- Fixed delay between requests: Wastes time when under limit

## In-Memory Data Retention (FR-012 Clarification)

**Decision**: No persistent storage - immediate send with retry queue only

**Rationale**:
- Aligns with "database-free" requirement
- Retry queue holds failed notifications temporarily (max 5 minutes or 3 retries)
- Memory bounded by queue size (100 notifications * ~2KB = ~200KB max per channel)
- Circuit breaker prevents infinite accumulation

**Retention Rules**:
- Successful send: Remove from memory immediately
- Failed send: Hold in retry queue with exponential backoff
- Max retry duration: 5 minutes (1s + 2s + 4s + cleanup time)
- Queue overflow: Drop oldest failed notifications (FIFO)
- Circuit open: Drop all new notifications, log warning

**Alternatives Considered**:
- LocalStorage persistence: Adds complexity, not available in Node.js
- Longer retention: Memory leak risk, violates "lightweight" requirement
- Disk-based queue: Contradicts "database-free" principle

---

**Research Complete**: All technical unknowns resolved. Ready for Phase 1 design artifacts.

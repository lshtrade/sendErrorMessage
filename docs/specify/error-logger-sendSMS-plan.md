# Implementation Plan: Error Logger SendSMS

**Branch**: `001-error-logger-sendSMS` | **Date**: 2024-12-19 | **Spec**: [error-logger-sendSMS-feature.md](./error-logger-sendSMS-feature.md)
**Input**: Feature specification from `/docs/error-logger-sendSMS-feature.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type: npm package (single)
   → Set Structure Decision: Single project structure
3. Fill the Constitution Check section based on the content of the constitution document
4. Evaluate Constitution Check section below
   → All checks pass: No violations detected
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → All NEEDS CLARIFICATION resolved
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
7. Re-evaluate Constitution Check section
   → No new violations: Design maintains constitutional principles
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Create a lightweight npm package that provides Sentry-style error logging with direct Discord/Slack notifications, eliminating database dependencies while maintaining robust error handling and notification delivery.

## Technical Context
**Language/Version**: TypeScript 5.0+  
**Primary Dependencies**: axios (HTTP client), @types/node (Node.js types)  
**Storage**: N/A (in-memory only, no persistence)  
**Testing**: Vitest (unit tests), Jest (integration tests)  
**Target Platform**: Node.js 16+, Browser (ES modules)  
**Project Type**: single (npm package)  
**Performance Goals**: <5s notification delivery, <100ms initialization time  
**Constraints**: <10MB package size, zero database dependencies, <200ms API response time  
**Scale/Scope**: 1000 notifications/minute, single application instance

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Reliability First
- [x] All error handling paths include fallback mechanisms (retry with exponential backoff)
- [x] No silent failures in critical code paths (all errors logged to console as fallback)
- [x] Graceful degradation strategy documented (fallback to console logging when webhooks fail)

### Privacy by Design
- [x] Sensitive data sanitization identified and implemented (automatic PII/token removal)
- [x] No PII, passwords, or tokens in logs (sanitization utility)
- [x] Data handling reviewed for compliance (no data persistence, webhook-only transmission)

### Test-First Development
- [x] Tests written before implementation (TDD approach)
- [x] TDD cycle enforced (Red-Green-Refactor)
- [x] Code coverage target: 85%+

### Minimal Configuration
- [x] Sensible defaults provided for all options (environment detection, retry policies)
- [x] New config options justified or eliminated (only essential configuration exposed)
- [x] API simplicity validated (Sentry-like API for familiarity)

### Performance Conscious
- [x] Latency requirements specified (<5s notification delivery)
- [x] Memory footprint considered (<10MB package size)
- [x] Performance benchmarks planned (notification delivery time, initialization time)

## Project Structure

### Documentation (this feature)
```
docs/
├── error-logger-sendSMS-feature.md    # Feature specification
└── error-logger-sendSMS-plan.md       # This file (/plan command output)
```

### Source Code (repository root)
```
error-logger-sendSMS/
├── src/
│   ├── index.ts                       # Main ErrorLogger class
│   ├── providers/
│   │   ├── discord-provider.ts        # Discord webhook implementation
│   │   ├── slack-provider.ts          # Slack webhook implementation
│   │   └── base-provider.ts           # Abstract base provider
│   ├── config/
│   │   ├── config-manager.ts          # Configuration management
│   │   └── environment-detector.ts   # Environment detection
│   ├── utils/
│   │   ├── data-sanitizer.ts          # Sensitive data removal
│   │   ├── retry-manager.ts           # Exponential backoff retry
│   │   └── message-formatter.ts       # Discord/Slack message formatting
│   └── types/
│       └── index.ts                   # TypeScript definitions
├── tests/
│   ├── unit/                          # Unit tests
│   ├── integration/                   # Integration tests
│   └── fixtures/                      # Test data
├── examples/
│   ├── basic-usage.ts                 # Basic usage example
│   ├── advanced-config.ts             # Advanced configuration
│   └── react-integration.tsx          # React integration example
├── dist/                              # Compiled output
├── package.json                       # Package configuration
├── tsconfig.json                      # TypeScript configuration
├── vitest.config.ts                   # Test configuration
└── README.md                          # Package documentation
```

**Structure Decision**: Single project structure chosen for npm package simplicity. All source code in `src/` with clear separation of concerns through subdirectories for providers, configuration, and utilities.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Discord webhook API best practices and rate limits
   - Slack webhook API best practices and rate limits
   - Data sanitization patterns for error messages
   - Retry strategies for webhook failures
   - Environment detection in Node.js and browser contexts

2. **Generate and dispatch research agents**:
   ```
   Task: "Research Discord webhook API for error notifications"
   Task: "Research Slack webhook API for error notifications"
   Task: "Find best practices for data sanitization in error logging"
   Task: "Research exponential backoff retry patterns for webhooks"
   Task: "Find environment detection patterns for Node.js/browser"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technical decisions documented

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - ErrorNotification: message, severity, timestamp, stack, metadata
   - NotificationConfig: webhook URLs, formatting options, retry settings
   - RetryPolicy: max attempts, backoff strategy, failure handling

2. **Generate API contracts** from functional requirements:
   - ErrorLogger.captureException() → Discord/Slack webhook calls
   - ErrorLogger.captureMessage() → Discord/Slack webhook calls
   - Configuration management → Environment-based config loading
   - Output TypeScript interfaces to `/types/`

3. **Generate contract tests** from contracts:
   - ErrorLogger initialization tests
   - Notification delivery tests
   - Configuration validation tests
   - Retry mechanism tests

4. **Extract test scenarios** from user stories:
   - Error notification delivery → Integration test scenarios
   - Configuration management → Unit test scenarios
   - Retry mechanism → Integration test scenarios

5. **Update agent file incrementally**:
   - Add TypeScript, Node.js, webhook integration context
   - Include Discord/Slack API patterns
   - Add error logging and notification patterns

**Output**: data-model.md, TypeScript interfaces, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each provider → provider implementation task [P]
- Each utility → utility implementation task [P]
- Each configuration → configuration task [P]
- Integration tests for end-to-end scenarios
- Documentation and examples

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: Types → Utils → Providers → Main class
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No violations detected - all constitutional principles maintained.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

## Research Findings

### Discord Webhook Integration
**Decision**: Use Discord webhook URLs with JSON payloads
**Rationale**: Simple, reliable, no authentication complexity
**Alternatives considered**: Discord Bot API (requires OAuth), Discord.js (overkill for simple notifications)

### Slack Webhook Integration  
**Decision**: Use Slack incoming webhooks with JSON payloads
**Rationale**: Direct integration, no OAuth required, supports rich formatting
**Alternatives considered**: Slack Web API (requires OAuth), Slack SDK (unnecessary complexity)

### Data Sanitization Strategy
**Decision**: Regex-based pattern matching for common sensitive data
**Rationale**: Fast, comprehensive coverage of common patterns
**Alternatives considered**: AST parsing (too complex), manual field exclusion (incomplete)

### Retry Mechanism
**Decision**: Exponential backoff with jitter, max 3 attempts
**Rationale**: Prevents thundering herd, reasonable retry limit
**Alternatives considered**: Linear backoff (less efficient), unlimited retries (resource waste)

### Environment Detection
**Decision**: Multi-source environment detection (process.env, import.meta.env, window.location)
**Rationale**: Works across Node.js and browser environments
**Alternatives considered**: Single source detection (less reliable), manual configuration (user burden)

---

## Data Model

### ErrorNotification
```typescript
interface ErrorNotification {
  message: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: string;
  stack?: string;
  metadata?: Record<string, any>;
  environment?: string;
  url?: string;
  userAgent?: string;
}
```

### NotificationConfig
```typescript
interface NotificationConfig {
  discord?: {
    webhookUrl: string;
    username?: string;
    avatarUrl?: string;
  };
  slack?: {
    webhookUrl: string;
    channel?: string;
    username?: string;
  };
  retry?: {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
  };
  sanitization?: {
    enabled: boolean;
    patterns: string[];
  };
}
```

### RetryPolicy
```typescript
interface RetryPolicy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}
```

---

## API Contracts

### ErrorLogger Class
```typescript
class ErrorLogger {
  constructor(config?: Partial<NotificationConfig>);
  captureException(error: Error | string, metadata?: Record<string, any>): Promise<void>;
  captureMessage(message: string, level?: 'error' | 'warning' | 'info', metadata?: Record<string, any>): Promise<void>;
  configure(config: Partial<NotificationConfig>): void;
  setEnvironment(environment: string): void;
}
```

### Provider Interface
```typescript
interface NotificationProvider {
  send(notification: ErrorNotification): Promise<void>;
  validateConfig(config: any): boolean;
}
```

---

## Quickstart Guide

### Installation
```bash
npm install error-logger-sendSMS
```

### Basic Usage
```typescript
import { ErrorLogger } from 'error-logger-sendSMS';

const logger = new ErrorLogger({
  discord: {
    webhookUrl: 'https://discord.com/api/webhooks/...'
  }
});

// Capture exceptions
try {
  // ... code that might throw
} catch (error) {
  await logger.captureException(error);
}

// Capture messages
await logger.captureMessage('Application started', 'info');
```

### Advanced Configuration
```typescript
const logger = new ErrorLogger({
  discord: {
    webhookUrl: 'https://discord.com/api/webhooks/...',
    username: 'Error Bot',
    avatarUrl: 'https://example.com/avatar.png'
  },
  slack: {
    webhookUrl: 'https://hooks.slack.com/services/...',
    channel: '#alerts',
    username: 'Error Monitor'
  },
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000
  },
  sanitization: {
    enabled: true,
    patterns: ['password', 'token', 'key', 'secret']
  }
});
```

---

*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*

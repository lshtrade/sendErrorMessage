# Tasks: Error Logger SendSMS

**Input**: Design documents from `/Users/sanghee/Desktop/project2/sendErrorMessage/specs/001-users-desktop/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/types.ts, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Tech stack: TypeScript 5.0+, axios, Vitest
   → ✅ Extract: Types, Utils, Providers, Main class structure
2. Load design documents:
   → ✅ data-model.md: ErrorNotification, NotificationConfig, RetryPolicy, SanitizationConfig
   → ✅ contracts/types.ts: TypeScript interfaces for API
   → ✅ quickstart.md: Integration test scenarios
3. Generate tasks by category:
   → ✅ Setup: project init, dependencies, linting
   → ✅ Tests: contract tests, integration tests
   → ✅ Core: types, utils, providers, main class
   → ✅ Integration: Error handling, retry logic
   → ✅ Polish: unit tests, performance, docs
4. Apply task rules:
   → ✅ Different files = mark [P] for parallel
   → ✅ Same file = sequential (no [P])
   → ✅ Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Project root**: `error-logger-sendSMS/`
- **Source**: `error-logger-sendSMS/src/`
- **Tests**: `error-logger-sendSMS/tests/`

## Phase 3.1: Setup

- [x] T001 Create npm package structure with error-logger-sendSMS directory
- [x] T002 Initialize TypeScript project with tsconfig.json (strict mode, ES modules, Node.js 16+ target)
- [x] T003 [P] Configure package.json with dependencies (axios, @types/node) and devDependencies (typescript, vitest)
- [x] T004 [P] Configure vitest.config.ts for unit and integration tests
- [x] T005 [P] Create .gitignore (node_modules, dist, coverage)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Type Contract Tests
- [x] T006 [P] Contract test for ErrorNotification interface in tests/contract/error-notification.test.ts
- [x] T007 [P] Contract test for NotificationConfig interface in tests/contract/notification-config.test.ts
- [x] T008 [P] Contract test for RetryPolicy interface in tests/contract/retry-policy.test.ts
- [x] T009 [P] Contract test for SanitizationConfig interface in tests/contract/sanitization-config.test.ts

### Utility Tests
- [x] T010 [P] Unit test for DataSanitizer in tests/unit/data-sanitizer.test.ts
- [x] T011 [P] Unit test for RetryManager in tests/unit/retry-manager.test.ts
- [ ] T012 [P] Unit test for MessageFormatter in tests/unit/message-formatter.test.ts
- [ ] T013 [P] Unit test for EnvironmentDetector in tests/unit/environment-detector.test.ts
- [ ] T014 [P] Unit test for ConfigManager in tests/unit/config-manager.test.ts

### Provider Tests
- [ ] T015 [P] Contract test for BaseProvider in tests/contract/base-provider.test.ts
- [ ] T016 [P] Contract test for DiscordProvider in tests/contract/discord-provider.test.ts
- [ ] T017 [P] Contract test for SlackProvider in tests/contract/slack-provider.test.ts

### Integration Tests
- [ ] T018 [P] Integration test for Discord webhook delivery in tests/integration/discord-delivery.test.ts
- [ ] T019 [P] Integration test for Slack webhook delivery in tests/integration/slack-delivery.test.ts
- [ ] T020 [P] Integration test for multi-channel routing in tests/integration/multi-channel.test.ts
- [ ] T021 [P] Integration test for retry mechanism in tests/integration/retry-mechanism.test.ts
- [ ] T022 [P] Integration test for data sanitization in tests/integration/sanitization.test.ts
- [ ] T023 [P] Integration test for environment detection in tests/integration/environment.test.ts

### Main Class Tests
- [ ] T024 Contract test for ErrorLogger class in tests/contract/error-logger.test.ts
- [ ] T025 Integration test for ErrorLogger.captureException() in tests/integration/capture-exception.test.ts
- [ ] T026 Integration test for ErrorLogger.captureMessage() in tests/integration/capture-message.test.ts
- [ ] T027 Integration test for ErrorLogger.configure() in tests/integration/runtime-config.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Type Definitions
- [x] T028 TypeScript type definitions in src/types/index.ts (ErrorNotification, NotificationConfig, RetryPolicy, SanitizationConfig, ErrorSeverity)

### Utility Implementations
- [x] T029 [P] DataSanitizer implementation in src/utils/data-sanitizer.ts
- [x] T030 [P] RetryManager implementation in src/utils/retry-manager.ts
- [x] T031 [P] MessageFormatter implementation in src/utils/message-formatter.ts

### Configuration Implementations
- [x] T032 [P] EnvironmentDetector implementation in src/config/environment-detector.ts
- [x] T033 ConfigManager implementation in src/config/config-manager.ts (depends on EnvironmentDetector)

### Provider Implementations
- [x] T034 BaseProvider abstract class in src/providers/base-provider.ts
- [x] T035 [P] DiscordProvider implementation in src/providers/discord-provider.ts (extends BaseProvider, uses MessageFormatter, RetryManager)
- [x] T036 [P] SlackProvider implementation in src/providers/slack-provider.ts (extends BaseProvider, uses MessageFormatter, RetryManager)

### Main Class Implementation
- [x] T037 ErrorLogger class in src/index.ts (uses all providers, ConfigManager, DataSanitizer)

## Phase 3.4: Integration

- [ ] T038 Connect ErrorLogger to providers with rate limiting
- [ ] T039 Implement fallback to console logging when webhooks fail
- [ ] T040 Add circuit breaker pattern for provider failures
- [ ] T041 Implement error context capture (URL, userAgent, environment)

## Phase 3.5: Polish

- [ ] T042 [P] Performance test for notification delivery (<5s) in tests/performance/delivery-speed.test.ts
- [ ] T043 [P] Performance test for initialization time (<100ms) in tests/performance/init-time.test.ts
- [ ] T044 [P] Performance test for package size (<10MB) in tests/performance/package-size.test.ts
- [ ] T045 Verify code coverage ≥85% with vitest --coverage
- [ ] T046 Review error handling fallback mechanisms (console logs, circuit breaker)
- [ ] T047 [P] Create example: basic-usage.ts in examples/
- [ ] T048 [P] Create example: advanced-config.ts in examples/
- [ ] T049 [P] Create example: react-integration.tsx in examples/
- [ ] T050 [P] Create example: express-integration.ts in examples/
- [x] T051 [P] Update README.md with installation, API docs, examples
- [ ] T052 [P] Create CHANGELOG.md for version 1.0.0
- [x] T053 Build package with TypeScript compiler (npm run build)
- [x] T054 Run all tests and ensure 100% pass rate (npm test)

## Dependencies

**Setup Phase (T001-T005)**:
- All setup tasks must complete before any other work

**Test Phase (T006-T027)**:
- Must complete BEFORE implementation phase
- All marked [P] can run in parallel
- T024 depends on T006-T023 (needs all contract interfaces tested first)

**Implementation Phase (T028-T037)**:
- T028 (types) blocks all implementation tasks
- T029-T031 (utils) are parallel [P]
- T032 blocks T033 (ConfigManager needs EnvironmentDetector)
- T034 (BaseProvider) blocks T035-T036 (providers extend BaseProvider)
- T035-T036 depend on T029-T031 (providers use utils)
- T037 depends on T033-T036 (ErrorLogger uses all components)

**Integration Phase (T038-T041)**:
- All depend on T037 (ErrorLogger must exist)
- Sequential (modify same ErrorLogger class)

**Polish Phase (T042-T054)**:
- T042-T044 are parallel performance tests [P]
- T045 requires all code complete
- T046 requires all integration complete
- T047-T050 are parallel examples [P]
- T051-T052 are parallel docs [P]
- T053 depends on T045 (build after coverage check)
- T054 is final validation

## Parallel Example

### Launch Contract Tests Together (T006-T009):
```
Task: "Contract test for ErrorNotification interface in tests/contract/error-notification.test.ts"
Task: "Contract test for NotificationConfig interface in tests/contract/notification-config.test.ts"
Task: "Contract test for RetryPolicy interface in tests/contract/retry-policy.test.ts"
Task: "Contract test for SanitizationConfig interface in tests/contract/sanitization-config.test.ts"
```

### Launch Utility Tests Together (T010-T014):
```
Task: "Unit test for DataSanitizer in tests/unit/data-sanitizer.test.ts"
Task: "Unit test for RetryManager in tests/unit/retry-manager.test.ts"
Task: "Unit test for MessageFormatter in tests/unit/message-formatter.test.ts"
Task: "Unit test for EnvironmentDetector in tests/unit/environment-detector.test.ts"
Task: "Unit test for ConfigManager in tests/unit/config-manager.test.ts"
```

### Launch Utility Implementations Together (T029-T031):
```
Task: "DataSanitizer implementation in src/utils/data-sanitizer.ts"
Task: "RetryManager implementation in src/utils/retry-manager.ts"
Task: "MessageFormatter implementation in src/utils/message-formatter.ts"
```

### Launch Provider Implementations Together (T035-T036):
```
Task: "DiscordProvider implementation in src/providers/discord-provider.ts"
Task: "SlackProvider implementation in src/providers/slack-provider.ts"
```

### Launch Examples Together (T047-T050):
```
Task: "Create example: basic-usage.ts in examples/"
Task: "Create example: advanced-config.ts in examples/"
Task: "Create example: react-integration.tsx in examples/"
Task: "Create example: express-integration.ts in examples/"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task or logical group
- Avoid: vague tasks, same file conflicts
- Constitutional requirements:
  - Tests before implementation (TDD)
  - 85%+ code coverage (T045)
  - Performance benchmarks (T042-T044)
  - Data sanitization (T010, T022, T029)
  - Error handling fallbacks (T039, T040, T046)

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each interface → contract test task [P]
   - ErrorLogger interface → implementation task

2. **From Data Model**:
   - Each entity (ErrorNotification, NotificationConfig, etc.) → type definition task
   - Each utility relationship → utility implementation task [P]
   - Provider relationships → provider tasks [P]

3. **From Quickstart**:
   - Basic usage → integration test scenario
   - Advanced config → runtime config test
   - React integration → example file
   - Express integration → example file

4. **Ordering**:
   - Setup → Tests → Types → Utils → Providers → Main → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T006-T009, T015-T017, T024)
- [x] All entities have type definition tasks (T028)
- [x] All tests come before implementation (T006-T027 before T028-T037)
- [x] Parallel tasks truly independent (all [P] tasks in different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Error handling and fallback mechanisms included (T039, T040, T046)
- [x] Performance validation tasks present (T042-T044)
- [x] Code coverage target task included (T045, ≥85%)
- [x] Privacy/sanitization tasks added (T010, T022, T029)
- [x] Constitutional principles enforced throughout task list

---

**Tasks Complete**: 54 tasks generated, ready for TDD execution. Estimated completion: 20-25 hours.

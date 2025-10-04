/**
 * Core type definitions for Error Logger SendSMS
 * These contracts define the public API surface and data structures
 */

/**
 * Error severity levels for routing and display
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Complete error notification with context
 */
export interface ErrorNotification {
  /** Primary error message */
  message: string;

  /** Error severity level */
  severity: ErrorSeverity;

  /** ISO 8601 timestamp */
  timestamp: string;

  /** Stack trace (for Error objects) */
  stack?: string;

  /** Additional context metadata */
  metadata?: Record<string, any>;

  /** Environment (development/staging/production) */
  environment?: string;

  /** Current URL/route */
  url?: string;

  /** Browser/client user agent */
  userAgent?: string;
}

/**
 * Retry policy configuration
 */
export interface RetryPolicy {
  /** Maximum retry attempts (1-5) */
  maxAttempts: number;

  /** Initial retry delay in milliseconds */
  baseDelay: number;

  /** Maximum retry delay in milliseconds */
  maxDelay: number;

  /** Apply jitter to prevent thundering herd */
  jitter: boolean;
}

/**
 * Data sanitization configuration
 */
export interface SanitizationConfig {
  /** Enable/disable sanitization */
  enabled: boolean;

  /** Additional regex patterns to sanitize */
  customPatterns?: string[];

  /** Skip default patterns */
  excludeDefaults?: boolean;
}

/**
 * Discord provider configuration
 */
export interface DiscordConfig {
  /** Discord webhook URL */
  webhookUrl: string;

  /** Custom bot username */
  username?: string;

  /** Custom bot avatar URL */
  avatarUrl?: string;
}

/**
 * Slack provider configuration
 */
export interface SlackConfig {
  /** Slack incoming webhook URL */
  webhookUrl: string;

  /** Target channel override */
  channel?: string;

  /** Custom bot username */
  username?: string;
}

/**
 * Complete error logger configuration
 */
export interface NotificationConfig {
  /** Discord webhook configuration */
  discord?: DiscordConfig;

  /** Slack webhook configuration */
  slack?: SlackConfig;

  /** Retry policy (defaults provided) */
  retry?: Partial<RetryPolicy>;

  /** Sanitization rules (defaults provided) */
  sanitization?: Partial<SanitizationConfig>;

  /** Manual environment override */
  environment?: string;

  /** Global enable/disable flag */
  enabled?: boolean;
}

/**
 * Notification provider interface
 * Implemented by DiscordProvider and SlackProvider
 */
export interface NotificationProvider {
  /**
   * Send error notification to provider
   * @throws {Error} If webhook request fails after retries
   */
  send(notification: ErrorNotification): Promise<void>;

  /**
   * Validate provider configuration
   * @returns true if configuration is valid
   */
  validateConfig(): boolean;

  /**
   * Get provider name for logging
   */
  getName(): string;
}

/**
 * Main ErrorLogger class contract
 */
export interface IErrorLogger {
  /**
   * Capture and send an exception
   * @param error - Error object or error message string
   * @param metadata - Additional context metadata
   */
  captureException(
    error: Error | string,
    metadata?: Record<string, any>
  ): Promise<void>;

  /**
   * Capture and send a message
   * @param message - Message content
   * @param level - Severity level
   * @param metadata - Additional context metadata
   */
  captureMessage(
    message: string,
    level?: ErrorSeverity,
    metadata?: Record<string, any>
  ): Promise<void>;

  /**
   * Update configuration at runtime
   * @param config - Partial configuration to merge
   */
  configure(config: Partial<NotificationConfig>): void;

  /**
   * Set environment override
   * @param environment - Environment name
   */
  setEnvironment(environment: string): void;
}

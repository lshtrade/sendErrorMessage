import type { NotificationConfig, RetryPolicy, SanitizationConfig } from '../types/index.js';
import { EnvironmentDetector } from './environment-detector.js';

export class ConfigManager {
  private config: NotificationConfig;
  private environmentDetector: EnvironmentDetector;

  constructor(initialConfig: Partial<NotificationConfig> = {}) {
    this.environmentDetector = new EnvironmentDetector();

    // Merge with defaults
    this.config = {
      enabled: initialConfig.enabled ?? true,
      environment: initialConfig.environment || this.environmentDetector.detect(),
      discord: initialConfig.discord,
      slack: initialConfig.slack,
      retry: this.mergeRetryPolicy(initialConfig.retry),
      sanitization: this.mergeSanitizationConfig(initialConfig.sanitization)
    };

    this.validate();
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<NotificationConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      retry: updates.retry
        ? this.mergeRetryPolicy({ ...this.config.retry, ...updates.retry })
        : this.config.retry,
      sanitization: updates.sanitization
        ? this.mergeSanitizationConfig({ ...this.config.sanitization, ...updates.sanitization })
        : this.config.sanitization
    };

    this.validate();
  }

  setEnvironment(environment: string): void {
    this.config.environment = environment;
  }

  private mergeRetryPolicy(partial?: Partial<RetryPolicy>): RetryPolicy {
    return {
      maxAttempts: partial?.maxAttempts ?? 3,
      baseDelay: partial?.baseDelay ?? 1000,
      maxDelay: partial?.maxDelay ?? 30000,
      jitter: partial?.jitter ?? true
    };
  }

  private mergeSanitizationConfig(partial?: Partial<SanitizationConfig>): SanitizationConfig {
    return {
      enabled: partial?.enabled ?? true,
      customPatterns: partial?.customPatterns,
      excludeDefaults: partial?.excludeDefaults ?? false
    };
  }

  private validate(): void {
    // At least one provider must be configured
    if (!this.config.discord && !this.config.slack) {
      throw new Error('At least one provider (discord or slack) must be configured');
    }

    // Validate Discord webhook URL
    if (this.config.discord?.webhookUrl) {
      const discordUrl = this.config.discord.webhookUrl;
      if (!discordUrl.startsWith('https://')) {
        throw new Error('Discord webhook URL must use HTTPS');
      }
      if (!discordUrl.includes('discord.com')) {
        throw new Error('Invalid Discord webhook URL');
      }
    }

    // Validate Slack webhook URL
    if (this.config.slack?.webhookUrl) {
      const slackUrl = this.config.slack.webhookUrl;
      if (!slackUrl.startsWith('https://')) {
        throw new Error('Slack webhook URL must use HTTPS');
      }
      if (!slackUrl.includes('slack.com')) {
        throw new Error('Invalid Slack webhook URL');
      }
    }

    // Validate retry policy
    const retry = this.config.retry;
    if (retry && retry.maxAttempts !== undefined && retry.baseDelay !== undefined && retry.maxDelay !== undefined) {
      if (retry.maxAttempts < 1 || retry.maxAttempts > 5) {
        throw new Error('maxAttempts must be between 1 and 5');
      }
      if (retry.baseDelay < 100) {
        throw new Error('baseDelay must be at least 100ms');
      }
      if (retry.maxDelay < retry.baseDelay) {
        throw new Error('maxDelay must be greater than or equal to baseDelay');
      }
    }
  }
}

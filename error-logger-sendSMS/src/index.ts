import type {
  NotificationConfig,
  ErrorNotification,
  ErrorSeverity,
  IErrorLogger,
  NotificationProvider
} from './types/index.js';
import { ConfigManager } from './config/config-manager.js';
import { DataSanitizer } from './utils/data-sanitizer.js';
import { RetryManager } from './utils/retry-manager.js';
import { DiscordProvider } from './providers/discord-provider.js';
import { SlackProvider } from './providers/slack-provider.js';

export class ErrorLogger implements IErrorLogger {
  private configManager: ConfigManager;
  private sanitizer: DataSanitizer;
  private providers: NotificationProvider[] = [];

  constructor(config: Partial<NotificationConfig> = {}) {
    // Merge environment variables with provided config
    const envConfig = this.loadFromEnvironment();
    const mergedConfig = this.mergeConfigs(envConfig, config);

    this.configManager = new ConfigManager(mergedConfig);
    const currentConfig = this.configManager.getConfig();

    this.sanitizer = new DataSanitizer(currentConfig.sanitization);

    // Initialize providers
    this.initializeProviders(currentConfig);
  }

  private initializeProviders(config: NotificationConfig): void {
    this.providers = [];

    const retryManager = new RetryManager(config.retry);

    if (config.discord) {
      this.providers.push(new DiscordProvider(config.discord, retryManager));
    }

    if (config.slack) {
      this.providers.push(new SlackProvider(config.slack, retryManager));
    }
  }

  async captureException(
    error: Error | string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    const notification: ErrorNotification = {
      message: errorObj.message,
      severity: 'error',
      timestamp: new Date().toISOString(),
      stack: errorObj.stack,
      metadata: metadata,
      environment: this.configManager.getConfig().environment
    };

    // Add context if available (browser environment)
    if (typeof globalThis !== 'undefined' && (globalThis as any).window) {
      notification.url = (globalThis as any).window.location?.href;
      notification.userAgent = (globalThis as any).navigator?.userAgent;
    }

    await this.sendNotification(notification);
  }

  async captureMessage(
    message: string,
    level: ErrorSeverity = 'info',
    metadata?: Record<string, any>
  ): Promise<void> {
    const notification: ErrorNotification = {
      message,
      severity: level,
      timestamp: new Date().toISOString(),
      metadata,
      environment: this.configManager.getConfig().environment
    };

    // Add context if available (browser environment)
    if (typeof globalThis !== 'undefined' && (globalThis as any).window) {
      notification.url = (globalThis as any).window.location?.href;
      notification.userAgent = (globalThis as any).navigator?.userAgent;
    }

    await this.sendNotification(notification);
  }

  configure(config: Partial<NotificationConfig>): void {
    this.configManager.updateConfig(config);
    const currentConfig = this.configManager.getConfig();

    // Reinitialize sanitizer and providers with new config
    this.sanitizer = new DataSanitizer(currentConfig.sanitization);
    this.initializeProviders(currentConfig);
  }

  setEnvironment(environment: string): void {
    this.configManager.setEnvironment(environment);
  }

  private async sendNotification(notification: ErrorNotification): Promise<void> {
    const config = this.configManager.getConfig();

    // Check if logging is enabled
    if (!config.enabled) {
      return;
    }

    // Sanitize notification data
    const sanitizedNotification = this.sanitizer.sanitize(notification) as ErrorNotification;

    // Send to all configured providers
    const sendPromises = this.providers.map(async (provider) => {
      try {
        await provider.send(sanitizedNotification);
      } catch (error) {
        console.error(`[${provider.getName()}] Failed to send notification:`, error);
        // Don't throw - allow other providers to try
      }
    });

    await Promise.allSettled(sendPromises);
  }

  /**
   * Load configuration from environment variables
   * Supports: DISCORD_WEBHOOK_URL, SLACK_WEBHOOK_URL, ERROR_LOGGER_ENABLED
   */
  private loadFromEnvironment(): Partial<NotificationConfig> {
    const config: Partial<NotificationConfig> = {};

    // Check for Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      // Discord configuration
      if (process.env.DISCORD_WEBHOOK_URL) {
        config.discord = {
          webhookUrl: process.env.DISCORD_WEBHOOK_URL,
          username: process.env.DISCORD_USERNAME,
          avatarUrl: process.env.DISCORD_AVATAR_URL
        };
      }

      // Slack configuration
      if (process.env.SLACK_WEBHOOK_URL) {
        config.slack = {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.SLACK_CHANNEL,
          username: process.env.SLACK_USERNAME
        };
      }

      // Global settings
      if (process.env.ERROR_LOGGER_ENABLED !== undefined) {
        config.enabled = process.env.ERROR_LOGGER_ENABLED === 'true';
      }

      if (process.env.ERROR_LOGGER_ENVIRONMENT) {
        config.environment = process.env.ERROR_LOGGER_ENVIRONMENT;
      }
    }

    // Check for Vite/import.meta.env
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const env = (import.meta as any).env;

      if (env.VITE_DISCORD_WEBHOOK_URL && !config.discord) {
        config.discord = {
          webhookUrl: env.VITE_DISCORD_WEBHOOK_URL,
          username: env.VITE_DISCORD_USERNAME,
          avatarUrl: env.VITE_DISCORD_AVATAR_URL
        };
      }

      if (env.VITE_SLACK_WEBHOOK_URL && !config.slack) {
        config.slack = {
          webhookUrl: env.VITE_SLACK_WEBHOOK_URL,
          channel: env.VITE_SLACK_CHANNEL,
          username: env.VITE_SLACK_USERNAME
        };
      }

      if (env.VITE_ERROR_LOGGER_ENABLED !== undefined && config.enabled === undefined) {
        config.enabled = env.VITE_ERROR_LOGGER_ENABLED === 'true';
      }
    }

    return config;
  }

  /**
   * Merge environment config with user-provided config
   * User-provided config takes precedence
   */
  private mergeConfigs(
    envConfig: Partial<NotificationConfig>,
    userConfig: Partial<NotificationConfig>
  ): Partial<NotificationConfig> {
    return {
      discord: userConfig.discord || envConfig.discord,
      slack: userConfig.slack || envConfig.slack,
      enabled: userConfig.enabled !== undefined ? userConfig.enabled : envConfig.enabled,
      environment: userConfig.environment || envConfig.environment,
      retry: userConfig.retry,
      sanitization: userConfig.sanitization
    };
  }
}

// Export types
export type {
  NotificationConfig,
  ErrorNotification,
  ErrorSeverity,
  IErrorLogger,
  NotificationProvider,
  DiscordConfig,
  SlackConfig,
  RetryPolicy,
  SanitizationConfig
} from './types/index.js';

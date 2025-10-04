import { describe, it, expect } from 'vitest';
import type { NotificationConfig, DiscordConfig, SlackConfig } from '../../src/types/index.js';

describe('NotificationConfig Contract', () => {
  it('should accept Discord-only configuration', () => {
    const config: NotificationConfig = {
      discord: {
        webhookUrl: 'https://discord.com/api/webhooks/123/abc'
      }
    };

    expect(config.discord).toBeDefined();
    expect(config.discord?.webhookUrl).toContain('discord.com');
  });

  it('should accept Slack-only configuration', () => {
    const config: NotificationConfig = {
      slack: {
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx'
      }
    };

    expect(config.slack).toBeDefined();
    expect(config.slack?.webhookUrl).toContain('slack.com');
  });

  it('should accept both Discord and Slack configuration', () => {
    const config: NotificationConfig = {
      discord: {
        webhookUrl: 'https://discord.com/api/webhooks/123/abc',
        username: 'Error Bot',
        avatarUrl: 'https://example.com/avatar.png'
      },
      slack: {
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        channel: '#errors',
        username: 'Error Monitor'
      }
    };

    expect(config.discord).toBeDefined();
    expect(config.slack).toBeDefined();
    expect(config.discord?.username).toBe('Error Bot');
    expect(config.slack?.channel).toBe('#errors');
  });

  it('should accept retry configuration', () => {
    const config: NotificationConfig = {
      discord: { webhookUrl: 'https://discord.com/api/webhooks/123/abc' },
      retry: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 30000
      }
    };

    expect(config.retry).toBeDefined();
    expect(config.retry?.maxAttempts).toBe(3);
  });

  it('should accept sanitization configuration', () => {
    const config: NotificationConfig = {
      discord: { webhookUrl: 'https://discord.com/api/webhooks/123/abc' },
      sanitization: {
        enabled: true,
        customPatterns: ['secret', 'token'],
        excludeDefaults: false
      }
    };

    expect(config.sanitization).toBeDefined();
    expect(config.sanitization?.enabled).toBe(true);
    expect(config.sanitization?.customPatterns).toContain('secret');
  });

  it('should accept environment and enabled flags', () => {
    const config: NotificationConfig = {
      discord: { webhookUrl: 'https://discord.com/api/webhooks/123/abc' },
      environment: 'production',
      enabled: true
    };

    expect(config.environment).toBe('production');
    expect(config.enabled).toBe(true);
  });
});

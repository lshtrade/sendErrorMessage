import axios from 'axios';
import type { ErrorNotification, DiscordConfig } from '../types/index.js';
import { BaseProvider } from './base-provider.js';
import { MessageFormatter } from '../utils/message-formatter.js';
import { RetryManager } from '../utils/retry-manager.js';

export class DiscordProvider extends BaseProvider {
  private config: DiscordConfig;
  private formatter: MessageFormatter;
  private retryManager: RetryManager;

  constructor(config: DiscordConfig, retryManager: RetryManager) {
    super('Discord');
    this.config = config;
    this.formatter = new MessageFormatter();
    this.retryManager = retryManager;

    if (!this.validateConfig()) {
      throw new Error('Invalid Discord configuration');
    }
  }

  async send(notification: ErrorNotification): Promise<void> {
    const payload = this.formatter.formatForDiscord(notification);

    // Add custom username and avatar if provided
    if (this.config.username) {
      payload.username = this.config.username;
    }
    if (this.config.avatarUrl) {
      payload.avatar_url = this.config.avatarUrl;
    }

    await this.retryManager.executeWithRetry(
      async () => {
        await this.sendWithFallback(
          async () => {
            const response = await axios.post(this.config.webhookUrl, payload, {
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000
            });

            if (response.status < 200 || response.status >= 300) {
              throw new Error(`Discord API returned status ${response.status}`);
            }
          },
          notification
        );
      },
      (attempt, error) => {
        console.warn(`[Discord] Retry attempt ${attempt} after error:`, error.message);
      }
    );
  }

  validateConfig(): boolean {
    if (!this.config.webhookUrl) {
      return false;
    }
    if (!this.config.webhookUrl.startsWith('https://')) {
      return false;
    }
    if (!this.config.webhookUrl.includes('discord.com/api/webhooks')) {
      return false;
    }
    return true;
  }
}

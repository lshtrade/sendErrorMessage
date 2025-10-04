import axios from 'axios';
import type { ErrorNotification, SlackConfig } from '../types/index.js';
import { BaseProvider } from './base-provider.js';
import { MessageFormatter } from '../utils/message-formatter.js';
import { RetryManager } from '../utils/retry-manager.js';

export class SlackProvider extends BaseProvider {
  private config: SlackConfig;
  private formatter: MessageFormatter;
  private retryManager: RetryManager;

  constructor(config: SlackConfig, retryManager: RetryManager) {
    super('Slack');
    this.config = config;
    this.formatter = new MessageFormatter();
    this.retryManager = retryManager;

    if (!this.validateConfig()) {
      throw new Error('Invalid Slack configuration');
    }
  }

  async send(notification: ErrorNotification): Promise<void> {
    const payload = this.formatter.formatForSlack(notification);

    // Add custom username and channel if provided
    if (this.config.username) {
      payload.username = this.config.username;
    }
    if (this.config.channel) {
      payload.channel = this.config.channel;
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
              throw new Error(`Slack API returned status ${response.status}`);
            }

            // Slack returns "ok" in response body on success
            if (response.data !== 'ok') {
              throw new Error(`Slack API returned unexpected response: ${response.data}`);
            }
          },
          notification
        );
      },
      (attempt, error) => {
        console.warn(`[Slack] Retry attempt ${attempt} after error:`, error.message);
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
    if (!this.config.webhookUrl.includes('hooks.slack.com')) {
      return false;
    }
    return true;
  }
}

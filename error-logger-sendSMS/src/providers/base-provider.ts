import type { ErrorNotification, NotificationProvider } from '../types/index.js';

export abstract class BaseProvider implements NotificationProvider {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract send(notification: ErrorNotification): Promise<void>;

  abstract validateConfig(): boolean;

  getName(): string {
    return this.name;
  }

  protected async sendWithFallback(
    sendFn: () => Promise<void>,
    notification: ErrorNotification
  ): Promise<void> {
    try {
      await sendFn();
    } catch (error) {
      // Fallback to console logging
      console.error(`[${this.name}] Failed to send notification:`, error);
      console.error(`[${this.name}] Notification content:`, {
        message: notification.message,
        severity: notification.severity,
        timestamp: notification.timestamp
      });
      throw error;
    }
  }
}

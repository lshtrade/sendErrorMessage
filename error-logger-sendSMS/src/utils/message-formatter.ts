import type { ErrorNotification } from '../types/index.js';

export class MessageFormatter {
  formatForDiscord(notification: ErrorNotification): any {
    const color = this.getSeverityColor(notification.severity);

    const embed: any = {
      title: `[${notification.severity.toUpperCase()}] ${notification.message}`,
      color: color,
      timestamp: notification.timestamp,
      fields: []
    };

    if (notification.stack) {
      embed.fields.push({
        name: 'Stack Trace',
        value: this.truncate(notification.stack, 1024),
        inline: false
      });
    }

    if (notification.environment) {
      embed.fields.push({
        name: 'Environment',
        value: notification.environment,
        inline: true
      });
    }

    if (notification.url) {
      embed.fields.push({
        name: 'URL',
        value: notification.url,
        inline: true
      });
    }

    if (notification.metadata) {
      embed.fields.push({
        name: 'Metadata',
        value: '```json\n' + this.truncate(JSON.stringify(notification.metadata, null, 2), 1024) + '\n```',
        inline: false
      });
    }

    return { embeds: [embed] };
  }

  formatForSlack(notification: ErrorNotification): any {
    const color = this.getSeverityColorSlack(notification.severity);

    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${notification.severity.toUpperCase()}: ${notification.message}`
        }
      }
    ];

    const fields: any[] = [];

    if (notification.environment) {
      fields.push({
        type: 'mrkdwn',
        text: `*Environment:*\n${notification.environment}`
      });
    }

    if (notification.url) {
      fields.push({
        type: 'mrkdwn',
        text: `*URL:*\n${notification.url}`
      });
    }

    if (fields.length > 0) {
      blocks.push({
        type: 'section',
        fields: fields
      });
    }

    if (notification.stack) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stack Trace:*\n\`\`\`${this.truncate(notification.stack, 3000)}\`\`\``
        }
      });
    }

    if (notification.metadata) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Metadata:*\n\`\`\`${this.truncate(JSON.stringify(notification.metadata, null, 2), 3000)}\`\`\``
        }
      });
    }

    blocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: `Timestamp: ${notification.timestamp}`
      }]
    });

    return {
      attachments: [{
        color: color,
        blocks: blocks
      }]
    };
  }

  private getSeverityColor(severity: string): number {
    switch (severity) {
      case 'error': return 0xFF0000; // Red
      case 'warning': return 0xFFA500; // Orange
      case 'info': return 0x0099FF; // Blue
      default: return 0x808080; // Gray
    }
  }

  private getSeverityColorSlack(severity: string): string {
    switch (severity) {
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'good';
      default: return '#808080';
    }
  }

  private truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - 3) + '...';
  }
}

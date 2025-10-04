import { describe, it, expect } from 'vitest';
import type { ErrorNotification, ErrorSeverity } from '../../src/types/index.js';

describe('ErrorNotification Contract', () => {
  it('should accept valid ErrorNotification with all required fields', () => {
    const notification: ErrorNotification = {
      message: 'Test error message',
      severity: 'error' as ErrorSeverity,
      timestamp: new Date().toISOString()
    };

    expect(notification.message).toBe('Test error message');
    expect(notification.severity).toBe('error');
    expect(notification.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should accept ErrorNotification with optional fields', () => {
    const notification: ErrorNotification = {
      message: 'Test error',
      severity: 'warning' as ErrorSeverity,
      timestamp: new Date().toISOString(),
      stack: 'Error: test\n  at file.ts:10:5',
      metadata: { userId: '123', action: 'login' },
      environment: 'production',
      url: '/api/users',
      userAgent: 'Mozilla/5.0'
    };

    expect(notification.stack).toBeDefined();
    expect(notification.metadata).toEqual({ userId: '123', action: 'login' });
    expect(notification.environment).toBe('production');
    expect(notification.url).toBe('/api/users');
    expect(notification.userAgent).toBe('Mozilla/5.0');
  });

  it('should support all severity levels', () => {
    const severities: ErrorSeverity[] = ['error', 'warning', 'info'];

    severities.forEach(severity => {
      const notification: ErrorNotification = {
        message: `Test ${severity}`,
        severity,
        timestamp: new Date().toISOString()
      };

      expect(notification.severity).toBe(severity);
    });
  });

  it('should accept metadata as Record<string, any>', () => {
    const notification: ErrorNotification = {
      message: 'Test',
      severity: 'info',
      timestamp: new Date().toISOString(),
      metadata: {
        string: 'value',
        number: 123,
        boolean: true,
        nested: { key: 'value' },
        array: [1, 2, 3]
      }
    };

    expect(notification.metadata).toBeDefined();
    expect(typeof notification.metadata?.string).toBe('string');
    expect(typeof notification.metadata?.number).toBe('number');
  });
});

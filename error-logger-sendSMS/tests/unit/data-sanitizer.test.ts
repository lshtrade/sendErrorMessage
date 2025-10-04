import { describe, it, expect } from 'vitest';
import { DataSanitizer } from '../../src/utils/data-sanitizer.js';

describe('DataSanitizer', () => {
  it('should sanitize password fields', () => {
    const sanitizer = new DataSanitizer({ enabled: true });

    const result = sanitizer.sanitize({
      username: 'john',
      password: 'secret123'
    });

    expect(result.password).toBe('[REDACTED]');
    expect(result.username).toBe('john');
  });

  it('should sanitize tokens', () => {
    const sanitizer = new DataSanitizer({ enabled: true });

    const data = {
      authToken: 'abc123xyz',
      apiKey: 'secret-key-123'
    };
    const result = sanitizer.sanitize(data);

    expect(result.authToken).toBe('[REDACTED]');
    expect(result.apiKey).toBe('[REDACTED]');
  });

  it('should sanitize email addresses', () => {
    const sanitizer = new DataSanitizer({ enabled: true });

    const text = 'Contact: user@example.com';
    const result = sanitizer.sanitize(text);

    expect(result).toContain('[REDACTED]');
    expect(result).not.toContain('user@example.com');
  });

  it('should use custom patterns', () => {
    const sanitizer = new DataSanitizer({
      enabled: true,
      customPatterns: ['customSecret']
    });

    const result = sanitizer.sanitize({
      data: 'customSecret value here'
    });

    expect(result.data).toContain('[REDACTED]');
  });

  it('should skip sanitization when disabled', () => {
    const sanitizer = new DataSanitizer({ enabled: false });

    const data = {
      password: 'secret123',
      token: 'abc123'
    };

    const result = sanitizer.sanitize(data);

    expect(result.password).toBe('secret123');
    expect(result.token).toBe('abc123');
  });

  it('should handle nested objects', () => {
    const sanitizer = new DataSanitizer({ enabled: true });

    const result = sanitizer.sanitize({
      user: {
        name: 'John',
        credentials: {
          password: 'secret'
        }
      }
    });

    expect(result.user.credentials.password).toBe('[REDACTED]');
  });
});

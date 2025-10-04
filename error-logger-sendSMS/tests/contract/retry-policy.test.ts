import { describe, it, expect } from 'vitest';
import type { RetryPolicy } from '../../src/types/index.js';

describe('RetryPolicy Contract', () => {
  it('should accept valid RetryPolicy with all fields', () => {
    const policy: RetryPolicy = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      jitter: true
    };

    expect(policy.maxAttempts).toBe(3);
    expect(policy.baseDelay).toBe(1000);
    expect(policy.maxDelay).toBe(30000);
    expect(policy.jitter).toBe(true);
  });

  it('should support range of maxAttempts (1-5)', () => {
    const attempts = [1, 2, 3, 4, 5];

    attempts.forEach(max => {
      const policy: RetryPolicy = {
        maxAttempts: max,
        baseDelay: 1000,
        maxDelay: 10000,
        jitter: false
      };

      expect(policy.maxAttempts).toBe(max);
      expect(policy.maxAttempts).toBeGreaterThanOrEqual(1);
      expect(policy.maxAttempts).toBeLessThanOrEqual(5);
    });
  });

  it('should support different delay configurations', () => {
    const policy: RetryPolicy = {
      maxAttempts: 3,
      baseDelay: 500,
      maxDelay: 60000,
      jitter: true
    };

    expect(policy.baseDelay).toBe(500);
    expect(policy.maxDelay).toBe(60000);
    expect(policy.maxDelay).toBeGreaterThan(policy.baseDelay);
  });

  it('should support jitter enabled and disabled', () => {
    const withJitter: RetryPolicy = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      jitter: true
    };

    const withoutJitter: RetryPolicy = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      jitter: false
    };

    expect(withJitter.jitter).toBe(true);
    expect(withoutJitter.jitter).toBe(false);
  });
});

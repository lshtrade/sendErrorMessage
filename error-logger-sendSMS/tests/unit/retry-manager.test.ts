import { describe, it, expect, vi } from 'vitest';
import { RetryManager } from '../../src/utils/retry-manager.js';

describe('RetryManager', () => {
  it('should succeed on first attempt', async () => {
    const manager = new RetryManager({ maxAttempts: 3 });

    const fn = vi.fn().mockResolvedValue('success');

    const result = await manager.executeWithRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const manager = new RetryManager({
      maxAttempts: 3,
      baseDelay: 10,
      maxDelay: 100,
      jitter: false
    });

    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockRejectedValueOnce(new Error('Attempt 2 failed'))
      .mockResolvedValue('success');

    const result = await manager.executeWithRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should fail after max attempts', async () => {
    const manager = new RetryManager({
      maxAttempts: 2,
      baseDelay: 10
    });

    const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

    await expect(manager.executeWithRetry(fn)).rejects.toThrow('Always fails');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call onRetry callback', async () => {
    const manager = new RetryManager({
      maxAttempts: 3,
      baseDelay: 10
    });

    const onRetry = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('success');

    await manager.executeWithRetry(fn, onRetry);

    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  it('should implement exponential backoff', async () => {
    const manager = new RetryManager({
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 1000,
      jitter: false
    });

    const timestamps: number[] = [];
    const fn = vi.fn().mockImplementation(() => {
      timestamps.push(Date.now());
      if (timestamps.length < 3) {
        return Promise.reject(new Error('Fail'));
      }
      return Promise.resolve('success');
    });

    await manager.executeWithRetry(fn);

    // Check delays are increasing (exponential)
    const delay1 = timestamps[1] - timestamps[0];
    const delay2 = timestamps[2] - timestamps[1];

    expect(delay1).toBeGreaterThanOrEqual(90); // ~100ms
    expect(delay2).toBeGreaterThanOrEqual(180); // ~200ms
    expect(delay2).toBeGreaterThan(delay1);
  });
});

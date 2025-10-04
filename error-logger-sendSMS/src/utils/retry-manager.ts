import type { RetryPolicy } from '../types/index.js';

export class RetryManager {
  private policy: RetryPolicy;
  private failureCount: number = 0;
  private circuitBreakerOpen: boolean = false;
  private lastFailureTime: number = 0;

  constructor(policy: Partial<RetryPolicy> = {}) {
    this.policy = {
      maxAttempts: policy.maxAttempts ?? 3,
      baseDelay: policy.baseDelay ?? 1000,
      maxDelay: policy.maxDelay ?? 30000,
      jitter: policy.jitter ?? true
    };
  }

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      const now = Date.now();
      if (now - this.lastFailureTime < 60000) { // 60 second reset
        throw new Error('Circuit breaker is open');
      }
      this.circuitBreakerOpen = false;
      this.failureCount = 0;
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.policy.maxAttempts; attempt++) {
      try {
        const result = await fn();
        this.failureCount = 0; // Reset on success
        return result;
      } catch (error) {
        lastError = error as Error;
        this.failureCount++;

        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        // Don't delay after last attempt
        if (attempt < this.policy.maxAttempts - 1) {
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    // Open circuit breaker after max consecutive failures
    if (this.failureCount >= 5) {
      this.circuitBreakerOpen = true;
      this.lastFailureTime = Date.now();
    }

    throw lastError || new Error('Retry failed');
  }

  private calculateDelay(attempt: number): number {
    // Exponential backoff: baseDelay * 2^attempt
    let delay = this.policy.baseDelay * Math.pow(2, attempt);

    // Apply jitter (±25%)
    if (this.policy.jitter) {
      const jitterFactor = 0.75 + Math.random() * 0.5; // 0.75 to 1.25
      delay = delay * jitterFactor;
    }

    // Cap at maxDelay
    return Math.min(delay, this.policy.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isCircuitBreakerOpen(): boolean {
    return this.circuitBreakerOpen;
  }

  resetCircuitBreaker(): void {
    this.circuitBreakerOpen = false;
    this.failureCount = 0;
  }
}

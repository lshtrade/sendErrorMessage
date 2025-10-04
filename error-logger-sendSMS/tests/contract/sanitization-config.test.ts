import { describe, it, expect } from 'vitest';
import type { SanitizationConfig } from '../../src/types/index.js';

describe('SanitizationConfig Contract', () => {
  it('should accept minimal SanitizationConfig with enabled flag', () => {
    const config: SanitizationConfig = {
      enabled: true
    };

    expect(config.enabled).toBe(true);
  });

  it('should accept SanitizationConfig with custom patterns', () => {
    const config: SanitizationConfig = {
      enabled: true,
      customPatterns: ['password', 'token', 'apikey', 'secret']
    };

    expect(config.customPatterns).toBeDefined();
    expect(config.customPatterns).toHaveLength(4);
    expect(config.customPatterns).toContain('password');
    expect(config.customPatterns).toContain('token');
  });

  it('should accept SanitizationConfig with excludeDefaults', () => {
    const config: SanitizationConfig = {
      enabled: true,
      customPatterns: ['custom_pattern'],
      excludeDefaults: true
    };

    expect(config.excludeDefaults).toBe(true);
    expect(config.customPatterns).toContain('custom_pattern');
  });

  it('should support disabled sanitization', () => {
    const config: SanitizationConfig = {
      enabled: false,
      excludeDefaults: true
    };

    expect(config.enabled).toBe(false);
  });

  it('should accept empty custom patterns array', () => {
    const config: SanitizationConfig = {
      enabled: true,
      customPatterns: [],
      excludeDefaults: false
    };

    expect(config.customPatterns).toEqual([]);
  });
});

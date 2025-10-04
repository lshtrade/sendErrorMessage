import type { SanitizationConfig } from '../types/index.js';

export class DataSanitizer {
  private config: SanitizationConfig;
  private defaultPatterns: RegExp[];

  constructor(config: Partial<SanitizationConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      customPatterns: config.customPatterns,
      excludeDefaults: config.excludeDefaults ?? false
    };

    this.defaultPatterns = [
      /password|passwd|pwd/gi,
      /token|bearer|jwt|api[_-]?key/gi,
      /secret|private[_-]?key/gi,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
      /\b\d{3}-\d{2}-\d{4}\b/g
    ];
  }

  sanitize(data: any): any {
    if (!this.config.enabled) {
      return data;
    }

    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (typeof data === 'object' && data !== null) {
      return this.sanitizeObject(data);
    }

    return data;
  }

  private sanitizeString(str: string): string {
    let result = str;

    // Apply custom patterns first
    if (this.config.customPatterns) {
      this.config.customPatterns.forEach(pattern => {
        const regex = new RegExp(pattern, 'gi');
        result = result.replace(regex, '[REDACTED]');
      });
    }

    // Apply default patterns unless excluded
    if (!this.config.excludeDefaults) {
      this.defaultPatterns.forEach(pattern => {
        result = result.replace(pattern, '[REDACTED]');
      });
    }

    return result;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if key matches sensitive patterns - if so, redact the value
      const keyMatches = this.keyMatchesSensitivePattern(key);
      if (keyMatches) {
        result[key] = '[REDACTED]';
      } else {
        // Sanitize the value recursively
        result[key] = this.sanitize(value);
      }
    }
    return result;
  }

  private keyMatchesSensitivePattern(key: string): boolean {
    // Check custom patterns
    if (this.config.customPatterns) {
      for (const pattern of this.config.customPatterns) {
        if (new RegExp(pattern, 'i').test(key)) {
          return true;
        }
      }
    }

    // Check default patterns unless excluded
    if (!this.config.excludeDefaults) {
      const sensitiveKeyPatterns = [
        /password|passwd|pwd/i,
        /token|bearer|jwt|api[_-]?key/i,
        /secret|private[_-]?key/i
      ];

      for (const pattern of sensitiveKeyPatterns) {
        if (pattern.test(key)) {
          return true;
        }
      }
    }

    return false;
  }
}

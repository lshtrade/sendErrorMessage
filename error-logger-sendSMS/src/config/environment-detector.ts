export class EnvironmentDetector {
  detect(): string {
    // Priority order: explicit env var > import.meta.env > window > default

    // Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.NODE_ENV) {
        return process.env.NODE_ENV;
      }
    }

    // Vite/ES modules environment
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const mode = (import.meta as any).env.MODE;
      if (mode) {
        return mode;
      }
    }

    // Browser environment (check hostname)
    if (typeof globalThis !== 'undefined' && (globalThis as any).window?.location) {
      const hostname = (globalThis as any).window.location.hostname;

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      }

      if (hostname.includes('staging') || hostname.includes('stg')) {
        return 'staging';
      }

      if (hostname.includes('prod') || hostname.includes('www')) {
        return 'production';
      }
    }

    // Default
    return 'development';
  }

  isProduction(): boolean {
    return this.detect() === 'production';
  }

  isDevelopment(): boolean {
    const env = this.detect();
    return env === 'development' || env === 'dev';
  }

  isStaging(): boolean {
    const env = this.detect();
    return env === 'staging' || env === 'stg';
  }
}

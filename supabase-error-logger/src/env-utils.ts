/**
 * Utility for managing environment-specific configurations
 * Provides different settings based on environment files used in package.json scripts
 */

export type Environment = 'development' | 'production' | 'test';

export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface ErrorLoggerConfig {
  supabaseUrl: string;
  supabaseKey: string;
  tableName: string;
  enabled: boolean;
  environment: Environment;
  logLevel: 'error' | 'warning' | 'info' | 'debug';
}

/**
 * Detects the current environment
 */
export function getCurrentEnvironment(): Environment {
  // Check NODE_ENV in Node.js environment
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    const env = process.env.NODE_ENV.toLowerCase();
    if (env === 'development' || env === 'production' || env === 'test') {
      return env as Environment;
    }
  }

  // Check Vite environment variables
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
    const mode = import.meta.env.MODE.toLowerCase();
    if (mode === 'development' || mode === 'production' || mode === 'test') {
      return mode as Environment;
    }
  }

  // Default is production
  return 'production';
}

/**
 * Gets Supabase configuration based on environment
 */
export function getSupabaseConfig(): SupabaseConfig {
  const environment = getCurrentEnvironment();
  
  // Check global environment variables first (runtime injection)
  const globalEnv = typeof globalThis !== 'undefined' ? (globalThis as any).__ENV : null;
  
  let url: string;
  let key: string;

  if (globalEnv?.SUPABASE_URL && globalEnv?.SUPABASE_ANON_KEY) {
    // Use runtime-injected environment variables (priority 1)
    url = globalEnv.SUPABASE_URL;
    key = globalEnv.SUPABASE_ANON_KEY;
  } else if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Use Vite environment variables (priority 2)
    url = import.meta.env.VITE_SUPABASE_URL || '';
    key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  } else if (typeof process !== 'undefined' && process.env) {
    // Use Node.js environment variables (priority 3)
    url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  } else {
    throw new Error('Supabase configuration not found');
  }

  if (!url || !key) {
    throw new Error(`Supabase configuration incomplete for ${environment} environment`);
  }

  return { url, key };
}

/**
 * Determines table name based on environment
 */
export function getTableName(): string {
  const environment = getCurrentEnvironment();
  
  // Can use different table names per environment
  switch (environment) {
    case 'development':
      return 'promptflowt_error_logs_dev';
    case 'test':
      return 'promptflowt_error_logs_test';
    case 'production':
    default:
      return 'promptflowt_error_logs';
  }
}

/**
 * Determines log level based on environment
 */
export function getLogLevel(): 'error' | 'warning' | 'info' | 'debug' {
  const environment = getCurrentEnvironment();
  
  switch (environment) {
    case 'development':
      return 'debug';
    case 'test':
      return 'info';
    case 'production':
    default:
      return 'error';
  }
}

/**
 * Checks if error logger should be enabled
 */
export function isErrorLoggingEnabled(): boolean {
  const environment = getCurrentEnvironment();
  
  // Check error logging enablement from environment variables
  let enabledFromEnv: boolean | null = null;
  
  // Check global environment variables first (runtime injection)
  const globalEnv = typeof globalThis !== 'undefined' ? (globalThis as any).__ENV : null;
  if (globalEnv?.ERROR_LOGGING_ENABLED !== undefined) {
    enabledFromEnv = globalEnv.ERROR_LOGGING_ENABLED === 'true' || globalEnv.ERROR_LOGGING_ENABLED === true;
  }
  
  // Check Vite environment variables
  if (enabledFromEnv === null && typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_ERROR_LOGGING_ENABLED !== undefined) {
      enabledFromEnv = import.meta.env.VITE_ERROR_LOGGING_ENABLED === 'true';
    }
  }
  
  // Check Node.js environment variables
  if (enabledFromEnv === null && typeof process !== 'undefined' && process.env) {
    if (process.env.ERROR_LOGGING_ENABLED !== undefined) {
      enabledFromEnv = process.env.ERROR_LOGGING_ENABLED === 'true';
    }
  }
  
  // Use the value if environment variable is explicitly set
  if (enabledFromEnv !== null) {
    return enabledFromEnv;
  }
  
  // Use environment-specific defaults if environment variable is not set
  // Disabled by default in test environment
  if (environment === 'test') {
    return false;
  }
  
  // Enabled by default in development and production environments
  return true;
}

/**
 * Creates environment-specific error logger configuration
 */
export function createErrorLoggerConfig(): ErrorLoggerConfig {
  const supabaseConfig = getSupabaseConfig();
  const environment = getCurrentEnvironment();
  
  return {
    supabaseUrl: supabaseConfig.url,
    supabaseKey: supabaseConfig.key,
    tableName: getTableName(),
    enabled: isErrorLoggingEnabled(),
    environment,
    logLevel: getLogLevel(),
  };
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createErrorLoggerConfig, type Environment } from './env-utils';

// Browser environment window object type declaration
declare const window: any;

export interface ErrorLogEntry {
  id?: string;
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
  timestamp: string;
  user_id?: string;
  session_id?: string;
  url?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  status?: number;
  status_text?: string;
  created_at?: string;
}

export interface SupabaseErrorLoggerConfig {
  supabaseUrl: string;
  supabaseKey: string;
  tableName?: string;
  enabled?: boolean;
  environment?: Environment;
  logLevel?: 'error' | 'warning' | 'info' | 'debug';
}

export interface ISupabaseErrorLogger {
  captureException(error: Error | string, metadata?: Record<string, any>): Promise<void>;
  captureMessage(message: string, level?: 'error' | 'warning' | 'info', metadata?: Record<string, any>): Promise<void>;
  setUser(userId: string): void;
  setSession(sessionId: string): void;
  configure(config: Partial<SupabaseErrorLoggerConfig>): void;
}

export class SupabaseErrorLogger implements ISupabaseErrorLogger {
  private static instance: SupabaseErrorLogger | null = null;
  private supabase!: SupabaseClient;
  private config!: SupabaseErrorLoggerConfig;
  private userId?: string;
  private sessionId?: string;

  // Session ID generation function
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }

  constructor(config?: Partial<SupabaseErrorLoggerConfig>) {
    // Singleton pattern: return existing instance if available
    if (SupabaseErrorLogger.instance) {
      return SupabaseErrorLogger.instance;
    }

    // Generate session ID (if not available)
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
    }
    // Environment detection function
    const detectEnvironment = (): Environment => {
      try {
        // 1. Check explicitly passed environment configuration first
        if (config?.environment) {
          return config.environment;
        }
        
        // 2. Check Vite environment variables (most reliable on client side)
        if (typeof import.meta !== 'undefined' && import.meta.env) {
          if (import.meta.env.DEV) {
            return 'development';
          }
          if (import.meta.env.MODE === 'development') {
            return 'development';
          }
          if (import.meta.env.MODE === 'production') {
            return 'production';
          }
        }
        
        // 3. Check Node.js environment variables (server side)
        if (typeof process !== 'undefined' && process.env) {
          if (process.env.NODE_ENV === 'development') {
            return 'development';
          }
          if (process.env.NODE_ENV === 'production') {
            return 'production';
          }
        }
        
        // 4. Determine by hostname (development servers usually use localhost)
        if (typeof window !== 'undefined' && window.location) {
          const hostname = window.location.hostname;
          if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev')) {
            return 'development';
          }
        }
      } catch (error) {
        // Default value when environment detection fails
      }
      
        // Default value (assume development environment)
      return 'development';
    };

    // Default configuration
    const defaultConfig: SupabaseErrorLoggerConfig = {
      supabaseUrl: '',
      supabaseKey: '',
      tableName: 'promptflowt_error_logs',
      enabled: true,
      environment: detectEnvironment(),
      logLevel: 'debug',
    };
    
    // Merge user configuration
    this.config = {
      ...defaultConfig,
      ...config,
    };
    
    // Remove environment detection debug logs (unnecessary in production)
    // if (this.config.environment === 'development') {
    //   console.log('[SupabaseErrorLogger] Environment detection result:', {
    //     detectedEnvironment: this.config.environment,
    //     configEnvironment: config?.environment,
    //     importMetaEnvDev: typeof import.meta !== 'undefined' ? import.meta.env?.DEV : 'undefined',
    //     importMetaEnvMode: typeof import.meta !== 'undefined' ? import.meta.env?.MODE : 'undefined',
    //     processEnvNodeEnv: typeof process !== 'undefined' ? process.env?.NODE_ENV : 'undefined',
    //     hostname: typeof window !== 'undefined' ? window.location.hostname : 'undefined',
    //   });
    // }
    
    if (this.config.supabaseUrl && this.config.supabaseKey) {
      this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey);
    } else {
      console.error('[SupabaseErrorLogger] Insufficient Supabase configuration');
      this.supabase = createClient('https://dummy.supabase.co', 'dummy-key');
    }

    // Set singleton instance
    SupabaseErrorLogger.instance = this;
  }

  // Get singleton instance
  public static getInstance(config?: Partial<SupabaseErrorLoggerConfig>): SupabaseErrorLogger {
    if (!SupabaseErrorLogger.instance) {
      SupabaseErrorLogger.instance = new SupabaseErrorLogger(config);
    }
    return SupabaseErrorLogger.instance;
  }

  // Reset singleton instance (for testing)
  public static resetInstance(): void {
    SupabaseErrorLogger.instance = null;
  }

  async captureException(error: Error | string | { status?: number; statusText?: string; message?: string }, metadata?: Record<string, any>): Promise<void> {
    if (!this.config.enabled) return;

    let status: number | undefined;
    let statusText: string | undefined;
    let errorMessage: string;
    let errorStack: string | undefined;

    // Check if it's an HTTP error object (has status and statusText properties)
    if (error && typeof error === 'object' && 'status' in error && 'statusText' in error) {
      status = (error as any).status;
      statusText = (error as any).statusText;
      errorMessage = (error as any).message ? String((error as any).message) : `HTTP ${status}${statusText ? ` ${statusText}` : ''}`;
      
      // Generate stack trace for HTTP errors
      errorStack = `HTTP Error: ${status} ${statusText}\n` +
                  `URL: ${typeof window !== 'undefined' ? window.location.href : 'unknown'}\n` +
                  `User Agent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'}\n` +
                  `Timestamp: ${new Date().toISOString()}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    } else {
      errorMessage = String(error);
      // Generate basic stack trace for general errors
      errorStack = `Error: ${errorMessage}\n` +
                  `URL: ${typeof window !== 'undefined' ? window.location.href : 'unknown'}\n` +
                  `Timestamp: ${new Date().toISOString()}`;
    }

    const logEntry: any = {
      message: errorMessage,
      stack: errorStack,
      level: 'error',
      timestamp: new Date().toISOString(),
      user_id: this.userId,
      session_id: this.sessionId,
      url: typeof globalThis !== 'undefined' && 'window' in globalThis ? (globalThis as any).window.location.href : undefined,
      user_agent: typeof globalThis !== 'undefined' && 'window' in globalThis ? (globalThis as any).window.navigator.userAgent : undefined,
      status: status || null,
      status_text: statusText || null,
      metadata: {
        ...(metadata || {}),
        ...(typeof status !== 'undefined' ? { status } : {}),
        ...(typeof statusText !== 'undefined' ? { statusText } : {}),
        environment: this.config.environment,
        logLevel: this.config.logLevel,
      },
    };

    try {
      // Log via server-side API (bypass RLS)
      const formData = new FormData();
      formData.append('errorData', JSON.stringify(logEntry));
      
      const response = await fetch('/api/error-log', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json() as { success?: boolean; error?: string; data?: any };
      
      if (!response.ok || !result.success) {
        console.error('[SupabaseErrorLogger] Server logging failed:', result);
        // Client-side direct insertion disabled for security
        // All error logging must be handled via server-side API only
      }
    } catch (err) {
      console.error('[SupabaseErrorLogger] Exception occurred:', err);
    }
  }

  async captureMessage(message: string, level: 'error' | 'warning' | 'info' = 'info', metadata?: Record<string, any>): Promise<void> {
    if (!this.config.enabled) return;

    const logEntry: any = {
      message,
      level,
      timestamp: new Date().toISOString(),
      user_id: this.userId,
      session_id: this.sessionId,
      url: typeof globalThis !== 'undefined' && 'window' in globalThis ? (globalThis as any).window.location.href : undefined,
      user_agent: typeof globalThis !== 'undefined' && 'window' in globalThis ? (globalThis as any).window.navigator.userAgent : undefined,
      status: null,
      status_text: null,
      metadata: {
        ...(metadata || {}),
        environment: this.config.environment,
        logLevel: this.config.logLevel,
      },
    };

    try {
      // Log via server-side API (bypass RLS)
      const formData = new FormData();
      formData.append('errorData', JSON.stringify(logEntry));
      
      const response = await fetch('/api/error-log', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json() as { success?: boolean; error?: string; data?: any };
      
      if (!response.ok || !result.success) {
        console.error('[SupabaseErrorLogger] Server message logging failed:', result);
        // Client-side direct insertion disabled for security
        // All error logging must be handled via server-side API only
      }
    } catch (err) {
      console.error('[SupabaseErrorLogger] Message exception occurred:', err);
    }
  }

  setUser(userId: string): void {
    this.userId = userId;
  }

  setSession(sessionId: string): void {
    this.sessionId = sessionId;
  }

  configure(config: Partial<SupabaseErrorLoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

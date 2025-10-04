import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createErrorLoggerConfig, type Environment } from './env-utils';

// 브라우저 환경에서 window 객체 타입 선언
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

  // 세션 ID 생성 함수
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }

  constructor(config?: Partial<SupabaseErrorLoggerConfig>) {
    // 싱글톤 패턴: 이미 인스턴스가 있으면 기존 인스턴스 반환
    if (SupabaseErrorLogger.instance) {
      return SupabaseErrorLogger.instance;
    }

    // 세션 ID 생성 (없는 경우)
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
    }
    // 환경 감지 함수
    const detectEnvironment = (): Environment => {
      try {
        // 1. 명시적으로 전달된 환경 설정 우선 확인
        if (config?.environment) {
          return config.environment;
        }
        
        // 2. Vite 환경 변수 확인 (클라이언트 사이드에서 가장 확실)
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
        
        // 3. Node.js 환경 변수 확인 (서버 사이드)
        if (typeof process !== 'undefined' && process.env) {
          if (process.env.NODE_ENV === 'development') {
            return 'development';
          }
          if (process.env.NODE_ENV === 'production') {
            return 'production';
          }
        }
        
        // 4. 호스트명으로 판단 (개발 서버는 보통 localhost)
        if (typeof window !== 'undefined' && window.location) {
          const hostname = window.location.hostname;
          if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev')) {
            return 'development';
          }
        }
      } catch (error) {
        // 환경 감지 실패 시 기본값
      }
      
      // 기본값 (개발 환경으로 가정)
      return 'development';
    };

    // 기본 설정
    const defaultConfig: SupabaseErrorLoggerConfig = {
      supabaseUrl: '',
      supabaseKey: '',
      tableName: 'promptflowt_error_logs',
      enabled: true,
      environment: detectEnvironment(),
      logLevel: 'debug',
    };
    
    // 사용자 설정과 병합
    this.config = {
      ...defaultConfig,
      ...config,
    };
    
    // 환경 감지 디버깅 로그 제거 (프로덕션에서 불필요)
    // if (this.config.environment === 'development') {
    //   console.log('[SupabaseErrorLogger] 환경 감지 결과:', {
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
      console.error('[SupabaseErrorLogger] Supabase 설정이 부족합니다');
      this.supabase = createClient('https://dummy.supabase.co', 'dummy-key');
    }

    // 싱글톤 인스턴스 설정
    SupabaseErrorLogger.instance = this;
  }

  // 싱글톤 인스턴스 가져오기
  public static getInstance(config?: Partial<SupabaseErrorLoggerConfig>): SupabaseErrorLogger {
    if (!SupabaseErrorLogger.instance) {
      SupabaseErrorLogger.instance = new SupabaseErrorLogger(config);
    }
    return SupabaseErrorLogger.instance;
  }

  // 싱글톤 인스턴스 리셋 (테스트용)
  public static resetInstance(): void {
    SupabaseErrorLogger.instance = null;
  }

  async captureException(error: Error | string | { status?: number; statusText?: string; message?: string }, metadata?: Record<string, any>): Promise<void> {
    if (!this.config.enabled) return;

    let status: number | undefined;
    let statusText: string | undefined;
    let errorMessage: string;
    let errorStack: string | undefined;

    // HTTP 에러 객체인지 확인 (status와 statusText 속성이 있는 경우)
    if (error && typeof error === 'object' && 'status' in error && 'statusText' in error) {
      status = (error as any).status;
      statusText = (error as any).statusText;
      errorMessage = (error as any).message ? String((error as any).message) : `HTTP ${status}${statusText ? ` ${statusText}` : ''}`;
      
      // HTTP 에러의 경우 스택 트레이스 생성
      errorStack = `HTTP Error: ${status} ${statusText}\n` +
                  `URL: ${typeof window !== 'undefined' ? window.location.href : 'unknown'}\n` +
                  `User Agent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'}\n` +
                  `Timestamp: ${new Date().toISOString()}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    } else {
      errorMessage = String(error);
      // 일반 에러의 경우 기본 스택 트레이스 생성
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
      // 서버 사이드 API를 통해 로깅 (RLS 우회)
      const formData = new FormData();
      formData.append('errorData', JSON.stringify(logEntry));
      
      const response = await fetch('/api/error-log', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json() as { success?: boolean; error?: string; data?: any };
      
      if (!response.ok || !result.success) {
        console.error('[SupabaseErrorLogger] 서버 로깅 실패:', result);
        // 보안상 클라이언트 사이드 직접 삽입은 비활성화
        // 모든 에러 로깅은 서버 사이드 API를 통해서만 처리
      }
    } catch (err) {
      console.error('[SupabaseErrorLogger] 예외 발생:', err);
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
      // 서버 사이드 API를 통해 로깅 (RLS 우회)
      const formData = new FormData();
      formData.append('errorData', JSON.stringify(logEntry));
      
      const response = await fetch('/api/error-log', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json() as { success?: boolean; error?: string; data?: any };
      
      if (!response.ok || !result.success) {
        console.error('[SupabaseErrorLogger] 서버 메시지 로깅 실패:', result);
        // 보안상 클라이언트 사이드 직접 삽입은 비활성화
        // 모든 에러 로깅은 서버 사이드 API를 통해서만 처리
      }
    } catch (err) {
      console.error('[SupabaseErrorLogger] 메시지 예외 발생:', err);
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

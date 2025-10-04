/**
 * 환경별 설정을 관리하는 유틸리티
 * package.json의 스크립트에서 사용하는 환경 파일에 따라 다른 설정을 제공
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
 * 현재 환경을 감지합니다
 */
export function getCurrentEnvironment(): Environment {
  // Node.js 환경에서 NODE_ENV 확인
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    const env = process.env.NODE_ENV.toLowerCase();
    if (env === 'development' || env === 'production' || env === 'test') {
      return env as Environment;
    }
  }

  // Vite 환경 변수 확인
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
    const mode = import.meta.env.MODE.toLowerCase();
    if (mode === 'development' || mode === 'production' || mode === 'test') {
      return mode as Environment;
    }
  }

  // 기본값은 production
  return 'production';
}

/**
 * Supabase 설정을 환경에 따라 가져옵니다
 */
export function getSupabaseConfig(): SupabaseConfig {
  const environment = getCurrentEnvironment();
  
  // 글로벌 환경 변수에서 우선 확인 (런타임 주입)
  const globalEnv = typeof globalThis !== 'undefined' ? (globalThis as any).__ENV : null;
  
  let url: string;
  let key: string;

  if (globalEnv?.SUPABASE_URL && globalEnv?.SUPABASE_ANON_KEY) {
    // 런타임에 주입된 환경 변수 사용 (우선순위 1)
    url = globalEnv.SUPABASE_URL;
    key = globalEnv.SUPABASE_ANON_KEY;
  } else if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Vite 환경 변수 사용 (우선순위 2)
    url = import.meta.env.VITE_SUPABASE_URL || '';
    key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  } else if (typeof process !== 'undefined' && process.env) {
    // Node.js 환경 변수 사용 (우선순위 3)
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
 * 테이블명을 환경에 따라 결정합니다
 */
export function getTableName(): string {
  const environment = getCurrentEnvironment();
  
  // 환경별로 다른 테이블명 사용 가능
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
 * 로그 레벨을 환경에 따라 결정합니다
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
 * 에러 로거가 활성화되어야 하는지 확인합니다
 */
export function isErrorLoggingEnabled(): boolean {
  const environment = getCurrentEnvironment();
  
  // 환경 변수에서 에러 로깅 활성화 여부 확인
  let enabledFromEnv: boolean | null = null;
  
  // 글로벌 환경 변수에서 우선 확인 (런타임 주입)
  const globalEnv = typeof globalThis !== 'undefined' ? (globalThis as any).__ENV : null;
  if (globalEnv?.ERROR_LOGGING_ENABLED !== undefined) {
    enabledFromEnv = globalEnv.ERROR_LOGGING_ENABLED === 'true' || globalEnv.ERROR_LOGGING_ENABLED === true;
  }
  
  // Vite 환경 변수 확인
  if (enabledFromEnv === null && typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_ERROR_LOGGING_ENABLED !== undefined) {
      enabledFromEnv = import.meta.env.VITE_ERROR_LOGGING_ENABLED === 'true';
    }
  }
  
  // Node.js 환경 변수 확인
  if (enabledFromEnv === null && typeof process !== 'undefined' && process.env) {
    if (process.env.ERROR_LOGGING_ENABLED !== undefined) {
      enabledFromEnv = process.env.ERROR_LOGGING_ENABLED === 'true';
    }
  }
  
  // 환경 변수가 명시적으로 설정된 경우 해당 값 사용
  if (enabledFromEnv !== null) {
    return enabledFromEnv;
  }
  
  // 환경 변수가 설정되지 않은 경우 환경별 기본값 사용
  // 테스트 환경에서는 기본적으로 비활성화
  if (environment === 'test') {
    return false;
  }
  
  // 개발 및 프로덕션 환경에서는 기본적으로 활성화
  return true;
}

/**
 * 환경별 에러 로거 설정을 생성합니다
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

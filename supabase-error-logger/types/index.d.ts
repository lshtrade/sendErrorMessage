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
}
export interface SupabaseErrorLogger {
    captureException(error: Error | string, metadata?: Record<string, any>): Promise<void>;
    captureMessage(message: string, level?: 'error' | 'warning' | 'info', metadata?: Record<string, any>): Promise<void>;
    setUser(userId: string): void;
    setSession(sessionId: string): void;
    configure(config: Partial<SupabaseErrorLoggerConfig>): void;
}
//# sourceMappingURL=index.d.ts.map
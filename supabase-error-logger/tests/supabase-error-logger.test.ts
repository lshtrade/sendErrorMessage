import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseErrorLogger } from '../src/index';
import type { SupabaseErrorLoggerConfig } from '../src/index';
import * as envUtils from '../src/env-utils';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('SupabaseErrorLogger', () => {
  let logger: SupabaseErrorLogger;
  let config: SupabaseErrorLoggerConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // env-utils 모킹
    vi.spyOn(envUtils, 'createErrorLoggerConfig').mockReturnValue({
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
      tableName: 'promptflowt_error_logs',
      enabled: true,
      environment: 'test',
      logLevel: 'info',
    });
    
    config = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
      tableName: 'promptflowt_error_logs',
      enabled: true,
      environment: 'test',
      logLevel: 'info',
    };
  });

  describe('captureException', () => {
    it('should save a basic Error object to Supabase', async () => {
      // Arrange
      const error = new Error('Test error message');
      const mockResponse = { data: { id: '123' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);

      // Act
      logger = new SupabaseErrorLogger(config);
      await logger.captureException(error);

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('promptflowt_error_logs');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'Test error message',
            stack: expect.any(String),
            level: 'error',
            timestamp: expect.any(String),
          })
        ])
      );
    });

    it('should accept string as error and save it', async () => {
      const mockResponse = { data: { id: '124' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);

      logger = new SupabaseErrorLogger(config);
      await logger.captureException('String error');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('promptflowt_error_logs');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'String error',
            level: 'error',
          })
        ])
      );
    });

    it('should include status code when provided via metadata', async () => {
      const mockResponse = { data: { id: '131' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);

      logger = new SupabaseErrorLogger(config);
      await logger.captureException(new Error('with status'), { status: 500 });

      const inserted = mockSupabaseClient.insert.mock.calls[0][0][0];
      expect(inserted.metadata).toMatchObject({ status: 500 });
    });

    it('should extract status from RouteError-like object', async () => {
      const mockResponse = { data: { id: '132' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);

      const routeError: any = { status: 403, statusText: 'Forbidden' };
      logger = new SupabaseErrorLogger(config);
      await logger.captureException(routeError as any);

      const inserted = mockSupabaseClient.insert.mock.calls[0][0][0];
      expect(inserted.metadata).toMatchObject({ status: 403, statusText: 'Forbidden' });
      expect(inserted.message).toContain('403');
    });
  });

  describe('captureMessage', () => {
    it('should save an info message by default', async () => {
      const mockResponse = { data: { id: '125' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);

      logger = new SupabaseErrorLogger(config);
      await logger.captureMessage('hello');

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ message: 'hello', level: 'info' })
        ])
      );
    });

    it('should save with provided level and metadata', async () => {
      const mockResponse = { data: { id: '126' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);

      logger = new SupabaseErrorLogger(config);
      await logger.captureMessage('warn msg', 'warning', { a: 1 });

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ 
            message: 'warn msg', 
            level: 'warning', 
            metadata: expect.objectContaining({ 
              a: 1,
              environment: 'test',
              logLevel: 'info'
            }) 
          })
        ])
      );
    });
  });

  describe('setUser and setSession', () => {
    it('should include user_id and session_id in logs', async () => {
      const mockResponse = { data: { id: '127' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);

      logger = new SupabaseErrorLogger(config);
      logger.setUser('user-1');
      logger.setSession('sess-1');
      await logger.captureMessage('with ids');

      const args = mockSupabaseClient.insert.mock.calls[0][0][0];
      expect(args.user_id).toBe('user-1');
      expect(args.session_id).toBe('sess-1');
    });
  });

  describe('configuration', () => {
    it('should not insert when disabled', async () => {
      logger = new SupabaseErrorLogger({ ...config, enabled: false });
      await logger.captureMessage('no-op');
      expect(mockSupabaseClient.insert).not.toHaveBeenCalled();
    });

    it('should respect tableName override', async () => {
      const mockResponse = { data: { id: '128' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);
      logger = new SupabaseErrorLogger({ ...config, tableName: 'custom_logs' });
      await logger.captureMessage('to custom');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('custom_logs');
    });

    it('should update configuration via configure()', async () => {
      const mockResponse = { data: { id: '129' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);
      logger = new SupabaseErrorLogger(config);
      logger.configure({ enabled: false });
      await logger.captureMessage('no-op');
      expect(mockSupabaseClient.insert).not.toHaveBeenCalled();
      logger.configure({ enabled: true, tableName: 't2' });
      await logger.captureMessage('ok');
      expect(mockSupabaseClient.from).toHaveBeenLastCalledWith('t2');
    });
  });

  describe('runtime safety', () => {
    it('should handle window undefined (SSR) without crashing', async () => {
      const mockResponse = { data: { id: '130' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);
      // Simulate Node env - window undefined by default in vitest node env
      logger = new SupabaseErrorLogger(config);
      await logger.captureMessage('ssr safe');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });
  });

  describe('environment configuration', () => {
    it('should use default environment configuration when no config provided', async () => {
      const mockResponse = { data: { id: '131' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);
      
      logger = new SupabaseErrorLogger(); // No config provided
      await logger.captureMessage('test message');
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('promptflowt_error_logs');
      const inserted = mockSupabaseClient.insert.mock.calls[0][0][0];
      expect(inserted.metadata).toMatchObject({
        environment: 'test',
        logLevel: 'info',
      });
    });

    it('should include environment and logLevel in metadata', async () => {
      const mockResponse = { data: { id: '132' }, error: null };
      mockSupabaseClient.insert.mockResolvedValue(mockResponse);
      
      logger = new SupabaseErrorLogger({
        environment: 'development',
        logLevel: 'debug',
      });
      await logger.captureException(new Error('test error'));
      
      const inserted = mockSupabaseClient.insert.mock.calls[0][0][0];
      expect(inserted.metadata).toMatchObject({
        environment: 'development',
        logLevel: 'debug',
      });
    });
  });
});

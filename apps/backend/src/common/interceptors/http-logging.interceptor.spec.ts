import { of, throwError } from 'rxjs';
import { HttpLoggingInterceptor } from './http-logging.interceptor';
import { StructuredLoggerService } from '../logger/structured-logger.service';

describe('HttpLoggingInterceptor', () => {
  let interceptor: HttpLoggingInterceptor;
  let mockLogger: jest.Mocked<StructuredLoggerService>;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    } as any;

    interceptor = new HttpLoggingInterceptor(mockLogger);
  });

  const createMockContext = (method: string, url: string, statusCode = 200) => {
    const req = {
      method,
      originalUrl: url,
      ip: '127.0.0.1',
      id: 'req-interceptor-test-1',
    };
    const res = {
      statusCode,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    } as any;
  };

  it('logs successful requests with access details', (done) => {
    const context = createMockContext('GET', '/api/v1/places/place-123', 200);
    const callHandler = {
      handle: () => of({ success: true }),
    };

    interceptor.intercept(context, callHandler as any).subscribe({
      next: () => {
        expect(mockLogger.log).toHaveBeenCalledTimes(1);
        const [loggedPayload, logContext] = mockLogger.log.mock.calls[0];
        expect(logContext).toBe('HttpAccess');

        const parsed = JSON.parse(loggedPayload);
        expect(parsed.type).toBe('http_access');
        expect(parsed.method).toBe('GET');
        expect(parsed.url).toBe('/api/v1/places/place-123');
        expect(parsed.statusCode).toBe(200);
        expect(parsed.correlationId).toBe('req-interceptor-test-1');
        expect(typeof parsed.durationMs).toBe('number');
        done();
      },
    });
  });

  it('suppresses frequent health check probes to debug level', (done) => {
    const context = createMockContext('GET', '/api/v1/health', 200);
    const callHandler = {
      handle: () => of({ status: 'ok' }),
    };

    interceptor.intercept(context, callHandler as any).subscribe({
      next: () => {
        expect(mockLogger.log).not.toHaveBeenCalled();
        expect(mockLogger.debug).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });

  it('logs failed requests with warning and error details', (done) => {
    const context = createMockContext('POST', '/api/v1/emergency/sos', 500);
    const callHandler = {
      handle: () => throwError(() => new Error('Dispatch failed')),
    };

    interceptor.intercept(context, callHandler as any).subscribe({
      error: (err) => {
        expect(err.message).toBe('Dispatch failed');
        expect(mockLogger.warn).toHaveBeenCalledTimes(1);
        const [loggedPayload] = mockLogger.warn.mock.calls[0];
        const parsed = JSON.parse(loggedPayload);
        expect(parsed.type).toBe('http_error');
        expect(parsed.error).toBe('Dispatch failed');
        done();
      },
    });
  });
});

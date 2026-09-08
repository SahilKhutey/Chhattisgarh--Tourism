import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StructuredLoggerService } from '../logger/structured-logger.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const correlationId = (req as any).id;

    const isHealthProbe =
      originalUrl === '/api/v1/health' ||
      originalUrl === '/api/v1/health/live' ||
      originalUrl === '/health' ||
      originalUrl === '/health/live';

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const statusCode = res.statusCode;

          if (isHealthProbe && statusCode < 400) {
            // Keep probe checks at debug level so production logs are not overwhelmed
            this.logger.debug(
              `HTTP ${method} ${originalUrl} ${statusCode} +${durationMs}ms`,
              'HttpLogging',
            );
            return;
          }

          this.logger.log(
            JSON.stringify({
              type: 'http_access',
              method,
              url: originalUrl,
              statusCode,
              durationMs,
              ip: ip || req.connection?.remoteAddress,
              correlationId,
            }),
            'HttpAccess',
          );
        },
        error: (err) => {
          const durationMs = Date.now() - startTime;
          const statusCode = err.status || 500;

          this.logger.warn(
            JSON.stringify({
              type: 'http_error',
              method,
              url: originalUrl,
              statusCode,
              durationMs,
              error: err.message,
              correlationId,
            }),
            'HttpAccess',
          );
        },
      }),
    );
  }
}

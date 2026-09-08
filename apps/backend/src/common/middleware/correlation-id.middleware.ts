import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestContextStorage } from '../logger/structured-logger.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const rawHeader =
      req.headers['x-request-id'] || req.headers['x-correlation-id'];
    const correlationId =
      (Array.isArray(rawHeader) ? rawHeader[0] : rawHeader) || randomUUID();

    (req as any).id = correlationId;
    (req as any).correlationId = correlationId;
    res.setHeader('X-Request-Id', correlationId);

    requestContextStorage.run({ correlationId }, () => {
      next();
    });
  }
}

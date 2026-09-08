import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { requestContextStorage } from '../logger/structured-logger.service';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('generates a new UUID if no X-Request-Id header is provided', (done) => {
    const req: any = { headers: {} };
    const res: any = {
      setHeader: jest.fn(),
    };

    middleware.use(req, res, () => {
      expect(req.id).toBeDefined();
      expect(req.correlationId).toBe(req.id);
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.id);

      // Verify AsyncLocalStorage store is active inside next()
      const store = requestContextStorage.getStore();
      expect(store?.correlationId).toBe(req.id);
      done();
    });
  });

  it('preserves an existing X-Request-Id from incoming request headers', (done) => {
    const req: any = {
      headers: {
        'x-request-id': 'client-supplied-request-id-999',
      },
    };
    const res: any = {
      setHeader: jest.fn(),
    };

    middleware.use(req, res, () => {
      expect(req.id).toBe('client-supplied-request-id-999');
      expect(res.setHeader).toHaveBeenCalledWith(
        'X-Request-Id',
        'client-supplied-request-id-999',
      );

      const store = requestContextStorage.getStore();
      expect(store?.correlationId).toBe('client-supplied-request-id-999');
      done();
    });
  });
});

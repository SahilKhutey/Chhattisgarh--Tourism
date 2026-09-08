import {
  StructuredLoggerService,
  requestContextStorage,
} from './structured-logger.service';

describe('StructuredLoggerService', () => {
  let service: StructuredLoggerService;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new StructuredLoggerService();
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it('formats standard log entries with level, message, and timestamp', () => {
    const entry = service.formatEntry('INFO', 'Server booted successfully', 'Bootstrap');

    expect(entry.level).toBe('INFO');
    expect(entry.message).toBe('Server booted successfully');
    expect(entry.context).toBe('Bootstrap');
    expect(entry.timestamp).toBeDefined();
    expect(entry.correlationId).toBeUndefined();
  });

  it('captures correlation ID from requestContextStorage', (done) => {
    requestContextStorage.run({ correlationId: 'req-test-uuid-1234' }, () => {
      const entry = service.formatEntry('INFO', 'Processing place verification', 'Moderation');
      expect(entry.correlationId).toBe('req-test-uuid-1234');
      done();
    });
  });

  it('formats object messages as JSON strings', () => {
    const payload = { placeId: 'place-1', action: 'APPROVE' };
    const entry = service.formatEntry('INFO', payload, 'Moderation');
    expect(entry.message).toBe(JSON.stringify(payload));
  });

  it('writes valid single-line JSON to stdout in production mode', () => {
    service.setIsProduction(true);
    service.setLogLevel('info');

    service.log('Production readiness check completed', 'Health');

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const writtenLine = stdoutSpy.mock.calls[0][0];
    const parsed = JSON.parse(writtenLine.trim());

    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toBe('Production readiness check completed');
    expect(parsed.context).toBe('Health');
  });

  it('writes error logs with trace to stderr in production mode', () => {
    service.setIsProduction(true);
    service.setLogLevel('info');

    service.error('Database connection timed out', 'Error at prisma.connect', 'Prisma');

    expect(stderrSpy).toHaveBeenCalledTimes(1);
    const writtenLine = stderrSpy.mock.calls[0][0];
    const parsed = JSON.parse(writtenLine.trim());

    expect(parsed.level).toBe('ERROR');
    expect(parsed.message).toBe('Database connection timed out');
    expect(parsed.trace).toBe('Error at prisma.connect');
  });

  it('respects log level filtering', () => {
    service.setIsProduction(true);
    service.setLogLevel('warn');

    service.debug('Debug detailed trace');
    service.log('Info operational notice');

    expect(stdoutSpy).not.toHaveBeenCalled();

    service.warn('Warning: high memory usage');
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
  });
});

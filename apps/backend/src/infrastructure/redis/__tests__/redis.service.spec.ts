import { RedisService } from '../redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(() => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    service = new RedisService();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('serializes JSON values on set', async () => {
    const setSpy = jest
      .spyOn(service['client'], 'set')
      .mockResolvedValue('OK' as never);

    await service.set('test-key', { name: 'Destination' });

    expect(setSpy).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify({ name: 'Destination' }),
    );
  });

  it('sets key with TTL when provided', async () => {
    const setSpy = jest
      .spyOn(service['client'], 'set')
      .mockResolvedValue('OK' as never);

    await service.set('test-key', { name: 'Destination' }, 300);

    expect(setSpy).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify({ name: 'Destination' }),
      'EX',
      300,
    );
  });

  it('parses JSON values on get', async () => {
    jest
      .spyOn(service['client'], 'get')
      .mockResolvedValue(JSON.stringify({ name: 'Chitrakote' }) as never);

    const val = await service.get<{ name: string }>('test-key');

    expect(val).toEqual({ name: 'Chitrakote' });
  });

  it('returns null when key does not exist', async () => {
    jest
      .spyOn(service['client'], 'get')
      .mockResolvedValue(null as never);

    const val = await service.get('missing-key');

    expect(val).toBeNull();
  });

  it('deletes cache keys', async () => {
    const delSpy = jest
      .spyOn(service['client'], 'del')
      .mockResolvedValue(1 as never);

    await service.delete('test-key');

    expect(delSpy).toHaveBeenCalledWith('test-key');
  });

  it('handles client errors gracefully without throwing', async () => {
    jest
      .spyOn(service['client'], 'get')
      .mockRejectedValue(new Error('Connection lost') as never);

    const result = await service.get('failing-key');

    expect(result).toBeNull();
  });
});

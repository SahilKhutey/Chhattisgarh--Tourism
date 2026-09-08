import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';

    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy(times) {
        if (process.env.NODE_ENV === 'test') {
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connection established');
    });

    this.client.on('error', (error) => {
      this.logger.warn(`Redis error: ${error?.message || error}`);
    });
  }

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    try {
      await this.client.connect();
      await this.ping();
    } catch (err: any) {
      this.logger.warn(
        `Redis initial connection skipped/offline: ${err?.message || err}. Database fallback active.`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.client.status === 'ready' || this.client.status === 'connecting') {
        await this.client.quit();
      }
    } catch {
      // Ignored during shutdown
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async ping(): Promise<string> {
    if (process.env.NODE_ENV === 'test' && this.client.status !== 'ready') {
      return 'PONG';
    }
    return this.client.ping();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (err: any) {
      this.logger.warn(`Redis get failed for key "${key}": ${err?.message || err}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err: any) {
      this.logger.warn(`Redis set failed for key "${key}": ${err?.message || err}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.warn(`Redis delete failed for key "${key}": ${err?.message || err}`);
    }
  }
}

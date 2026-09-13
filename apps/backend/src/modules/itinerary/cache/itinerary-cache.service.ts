import { Injectable, Logger, Optional } from '@nestjs/common';
import { RedisService } from '../../../infrastructure/redis/redis.service';

@Injectable()
export class ItineraryCacheService {
  private readonly logger = new Logger(ItineraryCacheService.name);

  constructor(@Optional() private readonly redis?: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      const raw = await this.redis.get(key);
      if (!raw) return null;
      return typeof raw === 'string' ? (JSON.parse(raw) as T) : (raw as T);
    } catch (err: any) {
      this.logger.warn(`Redis get error for key ${key}: ${err?.message}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.set(key, JSON.stringify(value), ttlSeconds);
    } catch (err: any) {
      this.logger.warn(`Redis set error for key ${key}: ${err?.message}`);
    }
  }

  async invalidateTrip(tripId: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.deletePattern(`itinerary:${tripId}:*`);
      await this.redis.deletePattern(`trip:${tripId}:*`);
    } catch (err: any) {
      this.logger.warn(`Redis eviction error for trip ${tripId}: ${err?.message}`);
    }
  }
}

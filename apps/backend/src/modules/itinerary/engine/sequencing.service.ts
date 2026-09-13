import { Injectable } from '@nestjs/common';
import { TravelTimeService } from './time.service';

@Injectable()
export class SequencingService {
  constructor(private readonly timeService: TravelTimeService) {}

  sequence<T extends { latitude: number; longitude: number }>(
    origin: { latitude: number; longitude: number },
    candidates: T[],
  ): T[] {
    const remaining = [...candidates];
    const result: T[] = [];

    let current = origin;

    while (remaining.length > 0) {
      let bestIndex = 0;
      let bestDistance = Infinity;

      remaining.forEach((candidate, index) => {
        const distance = this.timeService.distanceKm(current, candidate);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      const [selected] = remaining.splice(bestIndex, 1);
      result.push(selected);
      current = selected;
    }

    return result;
  }
}

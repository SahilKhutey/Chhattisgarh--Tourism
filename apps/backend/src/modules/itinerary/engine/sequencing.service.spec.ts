import { SequencingService } from './sequencing.service';
import { TravelTimeService } from './time.service';

describe('SequencingService', () => {
  let service: SequencingService;
  let timeService: TravelTimeService;

  beforeEach(() => {
    timeService = new TravelTimeService();
    service = new SequencingService(timeService);
  });

  it('selects geographically nearest candidate first', () => {
    const origin = { latitude: 21.0, longitude: 81.0 };
    const candidates = [
      { latitude: 22.5, longitude: 82.5, name: 'Far Place' },
      { latitude: 21.05, longitude: 81.05, name: 'Near Place' },
    ];

    const result = service.sequence(origin, candidates);
    expect(result[0].name).toBe('Near Place');
    expect(result[1].name).toBe('Far Place');
  });

  it('does not mutate original candidates array', () => {
    const origin = { latitude: 21.0, longitude: 81.0 };
    const candidates = [
      { latitude: 21.5, longitude: 81.5 },
      { latitude: 21.1, longitude: 81.1 },
    ];

    service.sequence(origin, candidates);
    expect(candidates).toHaveLength(2);
  });
});

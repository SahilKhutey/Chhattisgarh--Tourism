import { Test, TestingModule } from '@nestjs/testing';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';

describe('ItineraryController Unit Tests', () => {
  let controller: ItineraryController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      generateItinerary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItineraryController],
      providers: [
        {
          provide: ItineraryService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ItineraryController>(ItineraryController);
  });

  it('should be successfully initialized', () => {
    expect(controller).toBeDefined();
  });

  describe('generateItinerary API endpoints controls', () => {
    it('should invoke generateItinerary on service with correct arguments', async () => {
      const dto = {
        district: 'Bastar',
        durationDays: 3,
        pace: 'moderate' as const,
      };

      const mockItinerary = [
        {
          day: 1,
          stops: [{ name: 'Chitrakote Falls', slug: 'chitrakote-falls', coordinates: { lat: 19.2006, lng: 81.6961 } }],
          distanceTraveledKm: 12.5,
        },
      ];

      serviceMock.generateItinerary.mockResolvedValue(mockItinerary);

      const result = await controller.generate(dto);

      expect(result).toEqual(mockItinerary);
      expect(serviceMock.generateItinerary).toHaveBeenCalledWith('Bastar', 3, 'moderate');
    });
  });
});

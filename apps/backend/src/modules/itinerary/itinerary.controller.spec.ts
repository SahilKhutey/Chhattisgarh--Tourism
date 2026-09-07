import { Test, TestingModule } from '@nestjs/testing';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';

describe('ItineraryController', () => {
  let controller: ItineraryController;

  const serviceMock = {
    generateItinerary: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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

  it('should initialize', () => {
    expect(controller).toBeDefined();
  });

  it('passes all DTO parameters to service', async () => {
    const dto = {
      district: 'Bastar',
      durationDays: 3,
      pace: 'moderate' as const,
      interests: ['nature', 'heritage'],
      travelers: 2,
    };

    const expected = [
      {
        day: 1,
        stops: [],
        distanceTraveledKm: 0,
        estimatedVisitMinutes: 0,
        estimatedDayMinutes: 0,
      },
    ];

    serviceMock.generateItinerary.mockResolvedValue(expected);

    const result = await controller.generate(dto);

    expect(result).toEqual(expected);
    expect(serviceMock.generateItinerary).toHaveBeenCalledWith(
      'Bastar',
      3,
      'moderate',
      ['nature', 'heritage'],
      2,
    );
  });

  it('defaults interests and travelers', async () => {
    serviceMock.generateItinerary.mockResolvedValue([]);

    await controller.generate({
      district: 'Bastar',
      durationDays: 2,
      pace: 'slow',
    });

    expect(serviceMock.generateItinerary).toHaveBeenCalledWith(
      'Bastar',
      2,
      'slow',
      [],
      1,
    );
  });
});

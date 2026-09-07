import { Test, TestingModule } from '@nestjs/testing';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

describe('PlacesController Unit Tests', () => {
  let controller: PlacesController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      findNearby: jest.fn(),
      getCategories: jest.fn(),
      getDistricts: jest.fn(),
      create: jest.fn(),
      semanticSearch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacesController],
      providers: [
        {
          provide: PlacesService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<PlacesController>(PlacesController);
  });

  it('should be successfully initialized', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate getAll to placesService.findAll', async () => {
    const mockPlaces = [{ id: 'p1', name: 'Chitrakote Falls' }];
    serviceMock.findAll.mockResolvedValue(mockPlaces);

    const result = await controller.getAll('waterfall', 'Bastar', 'Chitrakote');

    expect(result).toBe(mockPlaces);
    expect(serviceMock.findAll).toHaveBeenCalledWith('waterfall', 'Bastar', 'Chitrakote');
  });

  it('should delegate getCategories to placesService.getCategories', async () => {
    const mockCategories = [{ id: 'c1', name: 'Waterfall', slug: 'waterfall', placeCount: 10 }];
    serviceMock.getCategories.mockResolvedValue(mockCategories);

    const result = await controller.getCategories();

    expect(result).toBe(mockCategories);
    expect(serviceMock.getCategories).toHaveBeenCalled();
  });

  it('should delegate getDistricts to placesService.getDistricts', async () => {
    const mockDistricts = [{ name: 'Bastar', placeCount: 20 }];
    serviceMock.getDistricts.mockResolvedValue(mockDistricts);

    const result = await controller.getDistricts();

    expect(result).toBe(mockDistricts);
    expect(serviceMock.getDistricts).toHaveBeenCalled();
  });

  it('should delegate getBySlug to placesService.findBySlug', async () => {
    const mockPlace = { id: 'p1', slug: 'chitrakote-falls', name: 'Chitrakote Falls' };
    serviceMock.findBySlug.mockResolvedValue(mockPlace);

    const result = await controller.getBySlug('chitrakote-falls');

    expect(result).toBe(mockPlace);
    expect(serviceMock.findBySlug).toHaveBeenCalledWith('chitrakote-falls');
  });

  it('should delegate getNearby to placesService.findNearby', async () => {
    const mockPlaces = [{ id: 'p1', name: 'Chitrakote Falls', distance_km: 2.5 }];
    serviceMock.findNearby.mockResolvedValue(mockPlaces);

    const result = await controller.getNearby(19.2, 81.7, 25);

    expect(result).toBe(mockPlaces);
    expect(serviceMock.findNearby).toHaveBeenCalledWith(19.2, 81.7, 25);
  });

  it('should delegate create to placesService.create', async () => {
    const dto: any = {
      name: 'Tamra Ghumar',
      description: 'Scenic waterfall in Bastar',
      district: 'Bastar',
      categoryId: 'cat-uuid',
      latitude: 19.12,
      longitude: 81.75,
      heroImage: 'https://images.unsplash.com/photo-1',
    };
    const created = { id: 'new-p1', slug: 'tamra-ghumar', ...dto };
    serviceMock.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(result).toBe(created);
    expect(serviceMock.create).toHaveBeenCalledWith(dto);
  });

  it('should delegate semanticSearch to placesService.semanticSearch', async () => {
    const searchResults = [{ id: 'p1', name: 'Chitrakote Falls' }];
    serviceMock.semanticSearch.mockResolvedValue(searchResults);

    const result = await controller.semanticSearch('waterfall', 3);

    expect(result).toBe(searchResults);
    expect(serviceMock.semanticSearch).toHaveBeenCalledWith('waterfall', 3);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';

describe('EmergencyController', () => {
  let controller: EmergencyController;
  let serviceMock: {
    triggerSos: jest.Mock;
    getHelplines: jest.Mock;
    getStations: jest.Mock;
    createStation: jest.Mock;
    updateStation: jest.Mock;
    updateStationStatus: jest.Mock;
    deleteStation: jest.Mock;
  };

  beforeEach(async () => {
    serviceMock = {
      triggerSos: jest.fn().mockResolvedValue({ success: true, alertId: 'sos_123' }),
      getHelplines: jest.fn().mockResolvedValue([]),
      getStations: jest.fn().mockResolvedValue([]),
      createStation: jest.fn().mockResolvedValue({ id: 'station-1' }),
      updateStation: jest.fn().mockResolvedValue({ id: 'station-1' }),
      updateStationStatus: jest.fn().mockResolvedValue({ id: 'station-1', active: false }),
      deleteStation: jest.fn().mockResolvedValue({ success: true, id: 'station-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmergencyController],
      providers: [
        {
          provide: EmergencyService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<EmergencyController>(EmergencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerSos', () => {
    it('delegates to service.triggerSos', async () => {
      const dto = {
        latitude: 21.25,
        longitude: 81.63,
        touristName: 'Test Tourist',
      };
      const result = await controller.triggerSos(dto);
      expect(serviceMock.triggerSos).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, alertId: 'sos_123' });
    });
  });

  describe('getHelplines', () => {
    it('delegates to service.getHelplines with district', async () => {
      await controller.getHelplines('Bastar');
      expect(serviceMock.getHelplines).toHaveBeenCalledWith('Bastar');
    });
  });

  describe('getStations', () => {
    it('parses active query string and delegates', async () => {
      await controller.getStations('Bastar', 'POLICE', 'true');
      expect(serviceMock.getStations).toHaveBeenCalledWith({
        district: 'Bastar',
        type: 'POLICE',
        active: true,
      });

      await controller.getStations(undefined, undefined, 'false');
      expect(serviceMock.getStations).toHaveBeenCalledWith({
        district: undefined,
        type: undefined,
        active: false,
      });

      await controller.getStations();
      expect(serviceMock.getStations).toHaveBeenCalledWith({
        district: undefined,
        type: undefined,
        active: undefined,
      });
    });
  });

  describe('createStation', () => {
    it('delegates to service.createStation', async () => {
      const dto = {
        name: 'Station 1',
        phone: '+91-1234567890',
        type: 'POLICE' as const,
        district: 'Raipur',
        latitude: 21.25,
        longitude: 81.63,
      };
      const result = await controller.createStation(dto);
      expect(serviceMock.createStation).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'station-1' });
    });
  });

  describe('updateStation', () => {
    it('delegates to service.updateStation', async () => {
      const dto = { phone: '+91-9999999999' };
      const result = await controller.updateStation('station-1', dto);
      expect(serviceMock.updateStation).toHaveBeenCalledWith('station-1', dto);
      expect(result).toEqual({ id: 'station-1' });
    });
  });

  describe('updateStationStatus', () => {
    it('delegates to service.updateStationStatus', async () => {
      const result = await controller.updateStationStatus('station-1', { active: false });
      expect(serviceMock.updateStationStatus).toHaveBeenCalledWith('station-1', false);
      expect(result).toEqual({ id: 'station-1', active: false });
    });
  });

  describe('deleteStation', () => {
    it('delegates to service.deleteStation', async () => {
      const result = await controller.deleteStation('station-1');
      expect(serviceMock.deleteStation).toHaveBeenCalledWith('station-1');
      expect(result).toEqual({ success: true, id: 'station-1' });
    });
  });
});

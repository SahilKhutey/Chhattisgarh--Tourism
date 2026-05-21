import { Test, TestingModule } from '@nestjs/testing';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

/**
 * Unit tests for ModerationController.
 * Guards are overridden to always allow in unit test context —
 * integration/e2e tests should verify the full guard chain.
 */
describe('ModerationController Unit Tests', () => {
  let controller: ModerationController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      getPendingPlaces:  jest.fn(),
      approvePlace:      jest.fn(),
      rejectPlace:       jest.fn(),
      getPendingCreators: jest.fn(),
      verifyCreator:     jest.fn(),
      getPendingFolklore: jest.fn(),
      verifyFolklore:    jest.fn(),
      rejectFolklore:    jest.fn(),
      getUsers:          jest.fn(),
      appointRole:       jest.fn(),
      getSosAlerts:      jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModerationController],
      providers: [
        { provide: ModerationService, useValue: serviceMock },
      ],
    })
      // Override guards: the unit tests focus on controller logic only,
      // not on JWT or role validation (those are tested separately).
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ModerationController>(ModerationController);
  });

  it('should be successfully initialised', () => {
    expect(controller).toBeDefined();
  });

  describe('getPendingPlaces', () => {
    it('should return pending places from service', async () => {
      serviceMock.getPendingPlaces.mockResolvedValue([]);
      const result = await controller.getPendingPlaces();
      expect(result).toEqual([]);
      expect(serviceMock.getPendingPlaces).toHaveBeenCalledTimes(1);
    });
  });

  describe('approvePlace', () => {
    it('should forward ID to service and return result', async () => {
      const mockResult = { success: true, message: 'Verified' };
      serviceMock.approvePlace.mockResolvedValue(mockResult);

      const result = await controller.approvePlace('place-uuid-1');

      expect(result).toEqual(mockResult);
      expect(serviceMock.approvePlace).toHaveBeenCalledWith('place-uuid-1');
    });
  });

  describe('rejectPlace', () => {
    it('should forward ID to service and return result', async () => {
      const mockResult = { success: true, message: 'Purged' };
      serviceMock.rejectPlace.mockResolvedValue(mockResult);

      const result = await controller.rejectPlace('place-uuid-1');

      expect(result).toEqual(mockResult);
      expect(serviceMock.rejectPlace).toHaveBeenCalledWith('place-uuid-1');
    });
  });

  describe('getSosAlerts', () => {
    it('should return alert history from service', async () => {
      const alerts = [{ id: 'a1', status: 'DISPATCHED' }];
      serviceMock.getSosAlerts.mockResolvedValue(alerts);

      const result = await controller.getSosAlerts();
      expect(result).toEqual(alerts);
      expect(serviceMock.getSosAlerts).toHaveBeenCalledWith(undefined);
    });
  });
});

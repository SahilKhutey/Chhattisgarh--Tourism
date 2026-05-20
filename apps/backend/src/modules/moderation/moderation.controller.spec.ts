import { Test, TestingModule } from '@nestjs/testing';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { UnauthorizedException } from '@nestjs/common';

describe('ModerationController Unit Tests', () => {
  let controller: ModerationController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      getPendingPlaces: jest.fn(),
      approvePlace: jest.fn(),
      rejectPlace: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModerationController],
      providers: [
        {
          provide: ModerationService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ModerationController>(ModerationController);
  });

  it('should be successfully initialized', () => {
    expect(controller).toBeDefined();
  });

  describe('checkAdminPrivileges header guard logic', () => {
    it('should allow access if role is ADMIN or SUPER_ADMIN', async () => {
      serviceMock.getPendingPlaces.mockResolvedValue([]);
      
      const result = await controller.getPendingPlaces('ADMIN');
      expect(result).toEqual([]);

      const resultSuper = await controller.getPendingPlaces('SUPER_ADMIN');
      expect(resultSuper).toEqual([]);
    });

    it('should throw UnauthorizedException if header role is standard USER or missing', async () => {
      await expect(controller.getPendingPlaces('USER')).rejects.toThrow(UnauthorizedException);
      await expect(controller.getPendingPlaces('')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('approvePlace operations controls', () => {
    it('should forward request to service approvePlace and verify status', async () => {
      const mockResult = { success: true, message: 'Verified' };
      serviceMock.approvePlace.mockResolvedValue(mockResult);

      const result = await controller.approvePlace('ADMIN', 'place-uuid-1');

      expect(result).toEqual(mockResult);
      expect(serviceMock.approvePlace).toHaveBeenCalledWith('place-uuid-1');
    });
  });

  describe('rejectPlace operations controls', () => {
    it('should forward request to service rejectPlace and verify status', async () => {
      const mockResult = { success: true, message: 'Purged' };
      serviceMock.rejectPlace.mockResolvedValue(mockResult);

      const result = await controller.rejectPlace('ADMIN', 'place-uuid-1');

      expect(result).toEqual(mockResult);
      expect(serviceMock.rejectPlace).toHaveBeenCalledWith('place-uuid-1');
    });
  });
});

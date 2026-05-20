import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController Unit Tests', () => {
  let controller: UsersController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      registerCreator: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be successfully initialized', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile operations controls', () => {
    it('should retrieve profile details from service matching user parameter ID', async () => {
      const mockProfile = { id: 'user-uuid-1', fullName: 'Devendra Mandavi', email: 'traveler@cg.gov.in' };
      serviceMock.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile('user-uuid-1');

      expect(result).toEqual(mockProfile);
      expect(serviceMock.getProfile).toHaveBeenCalledWith('user-uuid-1');
    });
  });

  describe('updateProfile operations controls', () => {
    it('should forward fields to service updateProfile and verify status', async () => {
      const updateDto = { fullName: 'Aarav Mandavi', avatar: 'avatar_url' };
      const mockResult = { success: true, profile: { id: 'user-uuid-1', ...updateDto } };
      serviceMock.updateProfile.mockResolvedValue(mockResult);

      const result = await controller.updateProfile('user-uuid-1', updateDto);

      expect(result).toEqual(mockResult);
      expect(serviceMock.updateProfile).toHaveBeenCalledWith('user-uuid-1', updateDto);
    });
  });

  describe('registerCreator operations controls', () => {
    it('should forward bio registry logs to service and verify status', async () => {
      const creatorDto = { bio: 'Tribal heritage guide.' };
      const mockResult = { success: true, message: 'Staged' };
      serviceMock.registerCreator.mockResolvedValue(mockResult);

      const result = await controller.registerCreator('user-uuid-1', creatorDto);

      expect(result).toEqual(mockResult);
      expect(serviceMock.registerCreator).toHaveBeenCalledWith('user-uuid-1', creatorDto);
    });
  });
});

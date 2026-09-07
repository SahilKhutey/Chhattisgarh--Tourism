import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy Unit Tests', () => {
  let strategy: JwtStrategy;
  let prismaMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
    };

    configServiceMock = {
      getOrThrow: jest.fn().mockReturnValue('mock_jwt_secret_that_is_long_enough_32'),
    };

    strategy = new JwtStrategy(prismaMock, configServiceMock);
  });

  it('validates and returns user object with both id and userId', async () => {
    const mockUser = {
      id: 'user-uuid-123',
      email: 'traveler@cg.gov.in',
      role: 'USER',
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const result = await strategy.validate({ sub: 'user-uuid-123' });

    expect(result).toEqual({
      id: 'user-uuid-123',
      userId: 'user-uuid-123',
      email: 'traveler@cg.gov.in',
      role: 'USER',
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-uuid-123' },
    });
  });

  it('throws UnauthorizedException when user does not exist in database', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 'non-existent-id' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService Unit Tests', () => {
  let service: AuthService;
  let prismaMock: any;
  let jwtServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be successfully initialized', () => {
    expect(service).toBeDefined();
  });

  describe('login procedures tests', () => {
    it('should login successfully with valid email and matching passwords', async () => {
      const loginDto = {
        email: 'traveler@cg.gov.in',
        password: 'secure_password',
      };

      const hashedPassword = await bcrypt.hash('secure_password', 10);
      const mockDbUser = {
        id: 'user-uuid-123',
        fullName: 'Devendra Mandavi',
        email: 'traveler@cg.gov.in',
        password: hashedPassword,
        role: 'USER',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockDbUser);

      const result = await service.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.accessToken).toContain('mock_jwt_token');
      expect(result.user.fullName).toBe('Devendra Mandavi');
    });

    it('should throw UnauthorizedException if official credentials email is unregistered', async () => {
      const loginDto = {
        email: 'unregistered@cg.gov.in',
        password: 'password',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password credentials mismatch', async () => {
      const loginDto = {
        email: 'traveler@cg.gov.in',
        password: 'incorrect_password',
      };

      const hashedPassword = await bcrypt.hash('secure_password', 10);
      const mockDbUser = {
        id: 'user-uuid-123',
        fullName: 'Devendra Mandavi',
        email: 'traveler@cg.gov.in',
        password: hashedPassword,
        role: 'USER',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockDbUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register procedures tests', () => {
    it('should successfully persist new traveler profile user nodes', async () => {
      const registerDto = {
        email: 'new_traveler@cg.gov.in',
        password: 'new_password',
        fullName: 'Bastar Explorer',
      };

      const mockSavedUser = {
        id: 'new-uuid-999',
        fullName: 'Bastar Explorer',
        email: 'new_traveler@cg.gov.in',
        role: 'USER',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockSavedUser);

      const result = await service.register(registerDto);

      expect(result.success).toBe(true);
      expect(result.accessToken).toContain('mock_jwt_token');
      expect(result.user.email).toBe('new_traveler@cg.gov.in');
    });

    it('should throw BadRequestException if registry email already exists', async () => {
      const registerDto = {
        email: 'duplicate@cg.gov.in',
        password: 'password',
        fullName: 'Duplicate Explorer',
      };

      prismaMock.user.findUnique.mockResolvedValue({ id: 'exists-id' });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });
});

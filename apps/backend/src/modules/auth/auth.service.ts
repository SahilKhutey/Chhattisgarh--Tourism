import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Issues a short-lived JWT access token (15 min) and a long-lived opaque
   * refresh token (30 days) stored in the database for revocation support.
   */
  private async generateTokenPair(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload); // expiry set in auth.module.ts

    // Opaque refresh token — UUID stored in DB, not decodable by client
    const refreshToken = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  // ── Public methods ─────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const { accessToken, refreshToken } = await this.generateTokenPair(
      user.id,
      user.email,
      user.role,
    );

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('This email is already registered.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        role: 'USER',
      },
    });

    const { accessToken, refreshToken } = await this.generateTokenPair(
      user.id,
      user.email,
      user.role,
    );

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Validates the stored refresh token, revokes it (rotation), and issues
   * a fresh token pair. Returns 401 if the token is expired, revoked, or unknown.
   */
  async refresh(incomingToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: incomingToken },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException(
        'Refresh token is invalid or expired. Please log in again.',
      );
    }

    // Revoke the used token (rotation — prevents replay attacks)
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokenPair(
        stored.user.id,
        stored.user.email,
        stored.user.role,
      );

    return {
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: stored.user.id,
        fullName: stored.user.fullName,
        email: stored.user.email,
        role: stored.user.role,
      },
    };
  }

  /**
   * Revokes the provided refresh token on the server so it can never be
   * used to obtain new access tokens — even if someone intercepts it later.
   */
  async logout(incomingToken: string) {
    // Use updateMany so we don't throw if the token is already gone
    await this.prisma.refreshToken.updateMany({
      where: { token: incomingToken },
      data: { revoked: true },
    });

    return { success: true, message: 'Logged out successfully.' };
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartnerStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { SuspendPartnerDto, VerifyPartnerDto } from './dto/verify-partner.dto';
import { QueryPartnerDto } from './dto/query-partner.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePartnerDto, actorId?: string) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);

    const existing = await this.prisma.partner.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Partner with slug '${slug}' already exists`);
    }

    const partner = await this.prisma.partner.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        email: dto.email,
        phone: dto.phone,
        districtId: dto.districtId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
        status: PartnerStatus.PENDING,
      },
    });

    await this.prisma.commerceAuditLog.create({
      data: {
        actorId,
        action: 'PARTNER_REGISTERED',
        entityType: 'Partner',
        entityId: partner.id,
        newState: { name: partner.name, slug: partner.slug, status: partner.status },
      },
    });

    return partner;
  }

  async verify(id: string, dto: VerifyPartnerDto, actorId?: string) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) {
      throw new NotFoundException(`Partner '${id}' not found`);
    }

    const updated = await this.prisma.partner.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });

    await this.prisma.commerceAuditLog.create({
      data: {
        actorId,
        action: `PARTNER_${dto.status}`,
        entityType: 'Partner',
        entityId: partner.id,
        previousState: { status: partner.status },
        newState: { status: dto.status, reason: dto.reason },
      },
    });

    return updated;
  }

  async suspend(id: string, dto: SuspendPartnerDto, actorId?: string) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) {
      throw new NotFoundException(`Partner '${id}' not found`);
    }

    const updated = await this.prisma.partner.update({
      where: { id },
      data: {
        status: PartnerStatus.SUSPENDED,
      },
    });

    await this.prisma.commerceAuditLog.create({
      data: {
        actorId,
        action: 'PARTNER_SUSPENDED',
        entityType: 'Partner',
        entityId: partner.id,
        previousState: { status: partner.status },
        newState: { status: PartnerStatus.SUSPENDED, reason: dto.reason },
      },
    });

    return updated;
  }

  async findBySlug(slug: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { slug },
      include: {
        products: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            price: true,
            durationMin: true,
            capacity: true,
            active: true,
            policy: true,
          },
        },
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with slug '${slug}' not found`);
    }

    return partner;
  }

  async findById(id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner '${id}' not found`);
    }

    return partner;
  }

  async findAll(query: QueryPartnerDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PartnerWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.districtId) {
      where.districtId = query.districtId;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partner.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true, active: true },
        },
        bookings: {
          select: { id: true, status: true, totalAmount: true, totalPricePaise: true },
        },
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner '${id}' not found`);
    }

    const activeProducts = partner.products.filter((p) => p.active).length;
    const completedBookings = partner.bookings.filter(
      (b) => b.status === 'COMPLETED',
    );
    const totalGmv = completedBookings.reduce((acc, b) => {
      if (b.totalAmount) {
        return acc + Number(b.totalAmount);
      }
      if (b.totalPricePaise) {
        return acc + b.totalPricePaise / 100;
      }
      return acc;
    }, 0);

    return {
      partnerId: partner.id,
      name: partner.name,
      status: partner.status,
      totalProducts: partner.products.length,
      activeProducts,
      totalBookings: partner.bookings.length,
      completedBookings: completedBookings.length,
      totalGmv,
    };
  }
}

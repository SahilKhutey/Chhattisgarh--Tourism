import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartnerStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { QueryMarketplaceDto } from './dto/query-marketplace.dto';
import { availableCapacity, canPublishProduct } from './marketplace.types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto, actorId?: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: dto.partnerId },
    });

    if (!partner) {
      throw new NotFoundException(`Partner '${dto.partnerId}' not found`);
    }

    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existing = await this.prisma.tourismProduct.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Product with slug '${slug}' already exists`);
    }

    const product = await this.prisma.tourismProduct.create({
      data: {
        partnerId: dto.partnerId,
        name: dto.name,
        slug,
        description: dto.description,
        type: dto.type,
        price: dto.price,
        currency: dto.currency || 'INR',
        capacity: dto.capacity,
        durationMin: dto.durationMin,
        latitude: dto.latitude,
        longitude: dto.longitude,
        active: false,
        policy: {
          create: {
            fullRefundHours: dto.cancellationPolicy?.fullRefundHours ?? 48,
            partialRefundHours: dto.cancellationPolicy?.partialRefundHours ?? 24,
            partialRefundPercent: dto.cancellationPolicy?.partialRefundPercent ?? 50,
          },
        },
      },
      include: {
        partner: true,
        policy: true,
      },
    });

    await this.prisma.commerceAuditLog.create({
      data: {
        actorId,
        action: 'PRODUCT_CREATED',
        entityType: 'TourismProduct',
        entityId: product.id,
        newState: { name: product.name, slug: product.slug, partnerId: product.partnerId },
      },
    });

    return product;
  }

  async activateProduct(id: string, actorId?: string) {
    const product = await this.prisma.tourismProduct.findUnique({
      where: { id },
      include: { partner: true },
    });

    if (!product) {
      throw new NotFoundException(`Product '${id}' not found`);
    }

    const publishable = canPublishProduct({
      partnerVerified: product.partner.status === PartnerStatus.VERIFIED,
      active: true,
      price: Number(product.price),
      capacity: product.capacity,
    });

    if (!publishable) {
      if (product.partner.status !== PartnerStatus.VERIFIED) {
        throw new BadRequestException(
          'Cannot activate product for a partner who is not VERIFIED',
        );
      }
      throw new BadRequestException('Product configuration is invalid for activation');
    }

    const updated = await this.prisma.tourismProduct.update({
      where: { id },
      data: { active: true },
      include: { partner: true, policy: true },
    });

    await this.prisma.commerceAuditLog.create({
      data: {
        actorId,
        action: 'PRODUCT_ACTIVATED',
        entityType: 'TourismProduct',
        entityId: product.id,
        previousState: { active: product.active },
        newState: { active: true },
      },
    });

    return updated;
  }

  async deactivateProduct(id: string, actorId?: string) {
    const product = await this.prisma.tourismProduct.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product '${id}' not found`);
    }

    const updated = await this.prisma.tourismProduct.update({
      where: { id },
      data: { active: false },
    });

    await this.prisma.commerceAuditLog.create({
      data: {
        actorId,
        action: 'PRODUCT_DEACTIVATED',
        entityType: 'TourismProduct',
        entityId: product.id,
        previousState: { active: product.active },
        newState: { active: false },
      },
    });

    return updated;
  }

  async addAvailability(productId: string, dto: CreateAvailabilityDto) {
    const product = await this.prisma.tourismProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product '${productId}' not found`);
    }

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (startAt >= endAt) {
      throw new BadRequestException('startAt must be strictly earlier than endAt');
    }

    if (startAt.getTime() < Date.now()) {
      throw new BadRequestException('Availability slot must be in the future');
    }

    return this.prisma.productAvailability.create({
      data: {
        productId,
        startAt,
        endAt,
        capacity: dto.capacity,
        reserved: 0,
      },
    });
  }

  async getAvailability(productId: string, fromDate?: Date) {
    const after = fromDate || new Date();
    const slots = await this.prisma.productAvailability.findMany({
      where: {
        productId,
        startAt: { gte: after },
      },
      orderBy: { startAt: 'asc' },
    });

    return slots.map((s) => ({
      ...s,
      availableCapacity: availableCapacity(s.capacity, s.reserved),
      isSoldOut: availableCapacity(s.capacity, s.reserved) === 0,
    }));
  }

  async searchProducts(query: QueryMarketplaceDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TourismProductWhereInput = {};

    if (query.activeOnly !== false) {
      where.active = true;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.partnerId) {
      where.partnerId = query.partnerId;
    }

    if (query.districtId) {
      where.partner = {
        districtId: query.districtId,
      };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.tourismProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          partner: {
            select: {
              id: true,
              name: true,
              slug: true,
              districtId: true,
              status: true,
            },
          },
          policy: true,
          _count: {
            select: { reviews: true },
          },
        },
      }),
      this.prisma.tourismProduct.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.tourismProduct.findUnique({
      where: { slug },
      include: {
        partner: true,
        policy: true,
        availability: {
          where: { startAt: { gte: new Date() } },
          orderBy: { startAt: 'asc' },
          take: 10,
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product '${slug}' not found`);
    }

    const availabilityWithCapacity = product.availability.map((s) => ({
      ...s,
      availableCapacity: availableCapacity(s.capacity, s.reserved),
      isSoldOut: availableCapacity(s.capacity, s.reserved) === 0,
    }));

    return {
      ...product,
      availability: availabilityWithCapacity,
    };
  }

  async getProductById(id: string) {
    const product = await this.prisma.tourismProduct.findUnique({
      where: { id },
      include: {
        partner: true,
        policy: true,
        availability: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product '${id}' not found`);
    }

    return product;
  }
}

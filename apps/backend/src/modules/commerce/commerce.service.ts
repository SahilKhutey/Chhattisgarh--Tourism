import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { calculateCommission, CommissionCalculation } from './commerce.types';

@Injectable()
export class CommerceService {
  constructor(private readonly prisma: PrismaService) {}

  calculateCommission(grossAmount: number, commissionRate: number): CommissionCalculation {
    return calculateCommission(grossAmount, commissionRate);
  }

  async getPartnerSettlement(partnerId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException(`Partner '${partnerId}' not found`);
    }

    const commissions = await this.prisma.partnerCommission.findMany({
      where: { partnerId },
      include: {
        booking: {
          select: {
            id: true,
            bookingReference: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalGross = commissions.reduce((acc, c) => acc + Number(c.grossAmount), 0);
    const totalCommission = commissions.reduce((acc, c) => acc + Number(c.commissionAmount), 0);
    const totalPayable = commissions.reduce((acc, c) => acc + Number(c.partnerAmount), 0);

    return {
      partnerId,
      partnerName: partner.name,
      totalRecords: commissions.length,
      totalGross: Number(totalGross.toFixed(2)),
      totalCommission: Number(totalCommission.toFixed(2)),
      totalPayable: Number(totalPayable.toFixed(2)),
      commissions,
    };
  }

  async listCommissions(query: { partnerId?: string; page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.partnerId) {
      where.partnerId = query.partnerId;
    }

    const [items, total] = await Promise.all([
      this.prisma.partnerCommission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.partnerCommission.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

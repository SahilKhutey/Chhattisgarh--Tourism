import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GeneratedItinerary, PlanningCandidate } from './engine/planner.types';
import { CreateTripDto } from './dto/create-trip.dto';
import { PlanItineraryDto } from './dto/plan-itinerary.dto';
import { TripPace, ItineraryGenerator } from '@prisma/client';

@Injectable()
export class ItineraryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTrip(dto: CreateTripDto, userId?: string) {
    return this.prisma.trip.create({
      data: {
        userId,
        title: dto.title,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        originLatitude: dto.originLatitude,
        originLongitude: dto.originLongitude,
        travelers: dto.travelers ?? 1,
        status: 'DRAFT',
        preferences: {
          create: {
            categories: dto.categories ?? [],
            pace: (dto.pace as TripPace) ?? TripPace.BALANCED,
            accessibility: dto.accessibilityRequired ?? false,
          },
        },
        constraints: {
          create: {
            budgetAmount: dto.budgetAmount,
          },
        },
      },
      include: {
        preferences: true,
        constraints: true,
      },
    });
  }

  async getTrip(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        preferences: true,
        constraints: true,
        itineraries: {
          orderBy: { version: 'desc' },
          include: {
            days: {
              orderBy: { sequence: 'asc' },
              include: {
                stops: {
                  orderBy: { sequence: 'asc' },
                  include: {
                    place: {
                      include: {
                        category: true,
                        safety: true,
                      },
                    },
                    experience: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async findCandidates(
    trip: {
      originLatitude?: any;
      originLongitude?: any;
      preferences?: { categories?: any; accessibility?: boolean } | null;
      constraints?: { requiredPlaceIds?: any; excludedPlaceIds?: any } | null;
    },
    dto?: PlanItineraryDto,
  ): Promise<PlanningCandidate[]> {
    const excludedIds: string[] = dto?.excludedPlaceIds ?? (trip.constraints?.excludedPlaceIds as string[]) ?? [];

    // Strictly fetch only PUBLISHED and PUBLIC places
    const places = await this.prisma.place.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        ...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
      },
      include: {
        category: true,
        planningProfile: true,
        safety: true,
        scores: true,
        experiences: {
          where: { isActive: true },
          take: 1,
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    return places.map((place) => {
      const ratings = place.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : place.scores?.popularity
          ? place.scores.popularity / 20
          : 4.2;

      const categoryIds: string[] = [];
      if (place.categoryId) categoryIds.push(place.categoryId);
      if (place.category?.slug) categoryIds.push(place.category.slug);
      if (place.category?.name) categoryIds.push(place.category.name.toLowerCase());

      return {
        placeId: place.id,
        experienceId: place.experiences?.[0]?.id,
        name: place.name,
        slug: place.slug,
        latitude: place.latitude,
        longitude: place.longitude,
        visitDurationMin: place.planningProfile?.estimatedVisitMinutes ?? 90,
        estimatedCost: place.bookingPricePaise ? Math.round(place.bookingPricePaise / 100) : 0,
        categoryIds,
        categoryName: place.category?.name ?? 'Nature',
        difficulty: place.experiences?.[0]?.difficulty ?? 'EASY',
        accessibility: place.safety?.accessibility ? place.safety.accessibility !== 'NONE' : true,
        seasonalAvailable: true,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
        isPublished: place.status === 'PUBLISHED',
        isPublic: place.visibility === 'PUBLIC',
        rules: place.rules,
        safetyInfo: place.safetyInfo,
      };
    });
  }

  async saveGeneratedItinerary(
    tripId: string,
    generated: GeneratedItinerary,
    generator: ItineraryGenerator = ItineraryGenerator.RULE_ENGINE,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Find latest version
      const latest = await tx.itinerary.findFirst({
        where: { tripId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      const nextVersion = (latest?.version ?? 0) + 1;

      // Create new Itinerary record
      const itinerary = await tx.itinerary.create({
        data: {
          tripId,
          version: nextVersion,
          status: 'READY',
          generatedBy: generator,
          totalDistanceKm: generated.totalDistanceKm,
          totalDurationMin: generated.totalDurationMin,
          estimatedCost: generated.estimatedCost,
          days: {
            create: generated.days.map((day) => ({
              date: new Date(day.date),
              sequence: day.sequence,
              startTime: day.startTime,
              endTime: day.endTime,
              stops: {
                create: day.stops.map((stop) => ({
                  placeId: stop.placeId,
                  experienceId: stop.experienceId,
                  sequence: stop.sequence,
                  arrivalTime: stop.arrivalTime,
                  departureTime: stop.departureTime,
                  travelFromPreviousMin: stop.travelFromPreviousMin,
                  visitDurationMin: stop.visitDurationMin,
                  estimatedCost: stop.estimatedCost,
                  reason: stop.reason,
                  isLocked: stop.isLocked,
                })),
              },
            })),
          },
        },
        include: {
          days: {
            orderBy: { sequence: 'asc' },
            include: {
              stops: {
                orderBy: { sequence: 'asc' },
                include: {
                  place: {
                    include: {
                      category: true,
                      safety: true,
                    },
                  },
                  experience: true,
                },
              },
            },
          },
        },
      });

      // Update Trip status to READY
      await tx.trip.update({
        where: { id: tripId },
        data: { status: 'READY' },
      });

      return itinerary;
    });
  }

  async reorderStop(
    tripId: string,
    itineraryId: string,
    stopId: string,
    targetDaySequence: number,
    targetStopSequence: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify itinerary belongs to trip
      const itinerary = await tx.itinerary.findFirst({
        where: { id: itineraryId, tripId },
        include: {
          days: {
            include: {
              stops: {
                orderBy: { sequence: 'asc' },
              },
            },
          },
        },
      });

      if (!itinerary) {
        throw new NotFoundException('Itinerary not found for this trip');
      }

      const targetDay = (itinerary.days ?? []).find((d) => d.sequence === targetDaySequence);
      if (!targetDay) {
        throw new NotFoundException(`Target day sequence ${targetDaySequence} not found`);
      }

      // Update stop
      await tx.itineraryStop.update({
        where: { id: stopId },
        data: {
          dayId: targetDay.id,
          sequence: targetStopSequence,
        },
      });

      return this.getTrip(tripId);
    });
  }

  async getUserTrips(userId: string) {
    return this.prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        preferences: true,
        itineraries: {
          where: { status: 'READY' },
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            days: {
              include: {
                stops: {
                  include: {
                    place: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async deleteTrip(id: string) {
    return this.prisma.trip.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }
}

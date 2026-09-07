import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { SosAlertDto } from './dto/sos-alert.dto';
import { CreateEmergencyStationDto } from './dto/create-emergency-station.dto';
import { UpdateEmergencyStationDto } from './dto/update-emergency-station.dto';
import { EmergencyDispatcher } from './emergency.dispatcher';

export interface RescueStation {
  id: string;
  name: string;
  phone: string;
  type: string;
  district: string;
  division: string | null;
  latitude: number;
  longitude: number;
  active: boolean;
  priority: number;
  capabilities: string[];
  notes: string | null;
  distanceKm?: number;
}

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);

  private readonly EARTH_RADIUS_KM = 6371;

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatcher: EmergencyDispatcher,
  ) {}

  // ---------------------------------------------------------------------------
  // PUBLIC SOS
  // ---------------------------------------------------------------------------

  async triggerSos(dto: SosAlertDto) {
    this.validateCoordinates(dto.latitude, dto.longitude);

    const stations = await this.prisma.emergencyStation.findMany({
      where: {
        active: true,
      },
      orderBy: [
        {
          priority: 'desc',
        },
        {
          name: 'asc',
        },
      ],
    });

    if (stations.length === 0) {
      throw new BadRequestException(
        'No active emergency responder stations are currently configured.',
      );
    }

    const rankedStations: RescueStation[] = stations
      .map((station) => ({
        id: station.id,
        name: station.name,
        phone: station.phone,
        type: station.type,
        district: station.district,
        division: station.division,
        latitude: station.latitude,
        longitude: station.longitude,
        active: station.active,
        priority: station.priority,
        capabilities: this.parseCapabilities(station.capabilities),
        notes: station.notes,
        distanceKm: this.calculateDistance(
          dto.latitude,
          dto.longitude,
          station.latitude,
          station.longitude,
        ),
      }))
      .sort((a, b) => {
        const distanceDifference =
          (a.distanceKm ?? Number.MAX_SAFE_INTEGER) -
          (b.distanceKm ?? Number.MAX_SAFE_INTEGER);

        if (Math.abs(distanceDifference) > 0.001) {
          return distanceDifference;
        }

        return b.priority - a.priority;
      });

    const primaryResponder = rankedStations[0];
    const backupResponders = rankedStations.slice(1, 4);

    const alertId =
      `sos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const alert = await this.prisma.emergencyAlert.create({
      data: {
        alertId,

        touristName: dto.touristName,
        touristPhone: dto.touristPhone ?? null,
        medicalNotes: dto.medicalNotes ?? null,

        latitude: dto.latitude,
        longitude: dto.longitude,

        status: 'DISPATCHED',

        primaryResponder: primaryResponder.name,
        primaryResponderId: primaryResponder.id,

        backupResponders: JSON.stringify(
          backupResponders.map((station) => ({
            id: station.id,
            name: station.name,
            phone: station.phone,
            type: station.type,
            distanceKm: this.roundDistance(station.distanceKm!),
          })),
        ),

        dispatchMetadata: JSON.stringify({
          selectionStrategy: 'HAVERSINE_DISTANCE',
          stationCount: rankedStations.length,
          primaryStationId: primaryResponder.id,
          generatedAt: new Date().toISOString(),
        }),
      },
    });

    let dispatchResult;

    try {
      dispatchResult = await this.dispatcher.dispatch({
        alertId,
        touristName: dto.touristName,
        touristPhone: dto.touristPhone,
        medicalNotes: dto.medicalNotes,
        latitude: dto.latitude,
        longitude: dto.longitude,

        primary: {
          id: primaryResponder.id,
          name: primaryResponder.name,
          phone: primaryResponder.phone,
          type: primaryResponder.type,
          distanceKm: this.roundDistance(primaryResponder.distanceKm!),
        },

        backups: backupResponders.map((station) => ({
          id: station.id,
          name: station.name,
          phone: station.phone,
          type: station.type,
          distanceKm: this.roundDistance(station.distanceKm!),
        })),
      });
    } catch (error) {
      this.logger.error(
        `Emergency dispatch failed for ${alertId}`,
        error instanceof Error ? error.stack : String(error),
      );

      await this.prisma.emergencyAlert.update({
        where: {
          id: alert.id,
        },
        data: {
          status: 'DISPATCHED',
          dispatchMetadata: JSON.stringify({
            selectionStrategy: 'HAVERSINE_DISTANCE',
            dispatchStatus: 'DISPATCH_FAILED',
            error:
              error instanceof Error ? error.message : 'Unknown dispatch error',
          }),
        },
      });

      throw error;
    }

    return {
      success: true,

      alertId,

      timestamp: new Date().toISOString(),

      gpsCoordinates: {
        lat: dto.latitude,
        lng: dto.longitude,
      },

      status: 'DISPATCHED_IMMEDIATELY',

      message:
        `Emergency SOS received. Primary responder selected: ` +
        `${primaryResponder.name}.`,

      primaryResponder: {
        id: primaryResponder.id,
        name: primaryResponder.name,
        contactPhone: primaryResponder.phone,
        type: primaryResponder.type,
        district: primaryResponder.district,
        distanceKm: this.roundDistance(primaryResponder.distanceKm!),
      },

      backupResponders: backupResponders.map((station) => ({
        id: station.id,
        name: station.name,
        contactPhone: station.phone,
        type: station.type,
        district: station.district,
        distanceKm: this.roundDistance(station.distanceKm!),
      })),

      dispatch: dispatchResult,
    };
  }

  // ---------------------------------------------------------------------------
  // PUBLIC HELPLINES
  // ---------------------------------------------------------------------------

  async getHelplines(district?: string): Promise<RescueStation[]> {
    const stations = await this.prisma.emergencyStation.findMany({
      where: {
        active: true,
        ...(district
          ? {
              district: {
                equals: district,
              },
            }
          : {}),
      },

      orderBy: [
        {
          priority: 'desc',
        },
        {
          district: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });

    return stations.map((station) => this.toRescueStation(station));
  }

  // ---------------------------------------------------------------------------
  // ADMIN: LIST
  // ---------------------------------------------------------------------------

  async getStations(options?: {
    district?: string;
    type?: string;
    active?: boolean;
  }) {
    const stations = await this.prisma.emergencyStation.findMany({
      where: {
        ...(options?.district
          ? {
              district: {
                equals: options.district,
              },
            }
          : {}),

        ...(options?.type
          ? {
              type: options.type,
            }
          : {}),

        ...(options?.active !== undefined
          ? {
              active: options.active,
            }
          : {}),
      },

      orderBy: [
        {
          active: 'desc',
        },
        {
          priority: 'desc',
        },
        {
          district: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });

    return stations.map((station) => this.toRescueStation(station));
  }

  // ---------------------------------------------------------------------------
  // ADMIN: CREATE
  // ---------------------------------------------------------------------------

  async createStation(dto: CreateEmergencyStationDto) {
    this.validateCoordinates(dto.latitude, dto.longitude);

    const station = await this.prisma.emergencyStation.create({
      data: {
        name: dto.name.trim(),
        phone: dto.phone.trim(),
        type: dto.type,
        district: dto.district.trim(),
        division: dto.division?.trim() || null,
        latitude: dto.latitude,
        longitude: dto.longitude,
        active: true,
        priority: dto.priority ?? 0,
        capabilities: JSON.stringify(dto.capabilities ?? []),
        notes: dto.notes?.trim() || null,
      },
    });

    return this.toRescueStation(station);
  }

  // ---------------------------------------------------------------------------
  // ADMIN: UPDATE
  // ---------------------------------------------------------------------------

  async updateStation(
    id: string,
    dto: UpdateEmergencyStationDto,
  ) {
    const existing = await this.prisma.emergencyStation.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Emergency station not found.');
    }

    const latitude = dto.latitude ?? existing.latitude;
    const longitude = dto.longitude ?? existing.longitude;

    this.validateCoordinates(latitude, longitude);

    const station = await this.prisma.emergencyStation.update({
      where: {
        id,
      },

      data: {
        ...(dto.name !== undefined
          ? {
              name: dto.name.trim(),
            }
          : {}),

        ...(dto.phone !== undefined
          ? {
              phone: dto.phone.trim(),
            }
          : {}),

        ...(dto.type !== undefined
          ? {
              type: dto.type,
            }
          : {}),

        ...(dto.district !== undefined
          ? {
              district: dto.district.trim(),
            }
          : {}),

        ...(dto.division !== undefined
          ? {
              division: dto.division.trim() || null,
            }
          : {}),

        ...(dto.latitude !== undefined
          ? {
              latitude: dto.latitude,
            }
          : {}),

        ...(dto.longitude !== undefined
          ? {
              longitude: dto.longitude,
            }
          : {}),

        ...(dto.priority !== undefined
          ? {
              priority: dto.priority,
            }
          : {}),

        ...(dto.capabilities !== undefined
          ? {
              capabilities: JSON.stringify(dto.capabilities),
            }
          : {}),

        ...(dto.notes !== undefined
          ? {
              notes: dto.notes.trim() || null,
            }
          : {}),
      },
    });

    return this.toRescueStation(station);
  }

  // ---------------------------------------------------------------------------
  // ADMIN: ACTIVE / INACTIVE
  // ---------------------------------------------------------------------------

  async updateStationStatus(
    id: string,
    active: boolean,
  ) {
    const station = await this.prisma.emergencyStation.findUnique({
      where: {
        id,
      },
    });

    if (!station) {
      throw new NotFoundException('Emergency station not found.');
    }

    const updated = await this.prisma.emergencyStation.update({
      where: {
        id,
      },

      data: {
        active,
      },
    });

    return this.toRescueStation(updated);
  }

  // ---------------------------------------------------------------------------
  // ADMIN: DELETE
  // ---------------------------------------------------------------------------

  async deleteStation(id: string) {
    const station = await this.prisma.emergencyStation.findUnique({
      where: {
        id,
      },
    });

    if (!station) {
      throw new NotFoundException('Emergency station not found.');
    }

    const alertCount = await this.prisma.emergencyAlert.count({
      where: {
        primaryResponderId: id,
      },
    });

    if (alertCount > 0) {
      throw new BadRequestException(
        'Station has emergency alert history. Deactivate it instead of deleting it.',
      );
    }

    await this.prisma.emergencyStation.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      id,
    };
  }

  // ---------------------------------------------------------------------------
  // DISTANCE ENGINE
  // ---------------------------------------------------------------------------

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const latitude1 = this.toRadians(lat1);
    const latitude2 = this.toRadians(lat2);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(latitude1) *
        Math.cos(latitude2) *
        Math.sin(dLon / 2) ** 2;

    const boundedA = Math.min(1, Math.max(0, a));

    const c =
      2 *
      Math.atan2(
        Math.sqrt(boundedA),
        Math.sqrt(1 - boundedA),
      );

    return this.EARTH_RADIUS_KM * c;
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  private validateCoordinates(
    latitude: number,
    longitude: number,
  ) {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new BadRequestException(
        'Valid latitude and longitude are required.',
      );
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException(
        'Latitude must be between -90 and 90.',
      );
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException(
        'Longitude must be between -180 and 180.',
      );
    }
  }

  private toRadians(value: number): number {
    return value * (Math.PI / 180);
  }

  private roundDistance(distance: number): number {
    return Number(distance.toFixed(2));
  }

  private parseCapabilities(value: string): string[] {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed.filter(
            (item): item is string => typeof item === 'string',
          )
        : [];
    } catch {
      return [];
    }
  }

  private toRescueStation(station: {
    id: string;
    name: string;
    phone: string;
    type: string;
    district: string;
    division: string | null;
    latitude: number;
    longitude: number;
    active: boolean;
    priority: number;
    capabilities: string;
    notes: string | null;
  }): RescueStation {
    return {
      id: station.id,
      name: station.name,
      phone: station.phone,
      type: station.type,
      district: station.district,
      division: station.division,
      latitude: station.latitude,
      longitude: station.longitude,
      active: station.active,
      priority: station.priority,
      capabilities: this.parseCapabilities(station.capabilities),
      notes: station.notes,
    };
  }
}

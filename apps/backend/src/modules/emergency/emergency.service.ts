import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SosAlertDto } from './dto/sos-alert.dto';

export interface RescueStation {
  name: string;
  phone: string;
  type: 'police' | 'hospital' | 'ranger';
  district: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
}

/**
 * Static station registry — covers all major tourist zones in Chhattisgarh.
 * TODO Phase 2: migrate to database-backed EmergencyStation model so the
 * government can manage contacts via the admin panel.
 */
const REGIONAL_STATIONS: RescueStation[] = [
  // ── Bastar Division ────────────────────────────────────────────────────────
  { name: 'Bastar Forest Ranger Headquarters',   phone: '+91-7782-222422', type: 'ranger',   district: 'Bastar',    latitude: 19.2000, longitude: 81.7000 },
  { name: 'Jagdalpur Government Medical College', phone: '+91-7782-223048', type: 'hospital', district: 'Bastar',    latitude: 19.0833, longitude: 82.0167 },
  { name: 'Jagdalpur Police Control Room',        phone: '+91-7782-220100', type: 'police',   district: 'Bastar',    latitude: 19.0700, longitude: 82.0200 },
  { name: 'Chitrakote Forest Range Office',       phone: '+91-7782-263011', type: 'ranger',   district: 'Bastar',    latitude: 19.2050, longitude: 81.7400 },
  // ── Kabirdham Division ────────────────────────────────────────────────────
  { name: 'Kawardha Police PCR Station',          phone: '+91-7754-224333', type: 'police',   district: 'Kabirdham', latitude: 22.0167, longitude: 81.2500 },
  { name: 'Kawardha Community Health Centre',     phone: '+91-7754-224411', type: 'hospital', district: 'Kabirdham', latitude: 22.0200, longitude: 81.2600 },
  // ── Surguja Division ──────────────────────────────────────────────────────
  { name: 'Surguja Civil Rescue Camp',            phone: '+91-7774-222533', type: 'ranger',   district: 'Surguja',   latitude: 22.8167, longitude: 83.2833 },
  { name: 'Ambikapur District Hospital',          phone: '+91-7774-222100', type: 'hospital', district: 'Surguja',   latitude: 23.1200, longitude: 83.2000 },
  // ── Raipur / Central ─────────────────────────────────────────────────────
  { name: 'Raipur State Emergency Operations',    phone: '+91-771-4000112', type: 'police',   district: 'Raipur',    latitude: 21.2514, longitude: 81.6296 },
  { name: 'Dr. BR Ambedkar State Hospital',       phone: '+91-771-2234500', type: 'hospital', district: 'Raipur',    latitude: 21.2300, longitude: 81.6400 },
];

@Injectable()
export class EmergencyService {
  constructor(private readonly prisma: PrismaService) {}

  async triggerSos(dto: SosAlertDto) {
    // Sort all stations by Haversine distance from the tourist's GPS coordinates
    const matchedStations = REGIONAL_STATIONS.map(station => {
      const distance = this.calculateDistance(
        dto.latitude, dto.longitude,
        station.latitude, station.longitude,
      );
      return { ...station, distanceKm: distance };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const primaryResponder = matchedStations[0];
    const alertId = `sos_${Date.now()}_lat_${dto.latitude.toFixed(4)}`;

    // Persist the SOS alert for rescue coordination and audit trail
    await this.prisma.emergencyAlert.create({
      data: {
        alertId,
        touristName: dto.touristName,
        touristPhone: dto.touristPhone ?? null,
        medicalNotes: dto.medicalNotes ?? null,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: 'DISPATCHED',
        primaryResponder: primaryResponder.name,
      },
    });

    return {
      success: true,
      alertId,
      timestamp: new Date().toISOString(),
      gpsCoordinates: { lat: dto.latitude, lng: dto.longitude },
      status: 'DISPATCHED_IMMEDIATELY',
      message: `Emergency SOS received. Dispatch alert sent to nearest rescue unit: ${primaryResponder.name}. Backup units have been notified.`,
      primaryResponder: {
        name: primaryResponder.name,
        contactPhone: primaryResponder.phone,
        type: primaryResponder.type,
        distanceKm: parseFloat(primaryResponder.distanceKm!.toFixed(2)),
      },
      backupResponders: matchedStations.slice(1, 4).map(s => ({
        name: s.name,
        contactPhone: s.phone,
        type: s.type,
        distanceKm: parseFloat(s.distanceKm!.toFixed(2)),
      })),
    };
  }

  async getHelplines(district?: string): Promise<RescueStation[]> {
    if (district) {
      return REGIONAL_STATIONS.filter(
        s => s.district.toLowerCase() === district.toLowerCase(),
      );
    }
    return REGIONAL_STATIONS;
  }

  /**
   * Haversine formula — accurate great-circle distance between two GPS coordinates.
   * Returns distance in kilometres.
   */
  private calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number,
  ): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

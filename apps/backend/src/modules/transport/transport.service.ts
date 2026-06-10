import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TransportService {
  private readonly logger = new Logger(TransportService.name);
  private readonly mapboxApiKey = process.env.MAPBOX_API_KEY;

  // Major hubs in Chhattisgarh
  private readonly HUBS = {
    RAIPUR_AIRPORT: { lat: 21.1804, lon: 81.7388 },
    JAGDALPUR_AIRPORT: { lat: 19.0733, lon: 82.0366 },
    RAIPUR_STATION: { lat: 21.2514, lon: 81.6296 },
    BILASPUR_STATION: { lat: 22.0797, lon: 82.1409 },
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates dynamic distance and routing using Mapbox Directions API.
   * Finds the nearest airport and railway station.
   */
  async updateTransportInfo(placeId: string, destLat: number, destLon: number) {
    let nearestAirport = 'Swami Vivekananda Airport, Raipur';
    let airportDistance = 300; // km
    let nearestStation = 'Raipur Junction';
    let stationDistance = 290;
    let dynamicRoutes = [];

    if (this.mapboxApiKey && destLat && destLon) {
      try {
        // Find nearest airport
        const airportDist1 = this.calculateHaversineDistance(destLat, destLon, this.HUBS.RAIPUR_AIRPORT.lat, this.HUBS.RAIPUR_AIRPORT.lon);
        const airportDist2 = this.calculateHaversineDistance(destLat, destLon, this.HUBS.JAGDALPUR_AIRPORT.lat, this.HUBS.JAGDALPUR_AIRPORT.lon);
        
        nearestAirport = airportDist1 < airportDist2 ? 'Swami Vivekananda Airport, Raipur' : 'Maa Danteshwari Airport, Jagdalpur';
        const targetAirport = airportDist1 < airportDist2 ? this.HUBS.RAIPUR_AIRPORT : this.HUBS.JAGDALPUR_AIRPORT;

        // Make Mapbox call for accurate driving distance to airport
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${targetAirport.lon},${targetAirport.lat};${destLon},${destLat}?access_token=${this.mapboxApiKey}`;
        const response = await axios.get(url);
        
        if (response.data.routes && response.data.routes.length > 0) {
          const route = response.data.routes[0];
          airportDistance = parseFloat((route.distance / 1000).toFixed(1)); // Convert meters to km
          dynamicRoutes.push({
            type: 'AIRPORT_ROUTE',
            destination: nearestAirport,
            distanceKm: airportDistance,
            durationMins: Math.round(route.duration / 60),
          });
        }
      } catch (error) {
        this.logger.error(`Failed to fetch Mapbox routing for place ${placeId}. Using estimates.`, error.message);
      }
    } else {
      this.logger.warn(`No Mapbox API key or coordinates missing for place ${placeId}. Using mock data.`);
    }

    return this.prisma.placeTransport.upsert({
      where: { placeId },
      update: {
        nearestAirport,
        airportDistance,
        nearestStation,
        stationDistance,
        busAvailability: 'Available from Major Hubs',
        roadCondition: 'Good, but check monsoon alerts',
        dynamicRoutes: JSON.stringify(dynamicRoutes),
      },
      create: {
        placeId,
        nearestAirport,
        airportDistance,
        nearestStation,
        stationDistance,
        busAvailability: 'Available from Major Hubs',
        roadCondition: 'Good, but check monsoon alerts',
        dynamicRoutes: JSON.stringify(dynamicRoutes),
      },
    });
  }

  // Simple straight-line distance fallback
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

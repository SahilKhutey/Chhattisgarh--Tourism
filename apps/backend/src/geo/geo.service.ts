import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GeoRepository } from './geo.repository';
import { DistanceService } from './services/distance.service';
import { RoutingService } from './services/routing.service';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { BoundsQueryDto } from './dto/bounds-query.dto';
import { RouteQueryDto } from './dto/route-query.dto';

@Injectable()
export class GeoService {
  constructor(
    private readonly repository: GeoRepository,
    private readonly distanceService: DistanceService,
    private readonly routingService: RoutingService,
  ) {}

  async nearby(query: NearbyQueryDto) {
    this.distanceService.validateCoordinates({
      latitude: query.latitude,
      longitude: query.longitude,
    });

    const radiusMeters = query.radiusMeters ?? 10_000;
    const limit = query.limit ?? 100;

    if (radiusMeters <= 0) {
      throw new BadRequestException('radiusMeters must be greater than zero');
    }

    return this.repository.findNearbyPlaces(
      query.latitude,
      query.longitude,
      radiusMeters,
      limit,
    );
  }

  async bounds(query: BoundsQueryDto) {
    if (query.south > query.north) {
      throw new BadRequestException('south cannot be greater than north');
    }

    if (query.west > query.east) {
      throw new BadRequestException('west cannot be greater than east');
    }

    return this.repository.findPlacesInBounds(
      query.north,
      query.south,
      query.east,
      query.west,
      query.limit ?? 200,
    );
  }

  async route(query: RouteQueryDto) {
    return this.routingService.route(
      { latitude: query.originLat, longitude: query.originLng },
      { latitude: query.destLat, longitude: query.destLng },
    );
  }

  async getDivisions() {
    const divisions = await this.repository.findDivisions();
    return divisions.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      nameHi: d.nameHi,
      code: d.code,
      districtCount: d._count.districts,
    }));
  }

  async getDistricts(divisionId?: string) {
    const districts = await this.repository.findDistricts(divisionId);
    return districts.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      nameHi: d.nameHi,
      code: d.code,
      divisionId: d.divisionId,
      division: d.division,
      latitude: d.latitude ? Number(d.latitude) : null,
      longitude: d.longitude ? Number(d.longitude) : null,
      zoneCount: d._count.zones,
      placeCount: d._count.places,
    }));
  }

  async getDistrict(idOrSlug: string) {
    const district = await this.repository.findDistrictByIdOrSlug(idOrSlug);
    if (!district) {
      throw new NotFoundException(`District '${idOrSlug}' not found`);
    }
    return {
      ...district,
      latitude: district.latitude ? Number(district.latitude) : null,
      longitude: district.longitude ? Number(district.longitude) : null,
    };
  }

  async getZones(districtId: string) {
    const zones = await this.repository.findZonesByDistrict(districtId);
    return zones.map((z) => ({
      id: z.id,
      name: z.name,
      slug: z.slug,
      description: z.description,
      districtId: z.districtId,
      latitude: z.latitude ? Number(z.latitude) : null,
      longitude: z.longitude ? Number(z.longitude) : null,
      placeCount: z._count.places,
    }));
  }

  async getPlacesByZone(zoneId: string) {
    return this.repository.findPlacesByZone(zoneId);
  }
}

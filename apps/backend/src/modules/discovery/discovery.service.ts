import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SearchService } from './search/search.service';
import { GeoService } from './geo/geo.service';
import { SuggestionService, SuggestionItem } from './suggestions/suggestion.service';
import { DiscoveryIndexerService } from './indexer/discovery-indexer.service';
import { DiscoveryRepository } from './discovery.repository';
import { RankingService } from './ranking/ranking.service';
import { DiscoveryQueryDto } from './dto/discovery-query.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { MapQueryDto } from './dto/map-query.dto';

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly legacyRepo: DiscoveryRepository,
    private readonly indexer: DiscoveryIndexerService,
    private readonly ranking: RankingService,
    private readonly suggestions: SuggestionService,
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly searchService?: SearchService,
    @Optional() private readonly geoService?: GeoService,
  ) {}

  /**
   * Primary consumer discovery search across places, districts, categories, and coordinates
   */
  async search(params: DiscoveryQueryDto | any): Promise<any> {
    if (params.page !== undefined || params.templateId !== undefined || params.region !== undefined || !this.searchService) {
      // Legacy ContentEntry search path
      const { items, total } = await this.legacyRepo.search(params);
      const totalPages = Math.ceil(total / (params.limit ?? 20)) || 0;

      let mappedResults = items.map((item: any) => ({
        id: item.entry.id,
        templateId: item.templateId,
        templateName: item.entry.template?.name || '',
        templateSlug: item.entry.template?.slug || '',
        slug: item.entry.slug,
        title: item.title ?? '',
        data: (item.entry.data as Record<string, unknown>) || {},
        region: item.region,
        division: item.division,
        district: item.district,
        lat: item.lat,
        lng: item.lng,
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : null,
        score: params.q
          ? this.ranking.score(params.q, {
              title: item.title,
              searchableText: item.searchableText,
              tags: item.tags,
              publishedAt: item.publishedAt,
            })
          : undefined,
        publishedAt: item.publishedAt,
      }));

      if (params.q && params.q.trim()) {
        mappedResults = mappedResults.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0));
      }

      return {
        items: mappedResults,
        pagination: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          total,
          totalPages,
        },
        filters: {
          query: params.q,
          templateId: params.templateId,
          region: params.region,
          division: params.division,
          district: params.district,
        },
      };
    }

    return this.searchService.search(params);
  }

  /**
   * Nearby geographic discovery
   */
  async nearby(
    latOrParams: any,
    lng?: number,
    radiusKm?: number,
    limit?: number,
  ): Promise<any> {
    if (typeof latOrParams === 'number') {
      const lat = latOrParams;
      const longitude = lng ?? 0;
      const radius = (radiusKm ?? 25) * 1000;
      const maxLimit = limit ?? 50;

      if (this.geoService) {
        return this.geoService.nearby(lat, longitude, radius, maxLimit);
      }
      const results = await this.legacyRepo.findNearby(lat, longitude, radiusKm ?? 25, maxLimit);
      return results.map((item: any) => ({
        id: item.entry?.id ?? item.id,
        templateId: item.templateId,
        templateName: item.entry?.template?.name || '',
        templateSlug: item.entry?.template?.slug || '',
        slug: item.entry?.slug ?? item.slug,
        title: item.title ?? '',
        data: (item.entry?.data as Record<string, unknown>) || {},
        region: item.region,
        division: item.division,
        district: item.district,
        lat: item.lat,
        lng: item.lng,
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : null,
        publishedAt: item.publishedAt,
      }));
    }

    const lat = latOrParams.latitude ?? latOrParams.lat ?? 0;
    const longitude = latOrParams.longitude ?? latOrParams.lng ?? 0;
    const radius = latOrParams.radius ?? (latOrParams.radiusKm ? latOrParams.radiusKm * 1000 : 10000);
    const maxLimit = latOrParams.limit ?? 50;

    if (this.geoService) {
      return this.geoService.nearby(lat, longitude, radius, maxLimit);
    }
    const results = await this.legacyRepo.findNearby(lat, longitude, radius / 1000, maxLimit);
    return results.map((item: any) => ({
      id: item.entry?.id ?? item.id,
      templateId: item.templateId,
      templateName: item.entry?.template?.name || '',
      templateSlug: item.entry?.template?.slug || '',
      slug: item.entry?.slug ?? item.slug,
      title: item.title ?? '',
      data: (item.entry?.data as Record<string, unknown>) || {},
      region: item.region,
      division: item.division,
      district: item.district,
      lat: item.lat,
      lng: item.lng,
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : null,
      publishedAt: item.publishedAt,
    }));
  }

  /**
   * Map viewport discovery with bounds
   */
  async map(params: MapQueryDto) {
    if (this.geoService) {
      return this.geoService.mapViewport(
        params.north,
        params.south,
        params.east,
        params.west,
        params.zoom ?? 8,
        params.category,
        params.limit ?? 200,
      );
    }
    return [];
  }

  /**
   * Compatibility method for bounds
   */
  async bounds(
    north: number,
    south: number,
    east: number,
    west: number,
    limit = 100,
  ): Promise<any> {
    if (this.geoService) {
      return this.geoService.mapViewport(north, south, east, west, 8, undefined, limit);
    }
    const results = await this.legacyRepo.findInBounds(north, south, east, west, limit);
    return results.map((item: any) => ({
      id: item.entry?.id ?? item.id,
      templateId: item.templateId,
      templateName: item.entry?.template?.name || '',
      templateSlug: item.entry?.template?.slug || '',
      slug: item.entry?.slug ?? item.slug,
      title: item.title ?? '',
      data: (item.entry?.data as Record<string, unknown>) || {},
      region: item.region,
      division: item.division,
      district: item.district,
      lat: item.lat,
      lng: item.lng,
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : null,
      publishedAt: item.publishedAt,
    }));
  }

  /**
   * Fast search suggestions
   */
  async suggest(query: string, limit = 8): Promise<any> {
    if (this.prisma) {
      const structured = await this.suggestions.suggestStructured(query, limit);
      return { data: structured };
    }
    return this.suggestions.suggest(query, limit);
  }

  async suggestStructured(query: string, limit = 8): Promise<SuggestionItem[]> {
    return this.suggestions.suggestStructured(query, limit);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GEOGRAPHIC EXPLORATION APIS
  // ─────────────────────────────────────────────────────────────────────────

  async getDivisions() {
    if (!this.prisma) return [];
    return this.prisma.division.findMany({
      include: {
        districts: {
          select: {
            id: true,
            name: true,
            slug: true,
            code: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getDistricts() {
    if (!this.prisma) return [];
    return this.prisma.district.findMany({
      include: {
        division: true,
        zones: true,
        places: {
          where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
          select: { id: true, name: true, slug: true, heroImage: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getDistrict(slug: string) {
    if (!this.prisma) throw new NotFoundException(`District with slug '${slug}' not found`);
    const district = await this.prisma.district.findUnique({
      where: { slug },
      include: {
        division: true,
        zones: {
          include: {
            routes: true,
          },
        },
        places: {
          where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
          include: {
            experiences: { where: { isActive: true } },
            services: { where: { isActive: true } },
            safety: true,
          },
        },
      },
    });

    if (!district) {
      throw new NotFoundException(`District with slug '${slug}' not found`);
    }

    return district;
  }

  async getZone(slug: string) {
    if (!this.prisma) throw new NotFoundException(`Tourism zone with slug '${slug}' not found`);
    const zone = await this.prisma.touristZone.findUnique({
      where: { slug },
      include: {
        district: true,
        routes: {
          include: {
            places: {
              include: {
                place: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    latitude: true,
                    longitude: true,
                    heroImage: true,
                  },
                },
              },
            },
          },
        },
        places: {
          where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
          include: {
            experiences: true,
            safety: true,
          },
        },
      },
    });

    if (!zone) {
      throw new NotFoundException(`Tourism zone with slug '${slug}' not found`);
    }

    return zone;
  }

  async getCategory(slug: string) {
    if (!this.prisma) throw new NotFoundException(`Category with slug '${slug}' not found`);
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        places: {
          where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
          include: {
            districtRel: true,
          },
        },
        placeCategories: {
          include: {
            place: {
              include: {
                districtRel: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    return category;
  }

  async getRoute(slug: string) {
    if (!this.prisma) throw new NotFoundException(`Route with slug '${slug}' not found`);
    const route = await this.prisma.route.findUnique({
      where: { slug },
      include: {
        zone: true,
        places: {
          orderBy: { sequence: 'asc' },
          include: {
            place: {
              include: {
                districtRel: true,
                safety: true,
              },
            },
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with slug '${slug}' not found`);
    }

    return route;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INDEXER COMPATIBILITY
  // ─────────────────────────────────────────────────────────────────────────

  async index(entryId: string): Promise<void> {
    return this.indexer.indexEntry(entryId);
  }

  async rebuild(): Promise<{ processed: number; indexed: number; failed: number }> {
    return this.indexer.rebuild();
  }
}

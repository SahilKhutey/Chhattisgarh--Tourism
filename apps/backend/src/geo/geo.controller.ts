import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GeoService } from './geo.service';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { BoundsQueryDto } from './dto/bounds-query.dto';
import { RouteQueryDto } from './dto/route-query.dto';

@ApiTags('Geospatial & Regional Intelligence')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Find verified destinations within radius (PostGIS ST_DWithin)' })
  nearby(@Query() query: NearbyQueryDto) {
    return this.geoService.nearby(query);
  }

  @Get('bounds')
  @ApiOperation({ summary: 'Find verified destinations within map viewport bounding box' })
  bounds(@Query() query: BoundsQueryDto) {
    return this.geoService.bounds(query);
  }

  @Get('route')
  @ApiOperation({ summary: 'Calculate road routing geometry between origin and destination' })
  route(@Query() query: RouteQueryDto) {
    return this.geoService.route(query);
  }

  @Get('divisions')
  @ApiOperation({ summary: 'List all 5 official Chhattisgarh revenue divisions' })
  getDivisions() {
    return this.geoService.getDivisions();
  }

  @Get('divisions/:divisionId/districts')
  @ApiOperation({ summary: 'List official districts in a revenue division' })
  getDistrictsByDivision(@Param('divisionId') divisionId: string) {
    return this.geoService.getDistricts(divisionId);
  }

  @Get('districts')
  @ApiOperation({ summary: 'List all 33 official Chhattisgarh districts' })
  getDistricts() {
    return this.geoService.getDistricts();
  }

  @Get('districts/:districtId')
  @ApiOperation({ summary: 'Get district profile by ID or slug' })
  getDistrict(@Param('districtId') districtId: string) {
    return this.geoService.getDistrict(districtId);
  }

  @Get('districts/:districtId/zones')
  @ApiOperation({ summary: 'List tourist zones in an administrative district' })
  getZones(@Param('districtId') districtId: string) {
    return this.geoService.getZones(districtId);
  }

  @Get('zones/:zoneId/places')
  @ApiOperation({ summary: 'List destinations in a tourist corridor zone' })
  getPlacesByZone(@Param('zoneId') zoneId: string) {
    return this.geoService.getPlacesByZone(zoneId);
  }
}

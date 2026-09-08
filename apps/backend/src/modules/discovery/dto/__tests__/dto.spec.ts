import 'reflect-metadata';
import { validate } from 'class-validator';
import { SearchDto } from '../search.dto';
import { NearbyDto } from '../nearby.dto';
import { BoundsDto } from '../bounds.dto';

describe('Discovery DTOs', () => {
  describe('SearchDto', () => {
    it('accepts default values', async () => {
      const dto = new SearchDto();
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(20);
    });

    it('rejects invalid limit', async () => {
      const dto = new SearchDto();
      dto.limit = 500; // max is 100
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('NearbyDto', () => {
    it('validates correct latitude and longitude', async () => {
      const dto = new NearbyDto();
      dto.lat = 21.25;
      dto.lng = 81.63;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.radiusKm).toBe(25);
    });

    it('rejects out of bounds coordinates', async () => {
      const dto = new NearbyDto();
      dto.lat = 150; // invalid latitude
      dto.lng = 81.63;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'lat')).toBe(true);
    });
  });

  describe('BoundsDto', () => {
    it('accepts valid bounding box', async () => {
      const dto = new BoundsDto();
      dto.north = 24.1;
      dto.south = 17.7;
      dto.east = 84.4;
      dto.west = 80.2;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('rejects invalid longitude', async () => {
      const dto = new BoundsDto();
      dto.north = 24.1;
      dto.south = 17.7;
      dto.east = 200; // invalid longitude
      dto.west = 80.2;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'east')).toBe(true);
    });
  });
});

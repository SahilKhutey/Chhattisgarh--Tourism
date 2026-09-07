import { Injectable } from '@nestjs/common';
import { GEO } from '../geo.constants';

@Injectable()
export class BoundaryService {
  /**
   * Coarse bounding envelope guard for Chhattisgarh state.
   * Covers all 33 districts from Sukma in the south to Balrampur in the north.
   */
  isInsideChhattisgarh(latitude: number, longitude: number): boolean {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return false;
    }

    return (
      latitude >= GEO.CG_BOUNDS.MIN_LATITUDE &&
      latitude <= GEO.CG_BOUNDS.MAX_LATITUDE &&
      longitude >= GEO.CG_BOUNDS.MIN_LONGITUDE &&
      longitude <= GEO.CG_BOUNDS.MAX_LONGITUDE
    );
  }
}

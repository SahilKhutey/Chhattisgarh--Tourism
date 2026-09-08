import { FieldType } from '../src/schema/types';
import {
  AdministrativeRegionValue,
  GeoPointValue,
  GeoRouteValue,
} from '../src/geo/types';
import { FieldTypeRegistry } from '../src/field-types/registry';
import { FieldTypeDefinition } from '../src/field-types/contract';
import { createInvalidResult, createValidResult } from '../src/validation/errors';

describe('Geographic First-Class Capability Contracts', () => {
  let registry: FieldTypeRegistry;

  const geoPointHandler: FieldTypeDefinition<
    { requireElevation?: boolean },
    GeoPointValue
  > = {
    type: FieldType.GEO_POINT,
    validateOptions: () => createValidResult(),
    validateValue: (val) => {
      if (!val || typeof val !== 'object') {
        return createInvalidResult([
          {
            fieldKey: '',
            code: 'INVALID_GEO_POINT',
            message: 'Must be an object with lat and lng.',
          },
        ]);
      }
      const p = val as Partial<GeoPointValue>;
      if (typeof p.lat !== 'number' || p.lat < -90 || p.lat > 90) {
        return createInvalidResult([
          { fieldKey: '', code: 'INVALID_LATITUDE', message: 'Latitude must be between -90 and 90.' },
        ]);
      }
      if (typeof p.lng !== 'number' || p.lng < -180 || p.lng > 180) {
        return createInvalidResult([
          { fieldKey: '', code: 'INVALID_LONGITUDE', message: 'Longitude must be between -180 and 180.' },
        ]);
      }
      return createValidResult();
    },
    serialize: (v) => v,
    deserialize: (v) => v as GeoPointValue,
    getDefaultValue: () => ({ lat: 21.2514, lng: 81.6296 }), // Raipur baseline
    getEditorMetadata: () => ({
      component: 'MapCoordinatePicker',
      category: 'geography',
    }),
    getDisplayMetadata: () => ({ component: 'InteractiveMapMarker' }),
  };

  const adminRegionHandler: FieldTypeDefinition<
    { stateFixed?: boolean },
    AdministrativeRegionValue
  > = {
    type: FieldType.ADMINISTRATIVE_REGION,
    validateOptions: () => createValidResult(),
    validateValue: (val) => {
      if (!val || typeof val !== 'object') {
        return createInvalidResult([
          { fieldKey: '', code: 'INVALID_REGION', message: 'Administrative region must be an object.' },
        ]);
      }
      const r = val as Partial<AdministrativeRegionValue>;
      if (!r.district || typeof r.district !== 'string') {
        return createInvalidResult([
          { fieldKey: '', code: 'DISTRICT_REQUIRED', message: 'District is required.' },
        ]);
      }
      return createValidResult();
    },
    serialize: (v) => v,
    deserialize: (v) => v as AdministrativeRegionValue,
    getDefaultValue: () => ({ state: 'Chhattisgarh', district: 'Bastar' }),
    getEditorMetadata: () => ({
      component: 'DistrictHierarchyDropdown',
      category: 'geography',
    }),
    getDisplayMetadata: () => ({ component: 'BreadcrumbRegionDisplay' }),
  };

  beforeEach(() => {
    registry = new FieldTypeRegistry();
    registry.register(geoPointHandler);
    registry.register(adminRegionHandler);
  });

  it('should validate valid coordinates for Chitrakote Falls', () => {
    const chitrakoteCoords: GeoPointValue = {
      lat: 19.2036,
      lng: 81.7011,
      altitudeM: 560,
    };

    const handler = registry.getOrThrow<unknown, GeoPointValue>(FieldType.GEO_POINT);
    const result = handler.validateValue(chitrakoteCoords, {});
    expect(result.valid).toBe(true);
  });

  it('should reject invalid out-of-bounds latitude coordinates', () => {
    const handler = registry.getOrThrow(FieldType.GEO_POINT);
    const result = handler.validateValue({ lat: 105.5, lng: 81.7 }, {});
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_LATITUDE');
  });

  it('should validate administrative region hierarchy in Bastar division', () => {
    const bastarRegion: AdministrativeRegionValue = {
      state: 'Chhattisgarh',
      division: 'Bastar',
      district: 'Bastar',
      tehsil: 'Jagdalpur',
      locality: 'Chitrakote',
    };

    const handler = registry.getOrThrow<unknown, AdministrativeRegionValue>(
      FieldType.ADMINISTRATIVE_REGION,
    );
    const result = handler.validateValue(bastarRegion, {});
    expect(result.valid).toBe(true);
  });

  it('should model GeoRouteValue for Keshkal Ghat heritage corridor', () => {
    const keshkalPassRoute: GeoRouteValue = {
      geometry: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
      distanceKm: 42.8,
      durationMinutes: 65,
      elevationGainM: 450,
      waypoints: [
        { name: 'Keshkal Base', point: { lat: 20.08, lng: 81.59 }, order: 1 },
        { name: 'Ghat Summit Viewpoint', point: { lat: 20.12, lng: 81.61 }, order: 2 },
      ],
    };

    expect(keshkalPassRoute.distanceKm).toBe(42.8);
    expect(keshkalPassRoute.waypoints).toHaveLength(2);
    expect(keshkalPassRoute.waypoints![1].name).toBe('Ghat Summit Viewpoint');
  });
});

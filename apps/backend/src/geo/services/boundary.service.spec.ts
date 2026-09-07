import { BoundaryService } from './boundary.service';

describe('BoundaryService', () => {
  let service: BoundaryService;

  beforeEach(() => {
    service = new BoundaryService();
  });

  it('accepts a coordinate inside the coarse state envelope', () => {
    expect(service.isInsideChhattisgarh(21.25, 81.63)).toBe(true);
  });

  it('accepts Bastar coordinates in southern CG', () => {
    expect(service.isInsideChhattisgarh(19.07, 82.03)).toBe(true);
  });

  it('accepts Surguja coordinates in northern CG', () => {
    expect(service.isInsideChhattisgarh(23.12, 83.20)).toBe(true);
  });

  it('rejects clearly invalid latitude', () => {
    expect(service.isInsideChhattisgarh(50, 81)).toBe(false);
  });

  it('rejects clearly invalid longitude', () => {
    expect(service.isInsideChhattisgarh(21, 100)).toBe(false);
  });

  it('rejects coordinates with NaN values', () => {
    expect(service.isInsideChhattisgarh(NaN, 81)).toBe(false);
    expect(service.isInsideChhattisgarh(21, NaN)).toBe(false);
  });
});

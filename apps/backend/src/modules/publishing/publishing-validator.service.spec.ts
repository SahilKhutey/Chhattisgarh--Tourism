import { PublishingValidatorService } from './publishing-validator.service';

describe('PublishingValidatorService', () => {
  const service = new PublishingValidatorService();

  it('accepts a valid place within Chhattisgarh bounds', () => {
    expect(
      service.validatePlace({
        name: 'Chitrakote Falls',
        slug: 'chitrakote-falls',
        latitude: 19.2024,
        longitude: 81.7067,
        categories: [{ id: 'cat-1' }],
        description: 'Spectacular horseshoe cascade on Indravati river.',
      }),
    ).toBe(true);
  });

  it('rejects invalid latitude', () => {
    expect(() =>
      service.validatePlace({
        name: 'Invalid Lat Place',
        slug: 'invalid-lat',
        latitude: 100,
        longitude: 81.63,
        categories: [{ id: 'cat-1' }],
        description: 'Test description',
      }),
    ).toThrow('Invalid latitude');
  });

  it('rejects invalid longitude', () => {
    expect(() =>
      service.validatePlace({
        name: 'Invalid Lng Place',
        slug: 'invalid-lng',
        latitude: 21.25,
        longitude: 200,
        categories: [{ id: 'cat-1' }],
        description: 'Test description',
      }),
    ).toThrow('Invalid longitude');
  });

  it('rejects coordinates outside Chhattisgarh bounds', () => {
    expect(() =>
      service.validatePlace({
        name: 'Mumbai Place',
        slug: 'mumbai-place',
        latitude: 19.076,
        longitude: 72.8777, // Mumbai
        categories: [{ id: 'cat-1' }],
        description: 'Outside CG boundary',
      }),
    ).toThrow('Coordinates outside Chhattisgarh regional boundary');
  });

  it('rejects missing categories', () => {
    expect(() =>
      service.validatePlace({
        name: 'No Category Place',
        slug: 'no-category',
        latitude: 21.25,
        longitude: 81.63,
        categories: [],
        description: 'Test description',
      }),
    ).toThrow('At least one category is required');
  });

  it('rejects missing name', () => {
    expect(() =>
      service.validatePlace({
        name: '   ',
        slug: 'no-name',
        latitude: 21.25,
        longitude: 81.63,
        categories: [{ id: 'cat-1' }],
        description: 'Test description',
      }),
    ).toThrow('Place name is required');
  });

  it('rejects missing description', () => {
    expect(() =>
      service.validatePlace({
        name: 'Valid Name',
        slug: 'valid-slug',
        latitude: 21.25,
        longitude: 81.63,
        categories: [{ id: 'cat-1' }],
        description: '',
      }),
    ).toThrow('Description is required');
  });
});

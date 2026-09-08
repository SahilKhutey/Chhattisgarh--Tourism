import { BadRequestException } from '@nestjs/common';
import { EntryValidatorService } from '../entry-validator.service';

describe('EntryValidatorService', () => {
  let service: EntryValidatorService;

  beforeEach(() => {
    service = new EntryValidatorService();
  });

  it('accepts valid required text', () => {
    expect(() =>
      service.validate(
        [
          {
            key: 'title',
            label: 'Title',
            fieldType: 'TEXT',
            required: true,
          } as any,
        ],
        {
          title: 'Waterfall',
        },
      ),
    ).not.toThrow();
  });

  it('rejects missing required field', () => {
    expect(() =>
      service.validate(
        [
          {
            key: 'title',
            label: 'Title',
            fieldType: 'TEXT',
            required: true,
          } as any,
        ],
        {},
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects invalid number', () => {
    expect(() =>
      service.validate(
        [
          {
            key: 'height',
            label: 'Height',
            fieldType: 'NUMBER',
            required: true,
          } as any,
        ],
        {
          height: '100',
        },
      ),
    ).toThrow(BadRequestException);
  });

  it('accepts valid geo point', () => {
    expect(() =>
      service.validate(
        [
          {
            key: 'location',
            label: 'Location',
            fieldType: 'GEO_POINT',
            required: true,
          } as any,
        ],
        {
          location: {
            lat: 22,
            lng: 82,
          },
        },
      ),
    ).not.toThrow();
  });

  it('rejects invalid latitude', () => {
    expect(() =>
      service.validate(
        [
          {
            key: 'location',
            label: 'Location',
            fieldType: 'GEO_POINT',
            required: true,
          } as any,
        ],
        {
          location: {
            lat: 100,
            lng: 82,
          },
        },
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects invalid longitude', () => {
    expect(() =>
      service.validate(
        [
          {
            key: 'location',
            label: 'Location',
            fieldType: 'GEO_POINT',
            required: true,
          } as any,
        ],
        {
          location: {
            lat: 22,
            lng: 200,
          },
        },
      ),
    ).toThrow(BadRequestException);
  });
});

import {
  getSocialHomePath,
  getSocialFeedPath,
  getSocialContentPath,
  getSocialCreatorsIndexPath,
  getSocialCreatorPath,
  getSocialDistrictPath,
  getSocialPlacePath,
  getTourismDestinationPath,
  getTourismItineraryPath,
  buildSocialFeedUrl,
} from '../navigation';

describe('Social Engine Phase 8 Navigation Helpers', () => {
  it('returns canonical social home path', () => {
    expect(getSocialHomePath()).toBe('/social');
  });

  it('builds feed paths with query filters', () => {
    expect(getSocialFeedPath()).toBe('/social/feed');
    expect(
      getSocialFeedPath({
        tab: 'reel',
        platform: 'INSTAGRAM',
        district: 'bastar',
      })
    ).toBe('/social/feed?tab=reel&platform=instagram&district=bastar');
  });

  it('encodes content and creator paths properly', () => {
    expect(getSocialContentPath('sc-yt-123')).toBe('/social/content/sc-yt-123');
    expect(getSocialCreatorsIndexPath()).toBe('/social/creators');
    expect(getSocialCreatorPath('@bastar_explorer')).toBe('/social/creators/bastar_explorer');
    expect(getSocialDistrictPath('bastar')).toBe('/social/districts/bastar');
    expect(getSocialPlacePath('chitrakote-falls')).toBe('/social/places/chitrakote-falls');
  });

  it('generates tourism graph and itinerary paths', () => {
    expect(getTourismDestinationPath('chitrakote')).toBe('/destinations/chitrakote');
    expect(getTourismItineraryPath()).toBe('/itineraries');
    expect(getTourismItineraryPath('bastar')).toBe('/itineraries?destination=bastar');
  });

  it('filters out empty or default parameters in URL builder', () => {
    const url = buildSocialFeedUrl({
      tab: 'all',
      district: 'surguja',
      emptyParam: undefined,
      nullParam: null,
      blankParam: '',
    });
    expect(url).toBe('/social/feed?district=surguja');
  });
});

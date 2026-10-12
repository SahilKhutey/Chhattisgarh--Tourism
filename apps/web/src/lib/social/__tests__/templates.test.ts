import {
  STANDARD_SOCIAL_FEED,
  MASONRY_SOCIAL_FEED,
  FEATURED_GRID_FEED,
  REGIONAL_SHOWCASE_FEED,
  COMPACT_GRID_FEED,
  getSocialTemplate,
} from '../templates';

describe('SocialFeedTemplate Resolver', () => {
  it('resolves standard-grid template correctly', () => {
    const template = getSocialTemplate('standard-grid');
    expect(template.id).toBe(STANDARD_SOCIAL_FEED.id);
    expect(template.layout).toBe('standard-grid');
    expect(template.columns.mobile).toBe(2);
    expect(template.columns.desktop).toBe(4);
    expect(template.interaction.openMode).toBe('original-source');
  });

  it('resolves masonry template correctly', () => {
    const template = getSocialTemplate('masonry');
    expect(template.id).toBe(MASONRY_SOCIAL_FEED.id);
    expect(template.layout).toBe('masonry');
    expect(template.card.showDescription).toBe(true);
  });

  it('resolves featured-grid template correctly', () => {
    const template = getSocialTemplate('featured-grid');
    expect(template.id).toBe(FEATURED_GRID_FEED.id);
    expect(template.layout).toBe('featured-grid');
  });

  it('resolves regional-showcase template correctly', () => {
    const template = getSocialTemplate('regional-showcase');
    expect(template.id).toBe(REGIONAL_SHOWCASE_FEED.id);
    expect(template.layout).toBe('regional-showcase');
  });

  it('resolves compact-grid template correctly', () => {
    const template = getSocialTemplate('compact-grid');
    expect(template.id).toBe(COMPACT_GRID_FEED.id);
    expect(template.layout).toBe('compact-grid');
    expect(template.columns.desktop).toBe(3);
  });

  it('falls back safely to standard-grid when given invalid or null template', () => {
    const fallbackNull = getSocialTemplate(null);
    expect(fallbackNull.id).toBe(STANDARD_SOCIAL_FEED.id);

    const fallbackInvalid = getSocialTemplate('unknown-nonexistent-layout');
    expect(fallbackInvalid.id).toBe(STANDARD_SOCIAL_FEED.id);
  });
});

import {
  getSocialFeed,
  getSocialContentById,
  getCreatorFeed,
  getDistrictSocialFeed,
  getPlaceSocialFeed,
  getPublicCreators,
} from '../api';

describe('Social API Client', () => {
  it('loads default social feed with regional content items', async () => {
    const res = await getSocialFeed({ limit: 5 });
    expect(res).toBeDefined();
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.length).toBeLessThanOrEqual(5);

    const first = res.items[0];
    expect(first.title).toBeDefined();
    expect(first.source_url).toBeDefined();
    expect(first.district_id).toBeDefined();
  });

  it('filters by platform correctly', async () => {
    const igRes = await getSocialFeed({ platform: 'INSTAGRAM' });
    expect(igRes.items.length).toBeGreaterThan(0);
    for (const item of igRes.items) {
      expect(item.provider?.toUpperCase()).toBe('INSTAGRAM');
    }

    const ytRes = await getSocialFeed({ platform: 'YOUTUBE' });
    expect(ytRes.items.length).toBeGreaterThan(0);
    for (const item of ytRes.items) {
      expect(item.provider?.toUpperCase()).toBe('YOUTUBE');
    }
  });

  it('filters by content type correctly', async () => {
    const reelRes = await getSocialFeed({ contentType: 'REEL' });
    expect(reelRes.items.length).toBeGreaterThan(0);
    for (const item of reelRes.items) {
      expect(item.content_type.toUpperCase()).toBe('REEL');
    }
  });

  it('filters by district correctly', async () => {
    const bastarRes = await getDistrictSocialFeed('bastar');
    expect(bastarRes.items.length).toBeGreaterThan(0);
    for (const item of bastarRes.items) {
      expect(item.district_id.toLowerCase()).toBe('bastar');
    }
  });

  it('filters by place slug correctly', async () => {
    const placeRes = await getPlaceSocialFeed('chitrakote-falls');
    expect(placeRes.items.length).toBeGreaterThan(0);
    for (const item of placeRes.items) {
      expect(item.place_slug).toBe('chitrakote-falls');
    }
  });

  it('fetches single content by id and maintains source URL', async () => {
    const item = await getSocialContentById('sc-101-chitrakote-monsoon');
    expect(item).toBeDefined();
    expect(item.id).toBe('sc-101-chitrakote-monsoon');
    expect(item.place_name).toBe('Chitrakote Falls');
    expect(item.source_url).toContain('instagram.com');
  });

  it('fetches creator feed by handle', async () => {
    const res = await getCreatorFeed('bastartrails');
    expect(res.items.length).toBeGreaterThan(0);
    for (const item of res.items) {
      expect(item.creator?.handle).toBe('bastartrails');
    }
  });

  it('fetches verified regional creators', async () => {
    const creators = await getPublicCreators();
    expect(creators.length).toBeGreaterThan(0);
    for (const c of creators) {
      expect(c.is_verified).toBe(true);
      expect(c.handle).toBeDefined();
    }
  });
});

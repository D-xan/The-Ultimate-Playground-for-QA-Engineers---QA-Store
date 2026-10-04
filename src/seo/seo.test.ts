import { describe, it, expect } from 'vitest';
import { seoIdForPath, buildHead, screenshotFor } from './seo';
import { challenges } from '@/data/challenges';
import { SITE_URL } from '@/config/site';
import seo from '@/data/seo.json';

describe('seoIdForPath', () => {
  it('maps the home, hub and every registry page', () => {
    expect(seoIdForPath('/')).toBe('home');
    expect(seoIdForPath('/practice')).toBe('practice');
    expect(seoIdForPath('/practice/')).toBe('practice');
    for (const c of challenges) expect(seoIdForPath(`/practice/${c.id}`)).toBe(c.id);
  });
  it('returns null for pages that should not be indexed', () => {
    for (const p of ['/cart', '/login', '/admin', '/popup/approve', '/practice/nope']) expect(seoIdForPath(p)).toBeNull();
  });
});

describe('buildHead', () => {
  it('has SEO copy for every page', () => {
    for (const c of challenges) expect(Object.keys(seo)).toContain(c.id);
  });

  it('gives each practice page its own canonical, image and structured data', () => {
    const h = buildHead('/practice/windows');
    expect(h.canonical).toBe(`${SITE_URL}practice/windows`);
    expect(h.robots).toBe('index, follow');
    expect(h.image).toBe(`${SITE_URL}og/windows.png`);
    expect(h.title.length).toBeLessThanOrEqual(60);
    const types = h.jsonLd.map((j) => j['@type']);
    expect(types).toEqual(expect.arrayContaining(['LearningResource', 'BreadcrumbList', 'FAQPage']));
  });

  it('marks non-SEO pages noindex and points them at the home canonical', () => {
    const h = buildHead('/cart');
    expect(h.robots).toBe('noindex, follow');
    expect(h.jsonLd).toEqual([]);
  });

  it('home is the bare site URL with WebSite data', () => {
    const h = buildHead('/');
    expect(h.canonical).toBe(SITE_URL);
    expect(h.jsonLd.map((j) => j['@type'])).toContain('WebSite');
  });
});

describe('page screenshots', () => {
  it('every practice page and tool has a screenshot with a descriptive file name, alt text and an ImageObject', () => {
    for (const c of challenges) {
      const shot = screenshotFor(c.id);
      expect(shot, c.id).not.toBeNull();
      expect(shot!.url).toMatch(new RegExp(`^${SITE_URL}shots/[a-z0-9-]+\\.webp$`));
      expect(shot!.alt).toContain(c.label);
      const img = buildHead(`/practice/${c.id}`).jsonLd.find((j) => j['@type'] === 'ImageObject');
      expect(img?.contentUrl).toBe(shot!.url);
      expect(img?.width).toBe(1200);
    }
  });
});

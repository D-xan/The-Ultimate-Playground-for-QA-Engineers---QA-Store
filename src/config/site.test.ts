import { describe, it, expect } from 'vitest';
import { SITE_URL } from './site';

const HOSTS = ['qa.randomly.online', 'd-xan.github.io'];
const sources = import.meta.glob(['/src/**/*', '/index.html', '!/src/config/site.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

describe('site URL', () => {
  it('is an absolute https URL ending in a slash', () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+\/(.+\/)?$/);
  });

  it('is only written down once (.env), so the domain switch is a one-line change', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(50);
    const offenders = Object.entries(sources)
      .filter(([, text]) => HOSTS.some((h) => text.includes(h)))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });
});

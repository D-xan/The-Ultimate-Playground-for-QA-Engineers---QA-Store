import { describe, it, expect } from 'vitest';
import { linkedInShareUrl } from './badge';
import { SITE_URL } from '@/config/site';

describe('badge', () => {
  it('pre-fills a LinkedIn post that names the count and links the practice hub', () => {
    const url = new URL(linkedInShareUrl(23));
    expect(url.origin + url.pathname).toBe('https://www.linkedin.com/feed/');
    expect(url.searchParams.get('shareActive')).toBe('true');
    const text = url.searchParams.get('text') ?? '';
    expect(text).toContain('all 23 QA automation practice challenges');
    expect(text.endsWith(`${SITE_URL}practice`)).toBe(true);
  });
});

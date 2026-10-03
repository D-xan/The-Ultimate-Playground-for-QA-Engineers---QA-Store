import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { buildHead, SITE_NAME } from './seo';

function upsert(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const meta = (key: 'name' | 'property', name: string, content: string) =>
  upsert(`meta[${key}="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(key, name);
    return m;
  }, 'content', content);

/** Keeps title, meta, canonical, Open Graph and JSON-LD in step with the current route (also captured by the prerender). */
export function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const h = buildHead(pathname);
    document.title = h.title;
    meta('name', 'description', h.description);
    meta('name', 'robots', h.robots);
    upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.rel = 'canonical';
      return l;
    }, 'href', h.canonical);
    meta('property', 'og:type', h.ogType);
    meta('property', 'og:site_name', SITE_NAME);
    meta('property', 'og:title', h.title);
    meta('property', 'og:description', h.description);
    meta('property', 'og:url', h.canonical);
    meta('property', 'og:image', h.image);
    meta('property', 'og:image:width', '1200');
    meta('property', 'og:image:height', '630');
    meta('property', 'og:image:alt', h.imageAlt);
    meta('name', 'twitter:card', 'summary_large_image');
    meta('name', 'twitter:title', h.title);
    meta('name', 'twitter:description', h.description);
    meta('name', 'twitter:image', h.image);
    meta('name', 'twitter:image:alt', h.imageAlt);
    document.head.querySelectorAll('script[type="application/ld+json"]').forEach((s) => s.remove());
    for (const data of h.jsonLd) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
    }
  }, [pathname]);

  return null;
}

import { challenges } from '@/data/challenges';
import { SITE_URL } from '@/config/site';
import seoData from '@/data/seo.json';
import screenshotData from '@/data/screenshots.json';

export interface PageSeo {
  title: string;
  metaDescription: string;
  h1Subtitle: string;
  answer: string;
  faqs: { q: string; a: string }[];
  ogHeadline: string;
  ogSubline: string;
  imageAlt: string;
  relatedIds: string[];
  schemaType: string;
  primaryKeyword: string;
}

export const SEO = seoData as Record<string, PageSeo>;
export const SITE_NAME = 'QA Playground';
export const PARENT_SITE = { name: 'Randomly.online', url: 'https://randomly.online/' };

const byId = new Map(challenges.map((c) => [c.id, c]));
/** About, legal and contact pages: indexed, served at /<id>. */
export const INFO_IDS = ['about', 'privacy-policy', 'terms-of-service', 'contact'];

/** The SEO entry for a path, or null for pages that should stay out of search (store, admin, popups). */
export function seoIdForPath(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return 'home';
  if (path === '/practice') return 'practice';
  if (INFO_IDS.includes(path.slice(1))) return path.slice(1);
  const m = path.match(/^\/practice\/([^/]+)$/);
  return m && byId.has(m[1]) && SEO[m[1]] ? m[1] : null;
}

export function pathForId(id: string): string {
  return id === 'home' ? '' : id === 'practice' || INFO_IDS.includes(id) ? id : `practice/${id}`;
}

export const urlForId = (id: string) => SITE_URL + pathForId(id);

export interface Screenshot { url: string; path: string; alt: string; caption: string; width: number; height: number }
const SHOTS = screenshotData as Record<string, { file: string; width: number; height: number }>;

/** The page's own screenshot (written by scripts/captureScreenshots.mjs), or null. `path` is relative to the build base. */
export function screenshotFor(id: string): Screenshot | null {
  const shot = SHOTS[id];
  if (!shot) return null;
  const c = byId.get(id);
  const caption = c ? `${c.label}: ${c.desc}.` : SEO[id].h1Subtitle;
  const alt = c ? `Screenshot of the ${c.label} ${c.kind === 'tool' ? 'tool' : 'practice page'} on QA Playground. ${c.desc}.` : `Screenshot of the QA Playground practice hub. ${SEO[id].h1Subtitle}`;
  return { url: `${SITE_URL}shots/${shot.file}`, path: `shots/${shot.file}`, alt, caption, width: shot.width, height: shot.height };
}

function imageObject(shot: Screenshot): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: shot.url,
    url: shot.url,
    caption: shot.caption,
    description: shot.alt,
    width: shot.width,
    height: shot.height,
    encodingFormat: 'image/webp',
    creditText: SITE_NAME,
    creator: provider,
    copyrightNotice: PARENT_SITE.name,
  };
}

type JsonLd = Record<string, unknown>;

export interface Head {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  image: string;
  imageAlt: string;
  ogType: string;
  jsonLd: JsonLd[];
}

const provider = { '@type': 'Organization', name: PARENT_SITE.name, url: PARENT_SITE.url };
const author = { '@type': 'Person', name: 'Dhruba Singha Roy', url: 'https://randomly.online/dhruba-singha-roy' };
/** Set by vite.config.ts at build time; the sitemap's lastmod uses the same date. */
const dateModified = import.meta.env.VITE_BUILD_DATE as string | undefined;

function breadcrumbs(id: string): JsonLd {
  const items = [{ name: SITE_NAME, url: SITE_URL }];
  if (INFO_IDS.includes(id)) items.push({ name: SEO[id].ogHeadline, url: urlForId(id) });
  else if (id !== 'home') items.push({ name: 'Practice', url: urlForId('practice') });
  if (id !== 'home' && id !== 'practice' && !INFO_IDS.includes(id)) items.push({ name: byId.get(id)?.label ?? id, url: urlForId(id) });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

function faqPage(s: PageSeo): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: s.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

function mainEntity(id: string, s: PageSeo, url: string, image: string | string[]): JsonLd {
  const base = { '@context': 'https://schema.org', name: s.title.replace(/ \| QA Playground$/, ''), description: s.metaDescription, url, image, isAccessibleForFree: true, inLanguage: 'en', provider };
  if (id === 'home') {
    return { ...base, '@type': 'WebSite', name: SITE_NAME, publisher: provider };
  }
  if (id === 'practice') {
    return {
      ...base,
      '@type': 'CollectionPage',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: challenges.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, url: urlForId(c.id) })),
      },
    };
  }
  if (INFO_IDS.includes(id)) {
    return { '@context': 'https://schema.org', '@type': s.schemaType, name: s.title, description: s.metaDescription, url, inLanguage: 'en', publisher: provider };
  }
  const c = byId.get(id);
  if (c?.kind === 'tool') {
    return { ...base, author, ...(dateModified && { dateModified }), '@type': 'WebApplication', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };
  }
  return {
    ...base,
    author,
    ...(dateModified && { dateModified }),
    '@type': 'LearningResource',
    learningResourceType: 'Practice exercise',
    educationalLevel: c?.difficulty,
    teaches: s.primaryKeyword,
    keywords: s.primaryKeyword,
    audience: { '@type': 'Audience', audienceType: 'QA engineers and test automation learners' },
  };
}

export function buildHead(pathname: string): Head {
  const id = seoIdForPath(pathname);
  if (!id) {
    const home = SEO.home;
    return {
      title: `QA Store demo | ${SITE_NAME}`,
      description: home.metaDescription,
      canonical: SITE_URL,
      robots: 'noindex, follow',
      image: `${SITE_URL}og/home.png`,
      imageAlt: home.imageAlt,
      ogType: 'website',
      jsonLd: [],
    };
  }
  const s = SEO[id];
  const url = urlForId(id);
  const image = `${SITE_URL}og/${id}.png`;
  const shot = screenshotFor(id);
  const jsonLd = [mainEntity(id, s, url, shot ? [image, shot.url] : image), breadcrumbs(id)];
  if (s.faqs.length) jsonLd.push(faqPage(s));
  if (shot) jsonLd.push(imageObject(shot));
  const ogType = id === 'home' || INFO_IDS.includes(id) ? 'website' : 'article';
  return { title: s.title, description: s.metaDescription, canonical: url, robots: 'index, follow', image, imageAlt: s.imageAlt, ogType, jsonLd };
}

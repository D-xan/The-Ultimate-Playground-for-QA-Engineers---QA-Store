// Set in .env; ends with a slash, so append paths like `${SITE_URL}practice`.
// SITE_URL is the canonical home; every copy's canonical tags, sitemap and share links point there.
export const SITE_URL: string = import.meta.env.VITE_SITE_URL;
// Where this build is actually served. The GitHub Pages mirror sets VITE_PUBLIC_URL to its github.io path,
// so snippets point at a copy the visitor can reach; otherwise it is the canonical URL.
export const PUBLIC_URL: string = import.meta.env.VITE_PUBLIC_URL || SITE_URL;

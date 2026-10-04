/** Resolves a site-relative asset path from the data files (img/products/x.svg) against the deploy base; full URLs pass through. */
export const asset = (src: string) => (/^(https?:|data:|\/)/.test(src) ? src : import.meta.env.BASE_URL + src);

// One-off: draws self-hosted product, category and brand images (Lucide icons on soft gradients)
// into public/img/ and points src/data/db.json at them. The old loremflickr URLs now return 401.
//   node scripts/generateImages.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as icons from 'lucide-react';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'public/img');

const ICON = {
  ball: 'Volleyball', pizza: 'Pizza', table: 'LampDesk', chair: 'Armchair', soap: 'SoapDispenserDroplet',
  bacon: 'Ham', sausages: 'Beef', salad: 'Salad', gloves: 'Hand', mouse: 'Mouse', tuna: 'Fish', cheese: 'Milk',
  shoes: 'SportShoe', pants: 'Shirt', fish: 'Fish', chips: 'Popcorn', shirt: 'Shirt', car: 'Car',
  keyboard: 'Keyboard', chicken: 'Drumstick', towels: 'TowelRack', bike: 'Bike', hat: 'HatGlasses', computer: 'Laptop',
};
// Three looks per product type so a product's gallery shows three different pictures.
const PALETTES = [
  ['#eff6ff', '#dbeafe', '#1d4ed8'],
  ['#fefce8', '#fef08a', '#a16207'],
  ['#f0fdf4', '#bbf7d0', '#15803d'],
];

const iconSvg = (name, color, size) =>
  renderToStaticMarkup(createElement(icons[name], { color, size, strokeWidth: 1.5 }))
    .replace(/class="[^"]*"/, '');

function tile(iconName, label, [from, to, ink], size = 400) {
  const glyph = iconSvg(iconName, ink, size * 0.42).replace('<svg', `<svg x="${size * 0.29}" y="${size * 0.22}"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${label}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="${size}" height="${size}" fill="url(#g)"/>
${glyph}
<text x="50%" y="${size * 0.84}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${size * 0.07}" font-weight="600" fill="${ink}" opacity="0.8">${label}</text>
</svg>
`;
}

const title = (s) => s[0].toUpperCase() + s.slice(1);
await mkdir(path.join(out, 'products'), { recursive: true });
await mkdir(path.join(out, 'brands'), { recursive: true });

for (const [noun, iconName] of Object.entries(ICON)) {
  for (let i = 0; i < 3; i++) {
    await writeFile(path.join(out, 'products', `${noun}-${i + 1}.svg`), tile(iconName, title(noun), PALETTES[i]));
  }
}
await writeFile(path.join(out, 'products', 'generic.svg'), tile('ShoppingBag', 'Product', PALETTES[0]));

const dbPath = path.join(root, 'src/data/db.json');
const db = JSON.parse(await readFile(dbPath, 'utf8'));

for (const p of db.products) {
  const noun = p.images[0].match(/\/400\/400\/(\w+)/)?.[1];
  p.images = [1, 2, 3].map((n) => (ICON[noun] ? `img/products/${noun}-${n}.svg` : 'img/products/generic.svg'));
}
for (const c of db.categories) {
  c.image = ICON[c.slug] ? `img/products/${c.slug}-1.svg` : 'img/products/generic.svg';
}
const MONO = ['#1d4ed8', '#a16207', '#15803d', '#7c3aed', '#be123c'];
db.brands.forEach((b, i) => {
  const initials = b.name.split(/[^A-Za-z]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  writeFile(path.join(out, 'brands', `${i + 1}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" role="img" aria-label="${b.name.replace(/&/g, '&amp;')}">
<rect width="100" height="100" rx="20" fill="${MONO[i % MONO.length]}"/>
<text x="50" y="62" text-anchor="middle" font-family="system-ui, sans-serif" font-size="34" font-weight="700" fill="#fff">${initials}</text>
</svg>
`);
  b.logo = `img/brands/${i + 1}.svg`;
});

await writeFile(dbPath, JSON.stringify(db, null, 2) + '\n');
console.log(`wrote ${Object.keys(ICON).length * 3 + 1} product images, ${db.brands.length} brand logos; db.json updated`);

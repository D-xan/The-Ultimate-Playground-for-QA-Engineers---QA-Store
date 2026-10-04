import { SITE_URL } from '@/config/site';

export const BADGE_SIZE = 1080;

const INK = '#1c1917';
const YELLOW = '#facc15';
const SANS = 'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, "DejaVu Sans Mono", monospace';

/** Pre-filled LinkedIn post. LinkedIn can't attach an image from a URL, so people add the downloaded PNG themselves. */
export function linkedInShareUrl(count: number): string {
  const text =
    `I passed all ${count} QA automation practice challenges on QA Playground: ` +
    'shadow DOM, flaky waits, drag and drop, network mocking and more, solved with real test scripts.\n\n' +
    `${SITE_URL}practice`;
  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws the square badge: the name, one tile per challenge (ticked once passed) and a test-runner summary line. */
export function drawBadge(
  canvas: HTMLCanvasElement,
  data: { name: string; dateLabel: string; count: number; passed?: number; logo?: HTMLImageElement | null },
): void {
  const passed = data.passed ?? data.count;
  const S = BADGE_SIZE;
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const pad = 88;

  ctx.fillStyle = YELLOW;
  ctx.fillRect(0, 0, S, S);

  // Header: brand on the left, date on the right.
  ctx.fillStyle = INK;
  ctx.textBaseline = 'middle';
  let brandX = pad;
  if (data.logo?.complete && data.logo.naturalWidth) {
    ctx.drawImage(data.logo, pad, 84, 56, 56);
    brandX += 72;
  }
  ctx.textAlign = 'left';
  ctx.font = `700 36px ${SANS}`;
  ctx.fillText('QA Playground', brandX, 112);
  ctx.textAlign = 'right';
  ctx.font = `500 28px ${SANS}`;
  ctx.fillText(data.dateLabel, S - pad, 112);

  // The name is the hero; shrink it until it fits.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const name = data.name.trim() || 'Your name';
  let size = 112;
  do {
    ctx.font = `800 ${size}px ${SANS}`;
    size -= 4;
  } while (ctx.measureText(name).width > S - pad * 2 && size > 36);
  ctx.globalAlpha = data.name.trim() ? 1 : 0.35;
  ctx.fillText(name, pad, 330);
  ctx.globalAlpha = 1;
  ctx.font = `500 40px ${SANS}`;
  ctx.fillText(passed === data.count ? 'passed every QA Playground challenge' : `is ${data.count - passed} ${data.count - passed === 1 ? 'challenge' : 'challenges'} away from this badge`, pad, 400);

  // One tile per challenge, eight to a row.
  const perRow = 8;
  const gap = 16;
  const tile = (S - pad * 2 - gap * (perRow - 1)) / perRow;
  for (let i = 0; i < data.count; i++) {
    const x = pad + (i % perRow) * (tile + gap);
    const y = 470 + Math.floor(i / perRow) * (tile + gap);
    if (i >= passed) {
      // Not passed yet: an empty dashed slot.
      ctx.strokeStyle = INK;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 10]);
      roundRect(ctx, x + 2, y + 2, tile - 4, tile - 4, 14);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      continue;
    }
    ctx.fillStyle = INK;
    roundRect(ctx, x, y, tile, tile, 14);
    ctx.fill();
    ctx.strokeStyle = YELLOW;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x + tile * 0.28, y + tile * 0.52);
    ctx.lineTo(x + tile * 0.44, y + tile * 0.68);
    ctx.lineTo(x + tile * 0.73, y + tile * 0.34);
    ctx.stroke();
  }
  const rows = Math.ceil(data.count / perRow);
  const gridBottom = 470 + rows * (tile + gap) - gap;

  // Test-runner summary, the way a reporter prints it.
  ctx.fillStyle = INK;
  ctx.font = `600 34px ${MONO}`;
  ctx.fillText(passed === data.count ? `${data.count} passed, 0 failed` : `${passed} passed, ${data.count - passed} pending`, pad, gridBottom + 80);

  ctx.fillRect(pad, S - 132, S - pad * 2, 3);
  ctx.textBaseline = 'middle';
  ctx.font = `600 26px ${SANS}`;
  ctx.fillText(new URL(SITE_URL).host, pad, S - 84);
  ctx.textAlign = 'right';
  ctx.font = `400 22px ${SANS}`;
  ctx.fillText('Self-paced practice, not a formal qualification', S - pad, S - 84);
}

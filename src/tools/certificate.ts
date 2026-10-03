export function localDateISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function certificateId(name: string, dateISO: string, challengeIds: string[]): Promise<string> {
  const payload = `${name.trim()}|${dateISO}|${[...challengeIds].sort().join(',')}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 12)
    .toUpperCase();
}

export function linkedInUrl(opts: { certId: string; issued: Date }): string {
  return (
    'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME' +
    '&name=QA%20Automation%20Practitioner&organizationName=QA%20Playground' +
    `&issueYear=${opts.issued.getFullYear()}&issueMonth=${opts.issued.getMonth() + 1}` +
    `&certId=${encodeURIComponent(opts.certId)}&certUrl=https%3A%2F%2Fqa.randomly.online%2F`
  );
}

export function drawCertificate(
  canvas: HTMLCanvasElement,
  data: { name: string; dateLabel: string; certId: string; challengeCount: number },
): void {
  const W = 1600;
  const H = 1131;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 12;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = '#c7d2fe';
  ctx.lineWidth = 3;
  ctx.strokeRect(70, 70, W - 140, H - 140);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#4f46e5';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('QA PLAYGROUND', W / 2, 200);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 76px serif';
  ctx.fillText('Certificate of Completion', W / 2, 330);

  ctx.fillStyle = '#64748b';
  ctx.font = '34px sans-serif';
  ctx.fillText('This certifies that', W / 2, 440);

  let size = 96;
  ctx.fillStyle = '#0f172a';
  do {
    ctx.font = `bold ${size}px serif`;
    size -= 4;
  } while (ctx.measureText(data.name).width > W - 300 && size > 24);
  ctx.fillText(data.name, W / 2, 570);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(300, 600);
  ctx.lineTo(W - 300, 600);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '34px sans-serif';
  ctx.fillText(`has completed all ${data.challengeCount} QA Playground challenges as a`, W / 2, 690);

  ctx.fillStyle = '#4f46e5';
  ctx.font = 'bold 60px sans-serif';
  ctx.fillText('QA Automation Practitioner', W / 2, 780);

  ctx.fillStyle = '#334155';
  ctx.font = '30px sans-serif';
  ctx.fillText(`Issued ${data.dateLabel}`, W / 2, 900);
  ctx.font = '28px monospace';
  ctx.fillText(`Certificate ID ${data.certId}`, W / 2, 950);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px sans-serif';
  ctx.fillText('qa.randomly.online', W / 2, 1020);
}

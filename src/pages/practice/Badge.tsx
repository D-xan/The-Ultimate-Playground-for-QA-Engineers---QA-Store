import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { practiceChallenges } from '@/data/challenges';
import { isPageComplete } from '@/store/progressLogic';
import { useProgressStore } from '@/store/useProgressStore';
import { drawBadge, linkedInShareUrl } from '@/tools/badge';
import { cn } from '@/utils/cn';

export default function Badge() {
  const progress = useProgressStore();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const total = practiceChallenges.length;
  const passed = practiceChallenges.filter((c) => isPageComplete(progress, c.id));
  const left = total - passed.length;
  const unlocked = left === 0;
  const dateLabel = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogo(img);
    img.src = `${import.meta.env.BASE_URL}brand/randomly-logo-128.webp`;
  }, []);

  // Redraw the preview as the name is typed or a challenge passes.
  useEffect(() => {
    if (canvasRef.current) drawBadge(canvasRef.current, { name, dateLabel, count: total, passed: passed.length, logo });
  }, [name, dateLabel, total, passed.length, logo]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !name.trim()) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('This browser could not create the PNG. Try another browser.');
        return;
      }
      setError('');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qa-playground-badge.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }, 'image/png');
  };

  const gridSection = (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
        <h2 id="badge-status" className="text-xl font-bold text-slate-900">
          {unlocked ? 'All challenges passed' : left === 1 ? 'One challenge left' : `${left} challenges left`}
        </h2>
        <p className="font-mono text-sm text-slate-600">
          {passed.length} passed, {unlocked ? '0 failed' : `${left} to go`}
        </p>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-6" aria-hidden="true">
        <div className="h-full bg-yellow-400 transition-[width] duration-500" style={{ width: `${(passed.length / total) * 100}%` }} />
      </div>
      <ul id="challenge-grid" className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {practiceChallenges.map((c) => {
          const done = isPageComplete(progress, c.id);
          const Icon = c.icon;
          return (
            <li key={c.id} data-status={done ? 'passed' : 'pending'}>
              <Link
                to={`/practice/${c.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500',
                  done
                    ? 'bg-yellow-400 border-yellow-400 text-stone-900 hover:bg-yellow-300'
                    : 'border-dashed border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-yellow-500 hover:text-slate-900 dark:hover:text-white',
                )}
              >
                {done ? <Check className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" /> : <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />}
                <span className="truncate">{c.label}</span>
                <span className="sr-only">{done ? ' (passed)' : ' (not passed yet)'}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
);

const badgeSection = (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Your badge</h2>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] items-start">
        <canvas
          id="badge-preview"
          ref={canvasRef}
          role="img"
          aria-label={unlocked
            ? `Badge: ${name.trim() || 'Your name'} passed every QA Playground challenge`
            : `Badge preview: ${passed.length} of ${total} challenges passed`}
          className="w-full max-w-[540px] aspect-square rounded-xl shadow-md"
        />
        {!unlocked ? (
          <div id="badge-locked" className="space-y-3 text-sm text-slate-600">
            <p className="text-base font-semibold text-slate-900">
              {left === 1 ? 'One tile to fill.' : `${left} tiles to fill.`}
            </p>
            <p>Every challenge you pass ticks a tile on your badge. Pass the dashed ones in the list and the badge unlocks for download.</p>
            <p>Progress is saved in this browser.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Name on the badge</span>
              <input
                id="badge-name"
                placeholder="Ada Lovelace"
                maxLength={40}
                autoComplete="name"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <Button id="download-badge" className="w-full text-stone-900 bg-yellow-400 hover:bg-yellow-300" onClick={download} disabled={!name.trim()}>
              Download badge
            </Button>
            <a
              id="share-linkedin"
              href={linkedInShareUrl(total)}
              target="_blank"
              rel="noopener"
              className="inline-flex w-full items-center justify-center h-10 px-4 rounded-md border border-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Post on LinkedIn
            </a>
            <p className="text-xs text-slate-500">
              The LinkedIn post opens with text filled in. Add the downloaded image to it before posting.
            </p>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-6">
        The badge records self-paced practice. It is not a formal or accredited qualification, and nothing is sent to a server.
      </p>
    </section>
);

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Completion Badge</h1>
        <p className="text-slate-500 max-w-2xl">
          Pass all {total} practice challenges to unlock a badge with your name on it. Download it and post it on LinkedIn.
        </p>
        <HintAccordion hints={[
          'Selenium: seed progress with execute_script("localStorage.setItem(...)") on key qa-playground-progress-v3, reload, then type into #badge-name and click #download-badge.',
          'Playwright: use page.addInitScript to seed that localStorage key, and page.waitForEvent("download") around #download-badge.',
          'Cypress: set the key in onBeforeLoad via cy.visit, then cy.get("#challenge-grid li[data-status=pending]").should("have.length", 0).',
        ]} />
      </div>

      {unlocked ? <>{badgeSection}{gridSection}</> : <>{gridSection}{badgeSection}</>}
    </div>
  );
}

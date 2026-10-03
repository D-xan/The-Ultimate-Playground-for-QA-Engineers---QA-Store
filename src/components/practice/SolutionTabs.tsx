import { useState } from 'react';
import { solutions, type Solution } from '@/data/solutions';
import { Button } from '@/components/ui/Button';

const TABS: { key: keyof Solution; label: string }[] = [
  { key: 'playwright', label: 'Playwright' },
  { key: 'seleniumJava', label: 'Selenium Java' },
  { key: 'seleniumPython', label: 'Selenium Python' },
  { key: 'cypress', label: 'Cypress' },
];

interface Props {
  challengeId: string;
  /** Section number, so the heading continues the page's numbering. */
  number: number;
}

export function SolutionTabs({ challengeId, number }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [active, setActive] = useState<keyof Solution>('playwright');
  const [copied, setCopied] = useState(false);
  const solution = solutions[challengeId];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(solution[active]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
      <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">{number}. Solutions</h2>
      {!revealed || !solution ? (
        <div className="space-y-3">
          <p className="text-slate-600 text-sm">Try the challenges yourself first. Reference solutions are hidden until you ask for them.</p>
          <Button id="reveal-solution" variant="outline" onClick={() => setRevealed(true)}>Show solutions</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div role="tablist" aria-label="Solution language" className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                type="button"
                id={`solution-tab-${t.key}`}
                aria-selected={active === t.key}
                aria-controls="solution-panel"
                onClick={() => { setActive(t.key); setCopied(false); }}
                className={`rounded-lg px-4 py-2 text-sm font-medium border ${active === t.key ? 'bg-primary text-white border-primary' : 'border-border text-slate-700 hover:bg-slate-50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div id="solution-panel" role="tabpanel" aria-labelledby={`solution-tab-${active}`} className="relative">
            <div className="flex justify-end mb-2">
              <Button id="copy-solution" variant="outline" size="sm" onClick={copy}>{copied ? 'Copied!' : 'Copy'}</Button>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100"><code>{solution[active]}</code></pre>
          </div>
        </div>
      )}
    </section>
  );
}

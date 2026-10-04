import { useEffect, useId, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Info, Lightbulb, Code2, CheckCircle2, Circle, X, Check } from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';

export type Framework = 'playwright' | 'seleniumJava' | 'seleniumPython' | 'cypress';
const FRAMEWORKS: { key: Framework; label: string }[] = [
  { key: 'playwright', label: 'Playwright' },
  { key: 'seleniumJava', label: 'Selenium Java' },
  { key: 'seleniumPython', label: 'Selenium Python' },
  { key: 'cypress', label: 'Cypress' },
];

export interface ElementGuide {
  /** One sentence: what the learner's script must do. */
  goal: string;
  pass: string[];
  fail: string[];
  hint: string;
  code: Partial<Record<Framework, string>>;
}

interface Props extends ElementGuide {
  /** Stable id; also the progress key and the test id prefix. */
  id: string;
  label: string;
  /** Action tasks: true once the page sees the goal reached. */
  done?: boolean;
  /** Read tasks: the script types what it read; a match completes the task. */
  answer?: { prompt: string; expected: string };
  children: ReactNode;
}

/**
 * One practice element with its guide beside it: the goal, an (i) toggle for the test cases,
 * a hint and code snippets on request, and a status that ticks itself when the work is done.
 */
export function PracticeElement({ id, label, goal, pass, fail, hint, code, done = false, answer, children }: Props) {
  const pageId = useLocation().pathname.split('/').pop() || '';
  const key = `el-${id}:0`;
  const isDone = useProgressStore((s) => (s.completed[pageId] ?? []).includes(key));
  const completeTask = useProgressStore((s) => s.completeTask);
  const registerGroup = useProgressStore((s) => s.registerGroup);
  const [showCases, setShowCases] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [tab, setTab] = useState<Framework>((Object.keys(code)[0] as Framework) ?? 'playwright');
  const [typed, setTyped] = useState('');
  const uid = useId();
  const answerOk = !!answer && typed.trim().toLowerCase() === answer.expected.trim().toLowerCase();

  useEffect(() => { registerGroup(pageId, `el-${id}`, 1); }, [pageId, id, registerGroup]);
  useEffect(() => { if (done || answerOk) completeTask(pageId, key); }, [done, answerOk, pageId, key, completeTask]);

  const toggle = (on: boolean) => `inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${on ? 'border-primary bg-primary/10 text-slate-900' : 'border-border text-slate-600 hover:bg-slate-50'}`;

  return (
    <div data-testid={`element-${id}`} data-done={isDone} className="grid gap-4 rounded-xl border border-border bg-white p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-800">{label}</span>
          <button
            type="button"
            onClick={() => setShowCases((v) => !v)}
            aria-expanded={showCases}
            aria-controls={`${uid}-cases`}
            aria-label={`What to test: ${label}`}
            data-testid={`info-${id}`}
            className="rounded-full p-0.5 text-slate-400 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Info className="h-4 w-4" />
          </button>
          <span data-testid={`status-${id}`} className={`ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${isDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            {isDone ? 'Done' : 'To do'}
          </span>
        </div>
        {children}
        {answer && (
          <label className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>{answer.prompt}</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              data-testid={`answer-${id}`}
              aria-label={answer.prompt}
              className={`min-w-0 flex-1 rounded-md border px-2 py-1 text-sm ${typed && (answerOk ? 'border-green-400' : 'border-red-300')} ${typed ? '' : 'border-border'}`}
            />
            {typed && (answerOk ? <Check className="h-4 w-4 text-green-600" aria-label="Correct" /> : <X className="h-4 w-4 text-red-500" aria-label="Not yet" />)}
          </label>
        )}
      </div>

      <div className="min-w-0 rounded-lg bg-slate-50 p-3 text-sm">
        <p className="text-slate-700"><span className="font-semibold text-slate-900">Goal: </span>{goal}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={toggle(showCases)} onClick={() => setShowCases((v) => !v)} aria-expanded={showCases} aria-controls={`${uid}-cases`}>
            <Info className="h-3.5 w-3.5" /> Test cases
          </button>
          <button type="button" className={toggle(showHint)} onClick={() => setShowHint((v) => !v)} aria-expanded={showHint} aria-controls={`${uid}-hint`} data-testid={`hint-${id}`}>
            <Lightbulb className="h-3.5 w-3.5" /> Hint
          </button>
          <button type="button" className={toggle(showCode)} onClick={() => setShowCode((v) => !v)} aria-expanded={showCode} aria-controls={`${uid}-code`} data-testid={`code-${id}`}>
            <Code2 className="h-3.5 w-3.5" /> Code
          </button>
        </div>

        {/* Kept in the DOM while closed so search engines and screen-reader browse mode still find it. */}
        <div id={`${uid}-cases`} hidden={!showCases} className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-green-700">Should pass</div>
            <ul className="space-y-1 text-xs text-slate-600">{pass.map((t) => <li key={t} className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-green-600" />{t}</li>)}</ul>
          </div>
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-red-700">Should fail</div>
            <ul className="space-y-1 text-xs text-slate-600">{fail.map((t) => <li key={t} className="flex gap-1.5"><X className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />{t}</li>)}</ul>
          </div>
        </div>

        <p id={`${uid}-hint`} hidden={!showHint} className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">{hint}</p>

        <div id={`${uid}-code`} hidden={!showCode} className="mt-3">
          <div role="tablist" aria-label="Framework" className="mb-2 flex flex-wrap gap-1">
            {FRAMEWORKS.filter((f) => code[f.key]).map((f) => (
              <button key={f.key} type="button" role="tab" aria-selected={tab === f.key} onClick={() => setTab(f.key)}
                className={`rounded px-2 py-0.5 text-xs font-medium ${tab === f.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 text-xs leading-relaxed text-slate-100"><code>{code[tab]}</code></pre>
        </div>
      </div>
    </div>
  );
}

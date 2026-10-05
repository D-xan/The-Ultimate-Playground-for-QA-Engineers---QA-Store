import { useEffect, useId, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Info, Lightbulb, Code2, CheckCircle2, Circle, X, Check, Target, Copy } from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';
import { useFrameworkPref, type Framework } from '@/store/useFrameworkPref';

export type { Framework };
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
  const preferred = useFrameworkPref((s) => s.framework);
  const setTab = useFrameworkPref((s) => s.setFramework);
  // Open on the learner's last pick; fall back to the first snippet this element has.
  const tab: Framework = code[preferred] ? preferred : ((Object.keys(code)[0] as Framework) ?? 'playwright');
  const [copied, setCopied] = useState(false);
  const [typed, setTyped] = useState('');
  const uid = useId();
  // An empty box never counts, even while the expected value is still loading.
  const answerOk = !!answer && typed.trim() !== '' && typed.trim().toLowerCase() === answer.expected.trim().toLowerCase();

  useEffect(() => { registerGroup(pageId, `el-${id}`, 1); }, [pageId, id, registerGroup]);
  useEffect(() => { if (done || answerOk) completeTask(pageId, key); }, [done, answerOk, pageId, key, completeTask]);

  const toggle = (on: boolean) => `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${on ? 'border-primary bg-primary text-stone-900 shadow-sm shadow-primary/30' : 'border-border text-slate-600 hover:border-primary/60 hover:text-slate-900'}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code[tab] ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      data-testid={`element-${id}`}
      data-done={isDone}
      className={`group relative grid gap-5 overflow-hidden rounded-2xl border bg-white p-5 pl-6 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:p-6 sm:pl-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-6 ${isDone ? 'border-green-300 dark:border-green-500/40' : 'border-border hover:border-primary/40'}`}
    >
      {/* Status rail: amber while open, green once the task ticks. */}
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 transition-colors duration-500 ${isDone ? 'bg-green-500' : 'bg-primary/50 group-hover:bg-primary'}`} />

      <div className="min-w-0">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base font-semibold text-slate-900">{label}</span>
          <button
            type="button"
            onClick={() => setShowCases((v) => !v)}
            aria-expanded={showCases}
            aria-controls={`${uid}-cases`}
            aria-label={`What to test: ${label}`}
            data-testid={`info-${id}`}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Info className="h-4 w-4" />
          </button>
          <span
            key={String(isDone)}
            data-testid={`status-${id}`}
            className={`ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${isDone ? 'status-pop bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' : 'bg-slate-100 text-slate-500'}`}
          >
            {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            {isDone ? 'Done' : 'To do'}
          </span>
        </div>
        {children}
        {answer && (
          <label className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>{answer.prompt}</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              data-testid={`answer-${id}`}
              aria-label={answer.prompt}
              className={`min-w-0 flex-1 rounded-lg border px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${typed && (answerOk ? 'border-green-400' : 'border-red-300')} ${typed ? '' : 'border-border'}`}
            />
            {typed && (answerOk ? <Check className="h-4 w-4 text-green-600" aria-label="Correct" /> : <X className="h-4 w-4 text-red-500" aria-label="Not yet" />)}
          </label>
        )}
      </div>

      <div className="min-w-0 rounded-xl bg-slate-50 p-4 text-sm ring-1 ring-inset ring-slate-200/70 dark:ring-white/5">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
          <Target className="h-3.5 w-3.5" /> Goal
        </div>
        <p className="leading-relaxed text-slate-700">{goal}</p>
        <div className="mt-3 flex flex-wrap gap-2">
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
        <div id={`${uid}-cases`} hidden={!showCases} className="reveal mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50/60 p-3 dark:border-green-500/20 dark:bg-green-500/5">
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400">Should pass</div>
            <ul className="space-y-1.5 text-xs text-slate-600">{pass.map((t) => <li key={t} className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-green-600" />{t}</li>)}</ul>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 dark:border-red-500/20 dark:bg-red-500/5">
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Should fail</div>
            <ul className="space-y-1.5 text-xs text-slate-600">{fail.map((t) => <li key={t} className="flex gap-1.5"><X className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />{t}</li>)}</ul>
          </div>
        </div>

        <p id={`${uid}-hint`} hidden={!showHint} className="reveal mt-4 flex gap-2 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-400/10 dark:text-amber-100">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span>{hint}</span>
        </p>

        <div id={`${uid}-code`} hidden={!showCode} className="reveal mt-4 overflow-hidden rounded-xl bg-slate-900 ring-1 ring-black/10 dark:ring-white/10">
          <div className="flex items-center gap-2 border-b border-white/10 px-2 py-1.5">
            <div role="tablist" aria-label="Framework" className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
              {FRAMEWORKS.filter((f) => code[f.key]).map((f) => (
                <button key={f.key} type="button" role="tab" aria-selected={tab === f.key} onClick={() => { setTab(f.key); setCopied(false); }}
                  className={`shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-colors ${tab === f.key ? 'bg-primary text-stone-900' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={copy} aria-label="Copy code" title="Copy code" className="inline-flex shrink-0 items-center gap-1 rounded-md p-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-slate-100"><code>{code[tab]}</code></pre>
        </div>
      </div>
    </div>
  );
}

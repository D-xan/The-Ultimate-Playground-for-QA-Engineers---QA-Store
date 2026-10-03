import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Crosshair, X } from 'lucide-react';
import { detectKind, findMatches } from '@/tools/selectorEngine';

const ATTR = 'data-selector-lab-match';
const STYLE_ATTR = 'data-selector-lab-style';
const RULE = `[${ATTR}]{outline:2px solid #f59e0b !important;outline-offset:2px}`;

function describe(el: Element): string {
  const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : [];
  const label = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + cls.map((c) => `.${c}`).join('');
  return `${label} ${(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)}`.trim();
}

function parentOf(n: Node): Node | null {
  return n.parentNode ?? (n as ShadowRoot).host ?? null;
}

function isWithin(el: Node, ancestor: Node): boolean {
  for (let n: Node | null = el; n; n = parentOf(n)) if (n === ancestor) return true;
  return false;
}

function ensureStyle(el: Element) {
  const root = el.getRootNode();
  if (el.ownerDocument === document && !(root instanceof ShadowRoot)) return; // global stylesheet covers it
  const host: ParentNode = root instanceof ShadowRoot ? root : el.ownerDocument.head;
  if (host.querySelector(`style[${STYLE_ATTR}]`)) return;
  const style = el.ownerDocument.createElement('style');
  style.setAttribute(STYLE_ATTR, '');
  style.textContent = RULE;
  host.appendChild(style);
}

export default function SelectorLab() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [pierceShadow, setPierceShadow] = useState(true);
  const [includeFrames, setIncludeFrames] = useState(true);
  const [result, setResult] = useState<{ count: number; error?: string; items: Element[]; sig: string }>({ count: 0, items: [], sig: '' });
  const panelRef = useRef<HTMLDivElement>(null);
  const marked = useRef<Set<Element>>(new Set());

  const clear = useCallback(() => {
    marked.current.forEach((el) => el.removeAttribute(ATTR));
    marked.current.clear();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  const run = useCallback(() => {
    const root = document.querySelector('main');
    const panel = panelRef.current;
    if (!root || !debounced.trim()) {
      clear();
      setResult((r) => (r.sig === '' ? r : { count: 0, items: [], sig: '' }));
      return;
    }
    const res = findMatches(root, debounced, { pierceShadow, includeFrames });
    const items = res.elements.filter((el) => {
      if (el.ownerDocument !== document) return true; // frame documents are searched via their iframe
      return isWithin(el, root) && !(panel && isWithin(el, panel));
    });
    const next = new Set(items);
    marked.current.forEach((el) => { if (!next.has(el)) el.removeAttribute(ATTR); });
    items.forEach((el) => { ensureStyle(el); el.setAttribute(ATTR, ''); });
    marked.current = next;
    const sig = `${items.length}|${res.error ?? ''}|${items.map((e) => describe(e)).slice(0, 20).join('~')}`;
    setResult((r) => (r.sig === sig ? r : { count: items.length, error: res.error, items: items.slice(0, 20), sig }));
  }, [debounced, pierceShadow, includeFrames, clear]);

  // search while open: on change, route change, and a short poll for late-loading frames
  useEffect(() => {
    if (!open) { clear(); return; }
    clear();
    run();
    const poll = setInterval(run, 500);
    const onLoad = (e: Event) => { if (e.target instanceof HTMLIFrameElement) run(); };
    document.addEventListener('load', onLoad, true);
    return () => {
      clearInterval(poll);
      document.removeEventListener('load', onLoad, true);
      clear();
    };
  }, [open, run, clear, location.pathname]);

  const kind = detectKind(query);

  return (
    <>
      <button
        id="selector-lab-toggle"
        type="button"
        aria-label={open ? 'Close Selector Lab' : 'Open Selector Lab'}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-6 z-[60] h-12 w-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:opacity-90"
      >
        {open ? <X className="h-5 w-5" /> : <Crosshair className="h-5 w-5" />}
      </button>
      {open && (
        <div
          ref={panelRef}
          data-testid="selector-lab"
          className="fixed right-6 top-20 bottom-40 z-50 w-96 max-w-[calc(100vw-2rem)] flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Selector Lab</h2>
            <span id="selector-kind" className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {kind === 'xpath' ? 'XPath' : 'CSS'}
            </span>
          </div>
          <input
            id="selector-input"
            placeholder="CSS or XPath"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex gap-4 text-xs text-slate-600">
            <label className="flex items-center gap-1">
              <input id="pierce-shadow" type="checkbox" checked={pierceShadow} onChange={(e) => setPierceShadow(e.target.checked)} /> Pierce shadow
            </label>
            <label className="flex items-center gap-1">
              <input id="include-frames" type="checkbox" checked={includeFrames} onChange={(e) => setIncludeFrames(e.target.checked)} /> Include frames
            </label>
          </div>
          <p id="selector-count" className="text-sm font-semibold text-slate-900">
            {result.count} {result.count === 1 ? 'match' : 'matches'}
          </p>
          {result.error && <p id="selector-error" className="break-words text-xs text-red-600">{result.error}</p>}
          <ul className="flex-1 space-y-1 overflow-y-auto text-xs">
            {result.items.map((el, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="w-full truncate rounded px-2 py-1 text-left font-mono hover:bg-slate-100"
                  onClick={() => el.scrollIntoView({ block: 'center', behavior: 'smooth' })}
                >
                  {describe(el)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

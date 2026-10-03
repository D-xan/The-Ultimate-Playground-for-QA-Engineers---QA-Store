export type SelectorKind = 'css' | 'xpath';
export interface SelectorOptions { pierceShadow: boolean; includeFrames: boolean }
export interface SelectorResult { kind: SelectorKind; elements: Element[]; error?: string }

export function detectKind(query: string): SelectorKind {
  const q = query.trim();
  return q.startsWith('/') || q.startsWith('./') || q.startsWith('(') ? 'xpath' : 'css';
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function frameBody(frame: HTMLIFrameElement): HTMLElement | null {
  try {
    return frame.contentDocument?.body ?? null;
  } catch {
    return null; // cross-origin
  }
}

function cssIn(scope: ParentNode, query: string, opts: SelectorOptions, out: Element[], seen: Set<Element>) {
  const add = (el: Element) => {
    if (!seen.has(el)) { seen.add(el); out.push(el); }
  };
  scope.querySelectorAll(query).forEach(add);
  const all = scope.querySelectorAll('*');
  if (opts.pierceShadow) {
    all.forEach((el) => {
      if (el.shadowRoot) cssIn(el.shadowRoot, query, opts, out, seen);
    });
  }
  if (opts.includeFrames) {
    all.forEach((el) => {
      if (el instanceof HTMLIFrameElement) {
        const body = frameBody(el);
        if (body) cssIn(body, query, opts, out, seen);
      }
    });
  }
}

function xpathIn(doc: Document, context: Node, query: string, opts: SelectorOptions, out: Element[]) {
  const snap = doc.evaluate(query, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i = 0; i < snap.snapshotLength; i++) {
    const n = snap.snapshotItem(i);
    if (n && n.nodeType === Node.ELEMENT_NODE) out.push(n as Element);
  }
  if (opts.includeFrames) {
    const scope = context instanceof Element || context instanceof Document ? context : doc;
    scope.querySelectorAll('iframe').forEach((f) => {
      const body = frameBody(f);
      if (body && body.ownerDocument) xpathIn(body.ownerDocument, body, query, opts, out);
    });
  }
}

export function findMatches(root: Element, query: string, opts: SelectorOptions): SelectorResult {
  const q = query.trim();
  const kind = detectKind(q);
  if (!q) return { kind, elements: [] };
  try {
    const out: Element[] = [];
    if (kind === 'css') {
      cssIn(root, q, opts, out, new Set());
    } else {
      xpathIn(root.ownerDocument, root, q, opts, out);
    }
    return { kind, elements: out };
  } catch (e) {
    return { kind, elements: [], error: errMsg(e) };
  }
}

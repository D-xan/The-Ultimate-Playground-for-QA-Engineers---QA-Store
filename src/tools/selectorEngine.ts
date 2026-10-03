export type SelectorKind = 'css' | 'xpath';
export interface SelectorOptions { pierceShadow: boolean; includeFrames: boolean }
export interface SelectorResult { kind: SelectorKind; elements: Element[]; error?: string }

export function detectKind(query: string): SelectorKind {
  const q = query.trim();
  return q.startsWith('/') || q.startsWith('./') || q.startsWith('(') ? 'xpath' : 'css';
}

// Realm-safe checks: elements inside iframes are instances of the frame's own constructors.
export function isIframe(el: Element): el is HTMLIFrameElement {
  return el.localName === 'iframe';
}
export function isShadowRoot(n: Node): n is ShadowRoot {
  return n.nodeType === 11 && 'host' in n;
}

function frameBody(frame: HTMLIFrameElement): HTMLElement | null {
  try {
    return frame.contentDocument?.body ?? null;
  } catch {
    return null; // cross-origin
  }
}

function cssIn(scope: ParentNode, query: string, opts: SelectorOptions, out: Element[], seen: Set<Element>) {
  scope.querySelectorAll(query).forEach((el) => {
    if (!seen.has(el)) { seen.add(el); out.push(el); }
  });
  if (!opts.pierceShadow && !opts.includeFrames) return;
  scope.querySelectorAll('*').forEach((el) => {
    if (opts.pierceShadow && el.shadowRoot) cssIn(el.shadowRoot, query, opts, out, seen);
    if (opts.includeFrames && isIframe(el)) {
      const body = frameBody(el);
      if (body) cssIn(body, query, opts, out, seen);
    }
  });
}

function xpathIn(scope: Element, query: string, opts: SelectorOptions, out: Element[]) {
  const doc = scope.ownerDocument;
  const snap = doc.evaluate(query, scope, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i = 0; i < snap.snapshotLength; i++) {
    const n = snap.snapshotItem(i);
    // a leading // is document-absolute: keep only nodes inside the scope
    if (n && n.nodeType === 1 && scope.contains(n)) out.push(n as Element);
  }
  if (opts.includeFrames) {
    scope.querySelectorAll('iframe').forEach((f) => {
      const body = frameBody(f);
      if (body) xpathIn(body, query, opts, out);
    });
  }
}

/** Every same-origin iframe under root (recursively, through nested frames). */
export function collectFrames(root: Element, out: HTMLIFrameElement[] = []): HTMLIFrameElement[] {
  root.querySelectorAll('iframe').forEach((f) => {
    out.push(f);
    const body = frameBody(f);
    if (body) collectFrames(body, out);
  });
  return out;
}

export function findMatches(root: Element, query: string, opts: SelectorOptions): SelectorResult {
  const q = query.trim();
  const kind = detectKind(q);
  if (!q) return { kind, elements: [] };
  try {
    const out: Element[] = [];
    if (kind === 'css') cssIn(root, q, opts, out, new Set());
    else xpathIn(root, q, opts, out);
    return { kind, elements: out };
  } catch (e) {
    return { kind, elements: [], error: e instanceof Error ? e.message : String(e) };
  }
}

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SECRET_KEY, type WindowMessage } from '@/utils/windowMessages';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

const send = (msg: WindowMessage) => window.opener?.postMessage(msg, window.location.origin);

function readSecret() {
  try { return localStorage.getItem(SECRET_KEY); } catch { return null; }
}

/** Child windows for the Windows & Tabs challenge. Rendered without the practice layout. */
export default function PopupPage() {
  const { kind } = useParams();
  const [params] = useSearchParams();
  const which = params.get('w') ?? '';
  const [code] = useState(randomCode);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = kind === 'pick' ? `Window ${which}` : 'QA Playground popup';
    if (kind !== 'delayed') return;
    const t = setTimeout(() => setReady(true), 1000 + Math.random() * 2000);
    return () => clearTimeout(t);
  }, [kind, which]);

  const body = () => {
    if (kind === 'secret') {
      const secret = readSecret();
      return secret
        ? <p className="text-lg">The secret word is <strong id="tab-secret" data-testid="tab-secret">{secret}</strong></p>
        : <p id="no-secret">Open this tab from the Windows &amp; Tabs challenge.</p>;
    }
    if (!window.opener) return <p id="no-opener" data-testid="no-opener">Open this page from the Windows &amp; Tabs challenge.</p>;
    if (kind === 'approve') {
      return (
        <>
          <p>Approve the request to send code <strong>{code}</strong> back to the challenge page.</p>
          <Button id="approve-btn" data-testid="approve-btn" onClick={() => { send({ type: 'qa-approve', code }); window.close(); }}>Approve</Button>
        </>
      );
    }
    if (kind === 'delayed') {
      return ready
        ? <Button id="delayed-confirm" data-testid="delayed-confirm" onClick={() => send({ type: 'qa-delayed' })}>Confirm</Button>
        : <p id="delayed-loading">Loading…</p>;
    }
    if (kind === 'pick') {
      return (
        <>
          <p>This is <strong>Window {which}</strong>.</p>
          <Button id="pick-me" data-testid="pick-me" disabled={which !== 'B'} onClick={() => send({ type: 'qa-pick', window: which })}>Pick this window</Button>
        </>
      );
    }
    return <p>Unknown popup.</p>;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <main className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Popup</h1>
        {body()}
      </main>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ENDPOINTS, createMockApi, type ApiResponse, type HttpMethod } from '@/tools/mockApi';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const SAMPLE_BODIES: Record<string, string> = {
  'POST /api/auth/login': '{"username":"qa","password":"qa123"}',
  'POST /api/users': '{"name":"Ada Lovelace","email":"ada@example.com"}',
  'PUT /api/users/1': '{"name":"Alice Johnson","email":"alice@example.com","role":"admin"}',
  'PATCH /api/users/1': '{"name":"Alice J."}',
};

const fieldClass = 'rounded-md border border-slate-300 px-3 text-sm min-w-0 w-full font-mono';

export default function ApiPlayground() {
  const api = useMemo(() => createMockApi(), []);
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [path, setPath] = useState('/api/users?page=1&limit=5');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [sending, setSending] = useState(false);
  const [token, setToken] = useState('');

  const pick = (m: HttpMethod, p: string) => {
    setMethod(m);
    setPath(p);
    setBody(SAMPLE_BODIES[`${m} ${p}`] ?? '');
    setError('');
  };

  const send = async () => {
    let parsedHeaders: Record<string, string> = {};
    if (headers.trim() !== '') {
      try {
        const value: unknown = JSON.parse(headers);
        if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('not an object');
        parsedHeaders = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, String(v)]));
      } catch {
        setError('Headers must be a JSON object, for example {"Authorization":"Bearer ..."}');
        return;
      }
    }
    setError('');
    setSending(true);
    setResponse(null);
    setToken('');
    try {
      const res = await api.handle({ method, path: path.trim(), headers: parsedHeaders, body: body === '' ? undefined : body });
      setResponse(res);
      const issued = (res.body as { token?: unknown } | null)?.token;
      if (res.status === 200 && typeof issued === 'string') setToken(issued);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    api.reset();
    setResponse(null);
    setToken('');
    setError('');
  };

  const useToken = () => setHeaders(JSON.stringify({ Authorization: `Bearer ${token}` }));

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">API Playground</h1>
        <p className="text-slate-500">
          Runs in your browser — use it from Playwright with page.evaluate or by driving this UI; external clients like Postman cannot reach it.
        </p>
        <HintAccordion hints={[
          'Selenium: select a method in #api-method, type into #api-path and #api-body, click #api-send, then read #api-status and #api-response.',
          'Playwright: log in, click #use-token, then send a write request and assert #api-status has text 201. Use expect(...).toHaveText for auto-retrying waits.',
          'Cypress: try /api/delay/3000 and assert #api-time, or call /api/rate-limited six times and check for 429.',
        ]} />
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Endpoints</h2>
        <div className="overflow-x-auto max-w-full">
          <table id="endpoint-table" className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-semibold">Method</th>
                <th className="py-2 pr-4 font-semibold">Path</th>
                <th className="py-2 pr-4 font-semibold">Auth</th>
                <th className="py-2 pr-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map(e => (
                <tr
                  key={`${e.method} ${e.path}`}
                  data-testid="endpoint-row"
                  className="border-b border-slate-100 cursor-pointer hover:bg-slate-50"
                  onClick={() => pick(e.method, e.path)}
                >
                  <td className="py-2 pr-4 font-mono font-semibold">{e.method}</td>
                  <td className="py-2 pr-4 font-mono whitespace-nowrap">
                    <button type="button" className="text-left text-primary hover:underline" onClick={ev => { ev.stopPropagation(); pick(e.method, e.path); }}>
                      {e.path}
                    </button>
                  </td>
                  <td className="py-2 pr-4">{e.auth ? 'Bearer token' : 'Public'}</td>
                  <td className="py-2 pr-4 text-slate-600 min-w-48">{e.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Request</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <label className="text-sm text-slate-600 flex flex-col gap-1">
              Method
              <select id="api-method" value={method} onChange={e => setMethod(e.target.value as HttpMethod)} className="h-10 rounded-md border border-slate-300 px-3 text-sm w-28">
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-600 flex flex-col gap-1 flex-1 basis-64 min-w-0">
              Path
              <input id="api-path" value={path} onChange={e => setPath(e.target.value)} className={`${fieldClass} h-10`} />
            </label>
          </div>
          <label className="text-sm text-slate-600 flex flex-col gap-1">
            Headers (JSON object)
            <textarea id="api-headers" rows={2} value={headers} onChange={e => setHeaders(e.target.value)} placeholder='{"Authorization":"Bearer ..."}' className={`${fieldClass} py-2`} />
          </label>
          <label className="text-sm text-slate-600 flex flex-col gap-1">
            Body
            <textarea id="api-body" rows={4} value={body} onChange={e => setBody(e.target.value)} className={`${fieldClass} py-2`} />
          </label>
          {error && <p id="api-error" role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <Button id="api-send" onClick={send} disabled={sending}>Send</Button>
            <Button id="api-reset" variant="outline" onClick={reset}>Reset data</Button>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. Response</h2>
        {response ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span>Status: <span id="api-status" className="font-mono font-semibold">{response.status}</span></span>
              <span>Time: <span id="api-time" className="font-mono">{response.durationMs} ms</span></span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Headers</p>
              <pre id="api-response-headers" className="bg-slate-50 rounded-md p-3 text-xs overflow-x-auto max-w-full">{JSON.stringify(response.headers, null, 2)}</pre>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Body</p>
              <pre id="api-response" className="bg-slate-50 rounded-md p-3 text-xs overflow-x-auto max-w-full">{JSON.stringify(response.body, null, 2)}</pre>
            </div>
            {token && (
              <div className="flex flex-wrap items-center gap-3">
                <code id="api-token" className="bg-slate-100 rounded px-2 py-1 text-xs break-all">{token}</code>
                <Button id="use-token" size="sm" variant="outline" onClick={useToken}>Use token</Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">{sending ? 'Waiting for response...' : 'Send a request to see the response.'}</p>
        )}
      </section>
    </div>
  );
}

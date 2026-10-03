export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface ApiRequest { method: HttpMethod; path: string; headers?: Record<string, string>; body?: string }
export interface ApiResponse { status: number; headers: Record<string, string>; body: unknown; durationMs: number }
export interface MockApi { handle(req: ApiRequest): Promise<ApiResponse>; reset(): void }

export const ENDPOINTS: { method: HttpMethod; path: string; auth: boolean; description: string }[] = [
  { method: 'POST', path: '/api/auth/login', auth: false, description: 'Log in with {"username":"qa","password":"qa123"} to get a token' },
  { method: 'GET', path: '/api/users?page=1&limit=5', auth: false, description: 'List users with pagination' },
  { method: 'GET', path: '/api/users/1', auth: false, description: 'Get one user (404 if missing)' },
  { method: 'POST', path: '/api/users', auth: true, description: 'Create a user (422 on invalid input)' },
  { method: 'PUT', path: '/api/users/1', auth: true, description: 'Replace a user' },
  { method: 'PATCH', path: '/api/users/1', auth: true, description: 'Update some fields of a user' },
  { method: 'DELETE', path: '/api/users/1', auth: true, description: 'Delete a user (204)' },
  { method: 'GET', path: '/api/status/418', auth: false, description: 'Respond with any status code 100-599' },
  { method: 'GET', path: '/api/delay/2000', auth: false, description: 'Respond after a delay (max 10000 ms)' },
  { method: 'GET', path: '/api/rate-limited', auth: false, description: '5 calls per 10 seconds, then 429 with Retry-After' },
];

interface User { id: number; name: string; email: string; role: string }

const SEED_USERS: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'user' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'editor' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'user' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'user' },
  { id: 7, name: 'Grace Wilson', email: 'grace@example.com', role: 'editor' },
  { id: 8, name: 'Heidi Moore', email: 'heidi@example.com', role: 'user' },
  { id: 9, name: 'Ivan Taylor', email: 'ivan@example.com', role: 'user' },
  { id: 10, name: 'Judy Anderson', email: 'judy@example.com', role: 'admin' },
];

const MAX_DELAY_MS = 10_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10_000;

type Parsed = { ok: true; value: unknown } | { ok: false };
type Fields = Record<string, unknown>;

const asFields = (v: unknown): Fields => (v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Fields) : {});
const isBlank = (v: unknown) => typeof v !== 'string' || v.trim() === '';

function validateUser(f: Fields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (isBlank(f.name)) errors.name = 'Name is required';
  if (isBlank(f.email)) errors.email = 'Email is required';
  else if (!(f.email as string).includes('@')) errors.email = 'Email must contain @';
  return errors;
}

export function createMockApi(opts: { now?: () => number; sleep?: (ms: number) => Promise<void> } = {}): MockApi {
  const now = opts.now ?? (() => Date.now());
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)));
  const clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  let users: User[] = SEED_USERS.map(u => ({ ...u }));
  let tokens = new Set<string>();
  let hits: number[] = [];

  const reply = (status: number, body: unknown, headers: Record<string, string> = {}) => ({
    status,
    body,
    headers: { 'content-type': 'application/json', ...headers },
  });

  const route = async (req: ApiRequest): Promise<Omit<ApiResponse, 'durationMs'>> => {
    const [rawPath, query = ''] = req.path.split('?');
    const segments = rawPath.split('/').filter(Boolean);
    const params = new URLSearchParams(query);
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers ?? {})) headers[k.toLowerCase()] = v;
    const method = req.method;

    const parseBody = (): Parsed => {
      try { return { ok: true, value: JSON.parse(req.body ?? '') }; } catch { return { ok: false }; }
    };
    const authorized = () => {
      const m = /^Bearer\s+(.+)$/i.exec((headers.authorization ?? '').trim());
      return !!m && tokens.has(m[1]);
    };
    const unauthorized = () => reply(401, { error: 'Unauthorized' });
    const invalidJson = () => reply(400, { error: 'Invalid JSON' });
    const notFound = () => reply(404, { error: 'Not found' });

    if (segments[0] !== 'api') return notFound();
    const [, resource, arg, extra] = segments;

    if (resource === 'auth' && arg === 'login' && !extra) {
      if (method !== 'POST') return notFound();
      const parsed = parseBody();
      if (!parsed.ok) return invalidJson();
      const f = asFields(parsed.value);
      if (f.username === 'qa' && f.password === 'qa123') {
        const token = `qa-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
        tokens.add(token);
        return reply(200, { token });
      }
      return reply(401, { error: 'Invalid credentials' });
    }

    if (resource === 'users' && !extra) {
      if (arg === undefined) {
        if (method === 'GET') {
          const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);
          const limit = Math.max(1, parseInt(params.get('limit') ?? '5', 10) || 5);
          const start = (page - 1) * limit;
          return reply(200, { data: users.slice(start, start + limit), page, limit, total: users.length });
        }
        if (method === 'POST') {
          if (!authorized()) return unauthorized();
          const parsed = parseBody();
          if (!parsed.ok) return invalidJson();
          const f = asFields(parsed.value);
          const errors = validateUser(f);
          if (Object.keys(errors).length > 0) return reply(422, { errors });
          const user: User = {
            id: users.reduce((max, u) => Math.max(max, u.id), 0) + 1,
            name: (f.name as string).trim(),
            email: (f.email as string).trim(),
            role: typeof f.role === 'string' && f.role ? f.role : 'user',
          };
          users.push(user);
          return reply(201, user);
        }
        return notFound();
      }

      const id = /^\d+$/.test(arg) ? Number(arg) : NaN;
      const index = users.findIndex(u => u.id === id);
      if (method === 'GET') return index < 0 ? notFound() : reply(200, users[index]);
      if (method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
        if (!authorized()) return unauthorized();
        if (method === 'DELETE') {
          if (index < 0) return notFound();
          users.splice(index, 1);
          return reply(204, null);
        }
        const parsed = parseBody();
        if (!parsed.ok) return invalidJson();
        const f = asFields(parsed.value);
        if (index < 0) return notFound();
        if (method === 'PUT') {
          const errors = validateUser(f);
          if (Object.keys(errors).length > 0) return reply(422, { errors });
          users[index] = {
            id,
            name: (f.name as string).trim(),
            email: (f.email as string).trim(),
            role: typeof f.role === 'string' && f.role ? f.role : 'user',
          };
        } else {
          const current = users[index];
          users[index] = {
            ...current,
            ...(typeof f.name === 'string' ? { name: f.name } : {}),
            ...(typeof f.email === 'string' ? { email: f.email } : {}),
            ...(typeof f.role === 'string' ? { role: f.role } : {}),
          };
        }
        return reply(200, users[index]);
      }
      return notFound();
    }

    if (method === 'GET' && resource === 'status' && arg !== undefined && !extra) {
      const code = /^\d+$/.test(arg) ? Number(arg) : NaN;
      if (code < 100 || code > 599) return reply(400, { error: 'Status code must be between 100 and 599' });
      return reply(code, { status: code });
    }

    if (method === 'GET' && resource === 'delay' && arg !== undefined && !extra) {
      const ms = /^\d+$/.test(arg) ? Math.min(Number(arg), MAX_DELAY_MS) : NaN;
      if (Number.isNaN(ms)) return reply(400, { error: 'Delay must be a number of milliseconds' });
      await sleep(ms);
      return reply(200, { delayedMs: ms });
    }

    if (method === 'GET' && resource === 'rate-limited' && arg === undefined) {
      const t = now();
      hits = hits.filter(h => t - h < RATE_WINDOW_MS);
      if (hits.length >= RATE_LIMIT) {
        const retryAfter = Math.max(1, Math.ceil((hits[0] + RATE_WINDOW_MS - t) / 1000));
        return reply(429, { error: 'Too many requests' }, { 'retry-after': String(retryAfter) });
      }
      hits.push(t);
      return reply(200, { ok: true, remaining: RATE_LIMIT - hits.length });
    }

    return notFound();
  };

  return {
    async handle(req) {
      const start = clock();
      const res = await route(req);
      return { ...res, durationMs: Math.round(clock() - start) };
    },
    reset() {
      users = SEED_USERS.map(u => ({ ...u }));
      tokens = new Set();
      hits = [];
    },
  };
}

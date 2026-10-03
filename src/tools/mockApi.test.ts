import { describe, it, expect } from 'vitest';
import { createMockApi } from './mockApi';

const fast = () => createMockApi({ sleep: async () => {} });

describe('mockApi', () => {
  it('logs in and creates a user with the token', async () => {
    const api = fast();
    const login = await api.handle({ method: 'POST', path: '/api/auth/login', body: '{"username":"qa","password":"qa123"}' });
    expect(login.status).toBe(200);
    const token = (login.body as { token: string }).token;
    const created = await api.handle({ method: 'POST', path: '/api/users', headers: { authorization: `Bearer ${token}` }, body: '{"name":"Ada","email":"ada@x.io"}' });
    expect(created.status).toBe(201);
    expect((created.body as { id: number }).id).toBe(11);
  });
  it('rejects writes without a token', async () => {
    expect((await fast().handle({ method: 'DELETE', path: '/api/users/1' })).status).toBe(401);
  });
  it('validates input with 422', async () => {
    const api = fast();
    const { body } = await api.handle({ method: 'POST', path: '/api/auth/login', body: '{"username":"qa","password":"qa123"}' });
    const r = await api.handle({ method: 'POST', path: '/api/users', headers: { Authorization: `Bearer ${(body as { token: string }).token}` }, body: '{"name":"","email":"nope"}' });
    expect(r.status).toBe(422);
    expect(Object.keys((r.body as { errors: object }).errors).sort()).toEqual(['email', 'name']);
  });
  it('returns 400 for invalid JSON', async () => {
    expect((await fast().handle({ method: 'POST', path: '/api/auth/login', body: '{oops' })).status).toBe(400);
  });
  it('paginates users', async () => {
    const r = await fast().handle({ method: 'GET', path: '/api/users?page=2&limit=4' });
    expect(r.body).toMatchObject({ page: 2, limit: 4, total: 10 });
    expect((r.body as { data: unknown[] }).data).toHaveLength(4);
  });
  it('echoes status codes and 404s unknown routes', async () => {
    expect((await fast().handle({ method: 'GET', path: '/api/status/503' })).status).toBe(503);
    expect((await fast().handle({ method: 'GET', path: '/api/status/999' })).status).toBe(400);
    expect((await fast().handle({ method: 'GET', path: '/api/nope' })).status).toBe(404);
  });
  it('rate limits after five calls in ten seconds', async () => {
    let t = 0;
    const api = createMockApi({ now: () => t, sleep: async () => {} });
    for (let i = 0; i < 5; i++) expect((await api.handle({ method: 'GET', path: '/api/rate-limited' })).status).toBe(200);
    const limited = await api.handle({ method: 'GET', path: '/api/rate-limited' });
    expect(limited.status).toBe(429);
    expect(limited.headers['retry-after']).toBe('10');
    t = 10_001;
    expect((await api.handle({ method: 'GET', path: '/api/rate-limited' })).status).toBe(200);
  });
  it('caps delays at ten seconds', async () => {
    const waited: number[] = [];
    const api = createMockApi({ sleep: async (ms) => { waited.push(ms); } });
    await api.handle({ method: 'GET', path: '/api/delay/60000' });
    expect(waited).toEqual([10_000]);
  });

  const login = async (api: ReturnType<typeof fast>) => {
    const r = await api.handle({ method: 'POST', path: '/api/auth/login', body: '{"username":"qa","password":"qa123"}' });
    return (r.body as { token: string }).token;
  };
  const auth = (token: string) => ({ authorization: `Bearer ${token}` });

  it('guards the status route against non-numeric and out-of-range codes', async () => {
    const api = fast();
    for (const bad of ['abc', '-5', '1e3', '99', '600']) {
      expect((await api.handle({ method: 'GET', path: `/api/status/${bad}` })).status).toBe(400);
    }
    expect((await api.handle({ method: 'GET', path: '/api/status/100' })).status).toBe(100);
    expect((await api.handle({ method: 'GET', path: '/api/status/599' })).status).toBe(599);
  });
  it('PUT replaces a user, 422 on invalid', async () => {
    const api = fast();
    const h = auth(await login(api));
    const ok = await api.handle({ method: 'PUT', path: '/api/users/2', headers: h, body: '{"name":"Bobby","email":"b@x.io"}' });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ id: 2, name: 'Bobby', email: 'b@x.io' });
    const bad = await api.handle({ method: 'PUT', path: '/api/users/2', headers: h, body: '{"name":"Bobby"}' });
    expect(bad.status).toBe(422);
  });
  it('PATCH updates partially and 404s unknown ids', async () => {
    const api = fast();
    const h = auth(await login(api));
    const ok = await api.handle({ method: 'PATCH', path: '/api/users/1', headers: h, body: '{"name":"Alice J."}' });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ id: 1, name: 'Alice J.', email: 'alice@example.com' });
    expect((await api.handle({ method: 'PATCH', path: '/api/users/99', headers: h, body: '{}' })).status).toBe(404);
  });
  it('DELETE returns 204 with null body, then the user is gone', async () => {
    const api = fast();
    const h = auth(await login(api));
    const del = await api.handle({ method: 'DELETE', path: '/api/users/3', headers: h });
    expect(del.status).toBe(204);
    expect(del.body).toBeNull();
    expect((await api.handle({ method: 'GET', path: '/api/users/3' })).status).toBe(404);
  });
  it('reset restores users, tokens and rate-limit state', async () => {
    let t = 0;
    const api = createMockApi({ now: () => t, sleep: async () => {} });
    const token = await login(api);
    await api.handle({ method: 'DELETE', path: '/api/users/1', headers: auth(token) });
    for (let i = 0; i < 5; i++) await api.handle({ method: 'GET', path: '/api/rate-limited' });
    api.reset();
    expect((await api.handle({ method: 'GET', path: '/api/users/1' })).status).toBe(200);
    expect((await api.handle({ method: 'DELETE', path: '/api/users/2', headers: auth(token) })).status).toBe(401);
    expect((await api.handle({ method: 'GET', path: '/api/rate-limited' })).status).toBe(200);
  });
  it('treats a bad token and a missing token as 401', async () => {
    const api = fast();
    expect((await api.handle({ method: 'DELETE', path: '/api/users/1', headers: auth('qa-bogus') })).status).toBe(401);
    expect((await api.handle({ method: 'DELETE', path: '/api/users/1' })).status).toBe(401);
  });
  it('returns 400 for invalid JSON on PUT and PATCH with a valid token', async () => {
    const api = fast();
    const h = auth(await login(api));
    expect((await api.handle({ method: 'PUT', path: '/api/users/1', headers: h, body: '{oops' })).status).toBe(400);
    expect((await api.handle({ method: 'PATCH', path: '/api/users/1', headers: h, body: '{oops' })).status).toBe(400);
  });
  it('matches header names case-insensitively', async () => {
    const api = fast();
    const token = await login(api);
    const r = await api.handle({ method: 'DELETE', path: '/api/users/1', headers: { AUTHORIZATION: `Bearer ${token}` } });
    expect(r.status).toBe(204);
  });
});

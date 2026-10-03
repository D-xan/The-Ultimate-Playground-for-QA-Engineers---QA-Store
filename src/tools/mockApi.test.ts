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
});

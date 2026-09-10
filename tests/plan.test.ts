import { describe, it, expect } from 'vitest';
import { planTests, signature } from '../src/engine/plan.js';
import type { SpecOperation } from '../src/types.js';
import type { Config } from '../src/config/schema.js';

const config: Config = {
  baseUrl: 'http://localhost:4010',
  denyStatuses: [401, 403, 404],
  privileged: [{ operation: 'GET /admin/stats', allow: ['admin'] }],
  identities: [
    { name: 'alice', auth: { type: 'bearer', token: 't-a' }, owns: { userId: ['alice-123'], orderId: ['order-a1'] } },
    { name: 'bob', auth: { type: 'bearer', token: 't-b' }, owns: { userId: ['bob-456'], orderId: ['order-b1'] } },
  ],
};

const getUser: SpecOperation = {
  operationId: 'getUser',
  method: 'get',
  path: '/users/{userId}',
  pathParams: ['userId'],
  queryParams: [],
  hasSecurity: true,
  isSafe: true,
};

const adminStats: SpecOperation = {
  operationId: 'getAdminStats',
  method: 'get',
  path: '/admin/stats',
  pathParams: [],
  queryParams: [],
  hasSecurity: true,
  isSafe: true,
};

const deleteUser: SpecOperation = {
  operationId: 'deleteUser',
  method: 'delete',
  path: '/users/{userId}',
  pathParams: ['userId'],
  queryParams: [],
  hasSecurity: true,
  isSafe: false,
};

describe('planTests — BOLA', () => {
  it('generates a cross-access case for each ordered pair of identities', () => {
    const cases = planTests([getUser], config, { includeBaseline: false });
    const bola = cases.filter((c) => c.kind === 'BOLA');
    // alice->bob and bob->alice
    expect(bola).toHaveLength(2);
    const alice = bola.find((c) => c.actor === 'alice' && c.victim === 'bob');
    expect(alice?.pathValues).toEqual({ userId: 'bob-456' });
    expect(alice?.expectation).toBe('deny');
  });

  it('emits baseline self-access cases when enabled', () => {
    const cases = planTests([getUser], config, { includeBaseline: true });
    const baseline = cases.filter((c) => c.kind === 'BASELINE');
    expect(baseline).toHaveLength(2);
    expect(baseline.every((c) => c.expectation === 'allow')).toBe(true);
  });

  it('never fabricates ids: skips operations no identity owns params for', () => {
    const orphan: SpecOperation = { ...getUser, path: '/things/{thingId}', pathParams: ['thingId'] };
    const cases = planTests([orphan], config);
    expect(cases).toHaveLength(0);
  });
});

describe('planTests — BFLA', () => {
  it('targets identities NOT in the allow list', () => {
    const cases = planTests([adminStats], config, { includeBaseline: false });
    const bfla = cases.filter((c) => c.kind === 'BFLA');
    // neither alice nor bob is 'admin'
    expect(bfla.map((c) => c.actor).sort()).toEqual(['alice', 'bob']);
  });
});

describe('planTests — safety', () => {
  it('skips mutating verbs unless includeUnsafe is set', () => {
    expect(planTests([deleteUser], config)).toHaveLength(0);
    const unsafe = planTests([deleteUser], config, { includeUnsafe: true, includeBaseline: false });
    expect(unsafe.length).toBeGreaterThan(0);
  });
});

describe('signature', () => {
  it('formats as METHOD /path', () => {
    expect(signature(getUser)).toBe('GET /users/{userId}');
  });
});

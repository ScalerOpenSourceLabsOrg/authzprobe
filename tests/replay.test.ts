import { describe, it, expect } from 'vitest';
import { buildUrl, authHeaders } from '../src/engine/replay.js';
import type { TestCase, SpecOperation } from '../src/types.js';

const op: SpecOperation = {
  method: 'get',
  path: '/users/{userId}/orders/{orderId}',
  pathParams: ['userId', 'orderId'],
  queryParams: [],
  hasSecurity: true,
  isSafe: true,
};

const testCase: TestCase = {
  id: 'x',
  kind: 'BOLA',
  operation: op,
  actor: 'a',
  pathValues: { userId: 'bob-456', orderId: 'order b1' },
  queryValues: { expand: 'items' },
  description: 'd',
  expectation: 'deny',
};

describe('buildUrl', () => {
  it('substitutes path params and encodes values', () => {
    const url = buildUrl('http://localhost:4010/', testCase);
    expect(url).toBe('http://localhost:4010/users/bob-456/orders/order%20b1?expand=items');
  });
});

describe('authHeaders', () => {
  it('builds a bearer header', () => {
    expect(authHeaders({ type: 'bearer', token: 'abc' })).toEqual({ Authorization: 'Bearer abc' });
  });

  it('builds a custom header', () => {
    expect(authHeaders({ type: 'header', header: 'X-Api-Key', value: 'k' })).toEqual({ 'X-Api-Key': 'k' });
  });

  it('builds a basic header', () => {
    const h = authHeaders({ type: 'basic', username: 'u', password: 'p' });
    expect(h.Authorization).toBe(`Basic ${Buffer.from('u:p').toString('base64')}`);
  });

  it('throws when bearer token is missing', () => {
    expect(() => authHeaders({ type: 'bearer' })).toThrow(/token/);
  });
});

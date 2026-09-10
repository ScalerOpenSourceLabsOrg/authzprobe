import { describe, it, expect } from 'vitest';
import { interpolateEnv, interpolateDeep } from '../src/util/env.js';
import { ConfigSchema } from '../src/config/schema.js';

describe('interpolateEnv', () => {
  it('replaces ${VAR} from the supplied env', () => {
    expect(interpolateEnv('Bearer ${TOK}', { TOK: 'xyz' })).toBe('Bearer xyz');
  });

  it('throws on a missing variable', () => {
    expect(() => interpolateEnv('${NOPE}', {})).toThrow(/NOPE/);
  });

  it('walks nested structures', () => {
    const out = interpolateDeep(
      { a: '${X}', b: ['${Y}', 1], c: { d: '${X}' } },
      { X: 'x', Y: 'y' },
    );
    expect(out).toEqual({ a: 'x', b: ['y', 1], c: { d: 'x' } });
  });
});

describe('ConfigSchema', () => {
  it('requires at least two identities', () => {
    const r = ConfigSchema.safeParse({
      baseUrl: 'http://x',
      identities: [{ name: 'solo', auth: { type: 'bearer', token: 't' } }],
    });
    expect(r.success).toBe(false);
  });

  it('accepts a well-formed config and applies defaults', () => {
    const r = ConfigSchema.safeParse({
      baseUrl: 'http://x',
      identities: [
        { name: 'a', auth: { type: 'bearer', token: 't' }, owns: { userId: ['a1'] } },
        { name: 'b', auth: { type: 'bearer', token: 't' }, owns: { userId: ['b1'] } },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.denyStatuses).toEqual([401, 403, 404]);
      expect(r.data.privileged).toEqual([]);
    }
  });

  it('rejects unknown top-level keys', () => {
    const r = ConfigSchema.safeParse({
      baseUrl: 'http://x',
      identities: [
        { name: 'a', auth: { type: 'bearer', token: 't' } },
        { name: 'b', auth: { type: 'bearer', token: 't' } },
      ],
      typo: true,
    });
    expect(r.success).toBe(false);
  });
});

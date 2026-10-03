import { describe, it, expect } from 'vitest';
import { generateRows, toCSV, toJSON, toSQL, MAX_ROWS } from './dataGenerator';

const fields = [{ name: 'name', type: 'fullName' as const }, { name: 'age', type: 'integer' as const }];

describe('dataGenerator', () => {
  it('generates the requested number of rows with the requested keys', () => {
    const rows = generateRows(fields, 25);
    expect(rows).toHaveLength(25);
    expect(Object.keys(rows[0])).toEqual(['name', 'age']);
  });
  it('is reproducible with a seed', () => {
    expect(generateRows(fields, 5, 42)).toEqual(generateRows(fields, 5, 42));
  });
  it('clamps the row count', () => {
    expect(generateRows(fields, 0)).toHaveLength(1);
    expect(MAX_ROWS).toBe(100_000);
  });
  it('quotes CSV values that contain commas, quotes or newlines', () => {
    const csv = toCSV([{ a: 'x,y', b: 'say "hi"', c: 'line1\nline2', d: 3 }], ['a', 'b', 'c', 'd']);
    expect(csv).toBe('a,b,c,d\n"x,y","say ""hi""","line1\nline2",3');
  });
  it('round-trips JSON', () => {
    const rows = [{ a: 1, b: 'two', c: true }];
    expect(JSON.parse(toJSON(rows))).toEqual(rows);
  });
  it('escapes SQL strings', () => {
    expect(toSQL([{ name: "O'Brien", age: 30, active: true }], 'users', ['name', 'age', 'active']))
      .toBe(`INSERT INTO "users" ("name", "age", "active") VALUES ('O''Brien', 30, TRUE);`);
  });
  it('keeps the explicit column order, even for integer-like names', () => {
    const rows = generateRows([
      { name: 'b', type: 'integer' }, { name: '2', type: 'integer' }, { name: 'a', type: 'integer' },
    ], 1, 1);
    const cols = ['b', '2', 'a'];
    expect(toCSV(rows, cols).split('\n')[0]).toBe('b,2,a');
    expect(toSQL(rows, 't', cols)).toContain('("b", "2", "a")');
  });
  it('rejects prototype-polluting field names', () => {
    for (const name of ['__proto__', 'constructor', 'prototype']) {
      expect(() => generateRows([{ name, type: 'integer' }], 1, 1)).toThrow(/not allowed/);
    }
  });
});

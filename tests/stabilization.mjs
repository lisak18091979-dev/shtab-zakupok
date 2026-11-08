import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import { DEFAULT_STATE, EXAMPLE_STATE, newItem } from '../src/lib/shtab/defaults.js';

const bundle = buildSync({ entryPoints: ['src/lib/shtab/calc.js'], bundle: true, platform: 'node', format: 'esm', write: false }).outputFiles[0].text;
const { analyze, coverageOf } = await import(`data:text/javascript;base64,${Buffer.from(bundle).toString('base64')}`);
const fresh = () => structuredClone(DEFAULT_STATE);

test('clean workspace contains no prefilled business numbers', () => {
  const s = fresh();
  assert.deepEqual(s.items, []);
  assert.ok(Object.values(s.params).every((v) => v === null));
  assert.ok(Object.values(s.three).every((v) => v === null));
  assert.equal(analyze(s).level, 'empty');
});

test('unknown supply facts never produce green or a zero estimate', () => {
  const s = fresh();
  s.items = [{ ...newItem(), name: 'Позиция' }];
  const a = analyze(s);
  assert.equal(a.rows[0].status, 'unknown');
  assert.equal(a.rows[0].risk, null);
  assert.equal(a.rows[0].manualStock, null);
});

test('manual coverage and quantity coverage remain separate', () => {
  const it = { ...newItem(), onhand: 100, perday: 10, stock: 3 };
  assert.equal(coverageOf({ ...it, stockMode: 'quantity' }).stock, 10);
  assert.equal(coverageOf({ ...it, stockMode: 'days' }).stock, 3);
  assert.equal(coverageOf({ ...it, stockMode: 'days', stock: null }).stockKnown, false);
  assert.equal(coverageOf({ ...it, stockMode: 'quantity', perday: null }).stockKnown, false);
  assert.equal(coverageOf({ ...it, stockMode: 'quantity', onhand: 0 }).stock, 0);
});

test('critical gap remains visible when its price is unknown', () => {
  const s = fresh();
  s.items = [{ ...newItem(), name: 'Дефицит', stockMode: 'days', stock: 0, replace: 3, effect: 'Остановит линию' }];
  const a = analyze(s);
  assert.equal(a.reds.length, 1);
  assert.equal(a.rows[0].risk, null);
  assert.equal(a.level, 'unassigned');
});

test('example scenario computes losses from uncovered stock days', () => {
  const a = analyze(EXAMPLE_STATE);
  assert.equal(a.risk, 106);
  assert.equal(a.loss, 8.5);
  assert.equal(a.valid.length, 4);
  assert.equal(a.rows[1].stock, 3);
});

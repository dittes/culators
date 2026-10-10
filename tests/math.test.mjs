import test from 'node:test';
import assert from 'node:assert/strict';
import { calculators } from '../calculators/math.mjs';

const bySlug = Object.fromEntries(calculators.map(c => [c.slug, c]));
const run = (slug, values) => bySlug[slug].calculate(values);

test('all 44 catalogue math tools have complete executable definitions', () => {
  assert.equal(calculators.length, 44);
  assert.equal(new Set(calculators.map(c => c.slug)).size, 44);
  for (const c of calculators) {
    assert.ok(c.description.length > 100, `${c.slug} description`);
    assert.ok(c.formula && c.explanation.length >= 200 && c.example);
    assert.equal(c.faqs.length, 2);
    assert.equal(typeof c.calculate, 'function');
    const values = Object.fromEntries(c.fields.map(f => [f.key, f.value]));
    const result = c.calculate(values);
    assert.ok(typeof result.value === 'number' || typeof result.value === 'string', `${c.slug} value`);
    assert.equal(typeof result.unit, 'string', `${c.slug} unit`);
    assert.ok(Array.isArray(result.details), `${c.slug} details`);
    if (result.chart) {
      assert.ok(result.chart.length >= 2, `${c.slug} chart has at least two points`);
      assert.ok(result.chartUnit, `${c.slug} chart unit`);
      assert.ok(result.chart.every(p => p.label && typeof p.value === 'number' && Number.isFinite(p.value) && p.value >= 0), `${c.slug} chart values`);
    }
  }
});

test('arithmetic and fraction calculations respect precedence and reduction', () => {
  assert.equal(run('basic-calculator', { expression: '(18+6)/3-2' }).value, 6);
  assert.equal(run('scientific-calculator', { expression: 'sqrt(9)+sin(pi/2)' }).value, 4);
  assert.equal(run('fraction-calculator', { a: '2', b: '3', op: '+', c: '1', d: '4' }).value, '11/12');
  assert.equal(run('fraction-calculator', { a: '1', b: '1000000000000', op: '+', c: '1', d: '1000000000000' }).value, '1/500000000000');
  assert.equal(run('fraction-calculator', { a: '1000000000000', b: '999999999999', op: '-', c: '999999999999', d: '1000000000000' }).value, '1999999999999/999999999999000000000000');
  assert.throws(() => run('fraction-calculator', { a: '1e2', b: 3, op: '+', c: 1, d: 3 }), /whole number written with digits/);
  assert.throws(() => run('fraction-calculator', { a: 1, b: 2, op: '/', c: 0, d: 3 }), /cannot be zero/);
  assert.throws(() => run('basic-calculator', { expression: 'process.exit()' }), /unsupported|only|syntax/i);
  assert.equal(run('scientific-calculator', { expression: '2^3^2' }).value, 512);
  assert.equal(run('scientific-calculator', { expression: '-2^2' }).value, -4);
  assert.throws(() => run('scientific-calculator', { expression: 'sqrt(-1)' }), /range|finite/i);
  assert.throws(() => run('scientific-calculator', { expression: '1/(3-3)' }), /zero/);
});

test('geometry, roots, powers, and equation solvers return known answers', () => {
  assert.equal(run('pythagorean-theorem-calculator', { known: 'legs', a: 3, b: 4 }).value, 5);
  assert.equal(run('circle-calculator', { given: 'diameter', value: 10 }).details.find(d => d.label === 'Area').value, 25 * Math.PI);
  assert.deepEqual(run('quadratic-formula-calculator', { a: 1, b: -5, c: 6 }).value.split(', ').map(Number).sort(), [2, 3]);
  assert.ok(Math.abs(run('root-calculator', { value: -125, index: 3 }).value + 5) < 1e-12);
  assert.throws(() => run('root-calculator', { value: -4, index: 2 }), /even root/);
  assert.throws(() => run('triangle-calculator', { a: 2, b: 3, angle: 180 }), /angle/);
});

test('statistics, probability, and inference calculations cover conventional cases', () => {
  assert.equal(run('standard-deviation-calculator', { values: '2,4,6', kind: 'sample' }).value, 2);
  assert.equal(run('mean-median-mode-range-calculator', { values: '2,3,3,8' }).details.find(d => d.label === 'Median').value, 3);
  assert.ok(Math.abs(run('probability-calculator', { n: 5, k: 2, p: .5, mode: 'exact' }).value - 31.25) < 1e-10);
  assert.equal(run('sample-size-calculator', { confidence: 95, margin: 5, proportion: 50, population: 0 }).value, 385);
  assert.ok(Math.abs(run('p-value-calculator', { z: 1.96, tail: 'two' }).value - .05) < .002);
  assert.throws(() => run('standard-deviation-calculator', { values: '1', kind: 'sample' }), /at least two/);
  assert.equal(run('statistics-calculator', { values: '7' }).details.find(d => d.label === 'Q1').value, 7);
});

test('charts show comparable nonnegative quantities for statistical, probability, ratio, and sample-size results', () => {
  const distribution = run('statistics-calculator', { values: '1,2,2,3,3,3' });
  assert.equal(distribution.chartUnit, 'observations');
  assert.deepEqual(distribution.chart, [{ label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }]);
  assert.equal(run('statistics-calculator', { values: '7' }).chart, undefined);
  const probability = run('probability-calculator', { n: 4, k: 2, p: .5, mode: 'exact' });
  assert.equal(probability.chartUnit, '% probability');
  assert.equal(probability.chart.length, 5);
  assert.ok(Math.abs(probability.chart.reduce((sum, point) => sum + point.value, 0) - 100) < 1e-10);
  const ratio = run('ratio-calculator', { a: 2, b: 3, total: 100 });
  assert.deepEqual(ratio.chart, [{ label: 'First part share', value: 40 }, { label: 'Second part share', value: 60 }]);
  assert.equal(ratio.chartUnit, 'total units');
  const sample = run('sample-size-calculator', { confidence: 95, margin: 5, proportion: 50, population: 0 });
  assert.equal(sample.chartUnit, 'responses');
  assert.equal(sample.chart[1].value, sample.value);
});

test('random number generator returns bounded secure integer and decimal batches', () => {
  const integers = run('random-number-generator', { min: -3, max: 2, count: 100, mode: 'integer' });
  assert.equal(integers.details.length, 100);
  assert.ok(integers.details.every(({ value }) => Number.isSafeInteger(value) && value >= -3 && value <= 2));
  assert.match(integers.note, /rejection sampling/);
  const singleton = run('random-number-generator', { min: 7, max: 7, count: 3, mode: 'integer' });
  assert.deepEqual(singleton.details.map(({ value }) => value), [7, 7, 7]);
  const decimals = run('random-number-generator', { min: -2.5, max: 4.25, count: 20, mode: 'decimal' });
  assert.ok(decimals.details.every(({ value }) => Number.isFinite(value) && value >= -2.5 && value < 4.25));
  assert.throws(() => run('random-number-generator', { min: '', max: 5, count: 2, mode: 'integer' }), /required/);
  assert.throws(() => run('random-number-generator', { min: 5, max: 4, count: 2, mode: 'integer' }), /maximum/i);
  assert.throws(() => run('random-number-generator', { min: 1, max: 1, count: 2, mode: 'decimal' }), /maximum/i);
  assert.throws(() => run('random-number-generator', { min: 1, max: 2, count: 1001, mode: 'integer' }), /1 to 1000/);
  assert.throws(() => run('random-number-generator', { min: 1, max: 'Infinity', count: 1, mode: 'decimal' }), /number/);
  assert.throws(() => run('random-number-generator', { min: 1, max: 2, count: 1, mode: 'other' }), /valid number type/);
});

test('integer and base conversions retain exact values and validate domains', () => {
  assert.equal(run('binary-calculator', { a: '1011', b: '101', op: '+' }).value, '10000');
  assert.equal(run('hex-calculator', { a: '2A', b: '10', op: '+' }).value, '3A');
  assert.equal(run('big-number-calculator', { a: '12345678901234567890', b: '10', op: '+' }).value, '12345678901234567900');
  assert.equal(run('prime-factorization-calculator', { n: 360 }).value, '2^3 × 3^2 × 5');
  assert.equal(run('lcm-calculator', { a: 12, b: 18 }).value, 36);
  assert.equal(run('lcm-calculator', { a: '1000000000', b: '999999999' }).value, '999999999000000000');
  assert.equal(run('gcf-calculator', { a: '1000000000', b: '999999999' }).value, 1);
  assert.throws(() => run('matrix-calculator', { a: '1,,2;3,4', b: '1,2;3,4', op: 'add' }), /empty matrix entry/);
  assert.throws(() => run('matrix-calculator', { a: '1,2; ;3,4', b: '1,2;3,4', op: 'add' }), /empty matrix entry/);
  assert.equal(run('long-division-calculator', { a: -17, b: 5 }).details.find(d => d.label === 'Remainder').value, -2);
  assert.throws(() => run('binary-calculator', { a: '102', b: '1', op: '+' }), /binary/);
  assert.throws(() => run('percent-calculator', { mode: '', a: '', b: 20 }), /valid question|a is required/i);
});

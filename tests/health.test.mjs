import test from 'node:test';
import assert from 'node:assert/strict';
import { calculators } from '../calculators/health.mjs';

const bySlug = Object.fromEntries(calculators.map(c => [c.slug, c]));
const run = (slug, values) => bySlug[slug].calculate(values);

test('all 31 catalogue health tools have usable definitions and finite defaults', () => {
  assert.equal(calculators.length, 31);
  assert.equal(new Set(calculators.map(c => c.slug)).size, 31);
  for (const c of calculators) {
    assert.ok(c.description.length > 100, `${c.slug} description`);
    assert.ok(c.formula && c.explanation.length >= 200 && c.example, `${c.slug} content`);
    assert.equal(c.faqs.length, 2, `${c.slug} FAQs`);
    assert.equal(typeof c.calculate, 'function');
    const values = Object.fromEntries(c.fields.map(f => [f.key, f.value]));
    const result = c.calculate(values);
    assert.ok(typeof result.value === 'number' || typeof result.value === 'string', `${c.slug} value`);
    assert.equal(typeof result.unit, 'string', `${c.slug} unit`);
    assert.ok(Array.isArray(result.details), `${c.slug} details`);
    for (const item of [result, ...result.details]) {
      if (typeof item.value === 'number') assert.ok(Number.isFinite(item.value), `${c.slug} finite output`);
    }
    if (result.chart) {
      assert.ok(result.chart.length >= 2, `${c.slug} chart has at least two points`);
      assert.ok(result.chartUnit, `${c.slug} chart unit`);
      assert.ok(result.chart.every(p => p.label && typeof p.value === 'number' && Number.isFinite(p.value) && p.value >= 0), `${c.slug} chart values`);
    }
  }
});

test('adult BMI, weight references, and body-composition estimates use stated equations', () => {
  assert.ok(Math.abs(run('bmi-calculator', { weight: 70, height: 175 }).value - 22.857142857) < 1e-8);
  assert.equal(run('healthy-weight-calculator', { weight: 70, height: 170 }).value, '53.5–72.0');
  assert.ok(Math.abs(run('body-fat-calculator', { weight: 70, height: 175, age: 30, sex: 'male' }).value - 18.1286) < .01);
  assert.equal(run('lean-body-mass-calculator', { weight: 80, bodyfat: 20 }).value, 64);
  assert.throws(() => run('bmi-calculator', { weight: 0, height: 175 }), /greater than zero/);
  assert.throws(() => run('bmi-calculator', { weight: '', height: 175 }), /required/);
});

test('energy and exercise estimators expose the assumptions in their outputs', () => {
  assert.equal(run('bmr-calculator', { weight: 70, height: 170, age: 35, sex: 'female' }).value, 1426.5);
  assert.equal(run('calories-burned-calculator', { weight: 70, activity: 'walking', minutes: 30 }).value, 128.625);
  assert.equal(run('target-heart-rate-calculator', { age: 40, zone: 'moderate' }).value, '90–126');
  assert.equal(run('one-rep-max-calculator', { load: 100, reps: 5, formula: 'epley' }).value, 100 * (1 + 5 / 30));
  assert.throws(() => run('macro-calculator', { calories: 2000, protein: 30, carbs: 45, fat: 30 }), /add to 100/);
});

test('health charts compare values in one explicit unit', () => {
  assert.deepEqual(run('macro-calculator', { calories: 2000, protein: 30, carbs: 40, fat: 30 }).chart,
    [{ label: 'Protein energy', value: 600 }, { label: 'Carbohydrate energy', value: 800 }, { label: 'Fat energy', value: 600 }]);
  assert.equal(run('macro-calculator', { calories: 2000, protein: 30, carbs: 40, fat: 30 }).chartUnit, 'kcal/day');
  const ideal = run('ideal-weight-calculator', { height: 173, sex: 'female' });
  assert.equal(ideal.chart.length, 4);
  assert.equal(ideal.chartUnit, 'kg');
  const healthy = run('healthy-weight-calculator', { weight: 70, height: 170 });
  assert.equal(healthy.chartUnit, 'kg');
  assert.equal(healthy.chart[1].value, 70);
  const hr = run('target-heart-rate-calculator', { age: 40, zone: 'moderate' });
  assert.deepEqual(hr.chart, [{ label: 'Lower zone boundary', value: 90 }, { label: 'Upper zone boundary', value: 126 }]);
  assert.equal(hr.chartUnit, 'bpm');
  const energy = run('tdee-calculator', { weight: 70, height: 170, age: 35, sex: 'female', activity: 'light' });
  assert.equal(energy.chartUnit, 'kcal/day');
  assert.equal(energy.chart[0].value, energy.details[0].value);
});

test('pregnancy date estimates use UTC calendar arithmetic and explicit ranges', () => {
  assert.equal(run('due-date-calculator', { method: 'lmp', date: '2026-01-01' }).value, '2026-10-08');
  assert.equal(run('due-date-calculator', { method: 'ivf', date: '2026-03-01' }).value, '2026-11-17');
  assert.equal(run('period-calculator', { lmp: '2026-03-01', cycle: 28 }).value, '2026-03-29');
  assert.equal(run('pregnancy-weight-gain-calculator', { height: 165, preweight: 65, gain: 5, week: 20, multiples: 'singleton' }).value, '11.3–15.9');
  assert.throws(() => run('pregnancy-calculator', { lmp: '2026-02-30', cycle: 28 }), /valid calendar date/);
});

test('kidney, surface, Army screening, and alcohol calculations match domain definitions', () => {
  assert.ok(Math.abs(run('gfr-calculator', { age: 50, creatinine: 1, unit: 'mg', sex: 'male' }).value - 91.8) < .5);
  assert.ok(Math.abs(run('body-surface-area-calculator', { weight: 70, height: 170 }).value - Math.sqrt(170 * 70 / 3600)) < 1e-12);
  assert.ok(Math.abs(run('army-body-fat-calculator', { waist: 36, height: 70 }).value - 36 / 70) < 1e-12);
  assert.equal(run('weight-watchers-points-calculator', { allowance: 25, used: 17 }).value, 8);
  assert.ok(run('bac-calculator', { weight: 70, drinks: 2, hours: 2, sex: 'female' }).value >= 0);
  assert.throws(() => run('gfr-calculator', { age: 17, creatinine: 1, unit: 'mg', sex: 'male' }), /between 18/);
  assert.throws(() => run('target-heart-rate-calculator', { age: 40, zone: 'invented' }), /valid target zone/);
});

test('WeightWatchers-labeled calculator uses the documented historical nutrition estimate and separate budget mode', () => {
  const food = run('weight-watchers-points-calculator', { mode: 'legacy-food', calories: 270, fat: 14, fiber: 4 });
  assert.equal(food.value, 6);
  assert.equal(food.unit, 'legacy points / serving');
  assert.ok(Math.abs(food.details[0].value - (270 / 50 + 14 / 12 - 4 / 5)) < 1e-12);
  assert.match(food.note, /historical formula only/i);
  assert.ok(bySlug['weight-watchers-points-calculator'].sources.some(source => source.url.includes('patents.google.com/patent/US6040531A')));
  assert.equal(run('weight-watchers-points-calculator', { mode: 'legacy-food', calories: 263, fat: 0, fiber: 0 }).value, 5.5);
  const budget = run('weight-watchers-points-calculator', { mode: 'budget', allowance: 25, used: 17 });
  assert.equal(budget.value, 8);
  assert.match(budget.note, /does not assign food points/i);
  assert.equal(run('weight-watchers-points-calculator', { allowance: 25, used: 17 }).value, 8);
});

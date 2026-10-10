import test from 'node:test';
import assert from 'node:assert/strict';
import { calculators } from '../calculators/everyday.mjs';
const bySlug = Object.fromEntries(calculators.map(x => [x.slug, x]));
const run = (slug, values) => bySlug[slug].calculate(values);
const close = (actual, expected, tolerance = 0.02) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

test('everyday catalogue coverage and editorial shape', async () => {
  const { readFile } = await import('node:fs/promises');
  const catalogue = JSON.parse(await readFile(new URL('../data/catalogue.json', import.meta.url), 'utf8')).filter(x => x.category === 'everyday');
  assert.equal(calculators.length, 54);
  assert.deepEqual(new Set(calculators.map(x => x.slug)), new Set(catalogue.map(x => x.slug)));
  for (const item of calculators) {
    assert.ok(item.fields.length, `${item.slug} needs fields`);
    assert.ok(item.explanation.length > 180, `${item.slug} needs substantial explanation`);
    assert.ok(item.faqs.length >= 2, `${item.slug} needs two FAQs`);
    assert.ok(item.formula.length > 15, `${item.slug} needs a meaningful formula`);
  }
});

test('calendar arithmetic validates dates, counts leap days, and handles weekday', () => {
  assert.equal(run('age-calculator', { birthDate: '2000-02-29', asOf: '2025-02-28' }).value, 24);
  assert.equal(run('age-calculator', { birthDate: '2000-02-29', asOf: '2025-03-01' }).value, 25);
  assert.equal(run('date-calculator', { date: '2024-02-28', days: '1' }).value, '2024-02-29');
  assert.throws(() => run('date-calculator', { date: '2025-02-30', days: 1 }), /valid date/i);
  assert.throws(() => run('date-calculator', { date: '9999-12-31', days: 1 }), /years 0000 through 9999/i);
  assert.throws(() => run('date-calculator', { date: '2025-01-01', days: 0.5 }), /whole number/i);
  assert.equal(run('day-of-the-week-calculator', { date: '2024-02-29' }).value, 'Thursday');
  assert.equal(run('day-counter', { start: '2025-03-01', end: '2025-03-08', inclusive: 'yes' }).value, 8);
});

test('clock tools handle overnight shifts and reject impossible breaks', () => {
  assert.equal(run('time-duration-calculator', { start: '22:45', end: '01:15' }).value, '2h 30m');
  assert.equal(run('time-card-calculator', { start: '08:30', end: '17:00', break: 30 }).value, 8);
  assert.throws(() => run('time-card-calculator', { start: '08:30', end: '17:00', break: 600 }), /break/i);
  assert.throws(() => run('time-calculator', { time: '12:00', hours: 1.5, minutes: 0, direction: 'add' }), /whole numbers/i);
  assert.equal(run('time-calculator', { time: '23:30', hours: 2, minutes: 45, direction: 'add' }).value, '02:15');
});

test('weighted academic results use credits and score weights', () => {
  close(run('gpa-calculator', { grade1: 4, credits1: 3, grade2: 3, credits2: 1, grade3: 3, credits3: 0.01 }).value, 3.749, 0.002);
  close(run('grade-calculator', { score1: 85, weight1: 40, score2: 90, weight2: 60, target: 90 }).value, 88);
  assert.throws(() => run('gpa-calculator', { grade1: 4, credits1: 0, grade2: 3, credits2: 3, grade3: 3, credits3: 3 }), /greater than zero/i);
});

test('engineering and materials calculations return expected physical quantities', () => {
  close(run('concrete-calculator', { length: 4, width: 3, thickness: .1, waste: 0 }).value, 1.2);
  close(run('voltage-drop-calculator', { length: 10, current: 5, area: 1.5, resistivity: .0175 }).value, 1.1667, .001);
  close(run('horsepower-calculator', { torque: 300, rpm: 4000 }).value, 228.48, .1);
  close(run('ohms-law-calculator', { voltage: 12, current: 2, resistance: 6 }).value, 24);
  close(run('tire-size-calculator', { width: 205, aspect: 55, rim: 16 }).value, 631.9, .2);
  assert.throws(() => run('stair-calculator', { rise: 108, run: 60 }), /stair geometry/i);
  assert.throws(() => run('stair-calculator', { rise: 5, run: 30 }), /at least two risers/i);
});

test('weather formulas and limits follow NWS domains', () => {
  close(run('wind-chill-calculator', { temperature: 30, wind: 10 }).value, 21.2, .2);
  close(run('heat-index-calculator', { temperature: 90, humidity: 70 }).value, 105.9, .5);
  assert.throws(() => run('wind-chill-calculator', { temperature: 55, wind: 10 }), /applies/i);
  close(run('dew-point-calculator', { temperature: 20, humidity: 50 }).value, 9.3, .2);
});

test('network, chemistry, and text conversions validate their inputs', () => {
  assert.equal(run('ip-subnet-calculator', { ip: '192.168.1.10', prefix: 24 }).value, '192.168.1.0/24');
  assert.equal(run('molecular-weight-calculator', { formula: 'Ca(OH)2' }).value.toFixed(2), '74.09');
  assert.equal(run('roman-numeral-converter', { input: '2024', mode: 'integer' }).value, 'MMXXIV');
  assert.throws(() => run('roman-numeral-converter', { input: 'IIII', mode: 'roman' }), /canonical/i);
  assert.equal(run('base64-encode-decode', { text: 'cat', mode: 'encode' }).value, 'Y2F0');
  assert.equal(run('url-encode-decode', { text: 'red tea & milk', mode: 'encode' }).value, 'red%20tea%20%26%20milk');
});

test('financial and practical estimates have sensible known answers', () => {
  close(run('fuel-cost-calculator', { distance: 500, economy: 8, price: 1.8 }).value, 72);
  close(run('gdp-calculator', { consumption: 500, investment: 120, government: 200, exports: 80, imports: 100 }).value, 800);
  close(run('gas-mileage-calculator', { distance: 300, fuel: 10 }).value, 30);
  close(run('tip-calculator', { bill: 80, tip: 20, people: 4, includeTax: 'no', tax: 0 }).value, 24);
  close(run('mulch-calculator', { area: 200, depth: 3 }).value, 200/12/27*3);
});

test('random generators produce values within configured bounds', () => {
  const p = run('password-generator', { length: 24, lower: true, upper: true, digits: true, symbols: true }).value;
  assert.equal(p.length, 24);
  assert.match(p, /[a-z]/); assert.match(p, /[A-Z]/); assert.match(p, /[2-9]/); assert.match(p, /[!@#$%^&*()\-_=+\[\]{}?]/);
  const d = run('dice-roller', { count: 20, sides: 6 });
  assert.equal(d.value >= 20 && d.value <= 120, true);
  assert.throws(() => run('password-generator', { length: 7, lower: true, upper: false, digits: false, symbols: false }), /between/i);
});

test('time-zone conversion uses the selected date and rejects daylight-saving gaps and repeats', () => {
  const winter = run('time-zone-calculator', { date: '2025-01-15', time: '09:00', fromZone: 'Europe/Berlin', toZone: 'America/New_York' });
  assert.equal(winter.value, '2025-01-15 03:00');
  assert.throws(() => run('time-zone-calculator', { date: '2025-03-09', time: '02:30', fromZone: 'America/New_York', toZone: 'Europe/Berlin' }), /does not exist/i);
  assert.throws(() => run('time-zone-calculator', { date: '2025-11-02', time: '01:30', fromZone: 'America/New_York', toZone: 'Europe/Berlin' }), /ambiguous/i);
});

test('required numeric fields and unknown select options are rejected', () => {
  assert.throws(() => run('concrete-calculator', { length: '', width: 3, thickness: .1, waste: 0 }), /required/i);
  assert.throws(() => run('conversion-calculator', { value: 1, from: 'parsec', to: 'm' }), /listed options/i);
  assert.throws(() => run('conversion-calculator', { value: 1, from: 'km', to: 'kg' }), /same measurement category/i);
  assert.throws(() => run('time-calculator', { time: '12:00', hours: 1, minutes: 0, direction: 'sideways' }), /listed options/i);
});

test('date limits and IPv4 CIDR edge prefixes are handled explicitly', () => {
  assert.throws(() => run('date-calculator', { date: '2025-01-01', days: 365001 }), /365,000/i);
  const allV4 = run('ip-subnet-calculator', { ip: '203.0.113.8', prefix: 0 });
  assert.equal(allV4.value, '0.0.0.0/0');
  assert.equal(allV4.details.find(x => x.label === 'Broadcast address').value, '255.255.255.255');
  const pointToPoint = run('ip-subnet-calculator', { ip: '192.0.2.11', prefix: 31 });
  assert.equal(pointToPoint.value, '192.0.2.10/31');
  assert.equal(pointToPoint.details.find(x => x.label === 'Usable hosts (conventional)').value, 2);
  const oneHost = run('ip-subnet-calculator', { ip: '192.0.2.11', prefix: 32 });
  assert.equal(oneHost.details.find(x => x.label === 'Usable hosts (conventional)').value, 1);
});

test('conversion handles affine temperatures and absolute-zero boundaries', () => {
  close(run('conversion-calculator', { value: 32, from: 'F', to: 'C' }).value, 0, 1e-10);
  close(run('conversion-calculator', { value: 0, from: 'C', to: 'K' }).value, 273.15, 1e-10);
  assert.throws(() => run('conversion-calculator', { value: -460, from: 'F', to: 'C' }), /absolute zero/i);
});

test('password generation uses changing secure draws and keeps the requested length', () => {
  const generated = Array.from({length:4}, () => run('password-generator', { length: 32, lower: true, upper: true, digits: true, symbols: true }).value);
  assert.ok(generated.every(p => p.length === 32));
  assert.equal(new Set(generated).size, generated.length);
  assert.ok(generated.every(p => new Set(p).size > 12));
});

test('calculator charts contain only finite nonnegative values', () => {
  for (const slug of ['gpa-calculator','grade-calculator','concrete-calculator','gdp-calculator','roofing-calculator','tile-calculator','tip-calculator','bandwidth-calculator','sleep-calculator']) {
    const tool=bySlug[slug], values=Object.fromEntries(tool.fields.map(field=>[field.key,field.value]));
    const output=tool.calculate(values);
    assert.ok(output.chart?.length >= 2, `${slug} should return a useful chart`);
    assert.ok(output.chart.every(point=>Number.isFinite(point.value)&&point.value>=0), `${slug} chart values must be finite and nonnegative`);
  }
});

test('Ohm law solves any two circuit values and checks a fully specified set', () => {
  assert.equal(run('ohms-law-calculator', { voltage: '', current: 2, resistance: 6 }).value, 24);
  assert.equal(run('ohms-law-calculator', { voltage: 12, current: '', resistance: 6 }).details.find(x=>x.label==='Current').value, 2);
  assert.throws(() => run('ohms-law-calculator', { voltage: '', current: 2, resistance: '' }), /any two/i);
  assert.throws(() => run('ohms-law-calculator', { voltage: 12, current: 2, resistance: 10 }), /do not satisfy/i);
});

test('WHS handicap subset applies fewer-than-20 score-count adjustments', () => {
  assert.equal(run('golf-handicap-calculator', { differentials: '10,12,15' }).value, 8);
  assert.equal(run('golf-handicap-calculator', { differentials: '10,12,14,16' }).value, 9);
  assert.equal(run('golf-handicap-calculator', { differentials: '10,12,14,16,18,20' }).value, 10);
  assert.ok(bySlug['golf-handicap-calculator'].sources[0].url.includes('usga.org'));
});

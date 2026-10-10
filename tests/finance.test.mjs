import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { calculators } from '../calculators/finance.mjs';

const bySlug = new Map(calculators.map((c) => [c.slug, c]));
const values = (slug, changes = {}) => Object.fromEntries(bySlug.get(slug).fields.map((field) => [field.key, String(changes[field.key] ?? field.value)]));
const run = (slug, changes) => bySlug.get(slug).calculate(values(slug, changes));

test('finance definitions cover every finance catalogue slug with complete page content', async () => {
  const catalogue = JSON.parse(await readFile(new URL('../data/catalogue.json', import.meta.url), 'utf8'));
  const expected = catalogue.filter((entry) => entry.category === 'finance').map((entry) => entry.slug).sort();
  assert.deepEqual([...bySlug.keys()].sort(), expected);
  for (const c of calculators) {
    assert.ok(c.title && c.description && c.formula && c.explanation && c.example, c.slug);
    assert.ok(c.fields.length >= 1, c.slug);
    assert.ok(c.faqs.length >= 2, c.slug);
    const out = c.calculate(values(c.slug));
    assert.ok(Number.isFinite(Number(out.value)), `${c.slug}: result should be finite`);
    assert.ok(out.details.length > 0, `${c.slug}: explain the result`);
  }
});

test('fixed-rate installment calculations handle known and zero-interest cases', () => {
  assert.ok(Math.abs(run('mortgage-calculator', {principal:240000,rate:6,years:30}).value - 1438.92) < 0.02);
  assert.equal(run('loan-calculator', {principal:1200,rate:0,years:1}).value, 100);
  assert.ok(Math.abs(run('amortization-calculator', {principal:100000,rate:6,years:20}).value - 716.43) < 0.02);
});

test('investment, tax, RMD and return formulas expose useful intermediate values', () => {
  assert.ok(Math.abs(run('simple-interest-calculator', {amount:2000,rate:5,years:3}).value - 2300) < 1e-8);
  assert.ok(Math.abs(run('tax-calculator', {income:80000,deduction:15000,rate:20}).value - 13000) < 1e-8);
  assert.ok(Math.abs(run('rmd-calculator', {balance:200000,divisor:25.5}).value - 7843.1372549) < 0.001);
  assert.ok(Math.abs(run('roi-calculator', {initial:10000,final:12500}).value - 25) < 1e-8);
});

test('specialized finance tools calculate debt payoff, taxes, leasing, housing and rental cash flow', () => {
  assert.equal(run('sales-tax-calculator', {amount:50,rate:8}).value, 54);
  assert.ok(run('credit-card-payoff-calculator', {balance:5000,rate:18,payment:200}).value > 0);
  assert.ok(run('auto-lease-calculator', {price:35000,residual:20000,down:3000,rate:5,years:3}).value > 0);
  assert.ok(run('canadian-mortgage-calculator', {price:400000,down:80000,rate:5,years:25}).value > 0);
  assert.ok(run('rental-property-calculator', {price:300000,rent:2400,vacancy:5,expenses:8000,down:60000}).value > 0);
});

test('unsafe or internally inconsistent inputs fail with specific errors', () => {
  assert.throws(() => run('mortgage-calculator', {principal:-1}), /Loan amount/);
  assert.throws(() => run('mortgage-calculator', {principal:''}), /required/);
  assert.throws(() => run('house-affordability-calculator', {price:100000,down:120000}), /Down payment cannot exceed/);
  assert.throws(() => run('credit-card-payoff-calculator', {balance:5000,rate:24,payment:50}), /must exceed.*interest/);
  assert.throws(() => run('rmd-calculator', {balance:100000,divisor:0}), /divisor/);
});

test('APR includes origination fees and FHA/VA estimates expose editable program charges', () => {
  const apr = run('apr-calculator', {principal:10000,rate:0,years:1/12,fees:100});
  assert.ok(Math.abs(apr.value - 12.12121212) < 0.00001);
  assert.ok(Math.abs(apr.details.find(([label]) => label === 'Effective annual rate')[1] - 12.81780995) < 0.00001);
  const ca = run('canadian-mortgage-calculator', {price:400000,down:80000,rate:5,years:25});
  assert.ok(Math.abs(ca.value - 1861.13595) < 0.01);
  const fha = run('fha-loan-calculator', {price:300000,down:15000,rate:6,years:30,upfrontInsurance:1.75,annualInsurance:0.55});
  assert.ok(Math.abs(fha.details.find(([label]) => label === 'Assumed upfront insurance financed')[1] - 4987.5) < 0.01);
  assert.ok(fha.value > run('fha-loan-calculator', {price:300000,down:15000,rate:6,years:30,upfrontInsurance:0,annualInsurance:0}).value);
  const va = run('va-mortgage-calculator', {price:350000,down:20000,rate:6,years:30,fundingFee:2});
  assert.equal(va.details.find(([label]) => label === 'Assumed funding fee financed')[1], 6600);
  assert.ok(va.value > run('va-mortgage-calculator', {price:350000,down:20000,rate:6,years:30,fundingFee:0}).value);
});

test('every main result has a specific label and every explanation is substantive', () => {
  for (const c of calculators) {
    const out = c.calculate(values(c.slug));
    assert.ok(out.label && out.label !== c.title, `${c.slug}: result label should name a quantity`);
    assert.ok(c.explanation.length >= 100, `${c.slug}: explanation should explain the method`);
    assert.ok(c.faqs.every((faq) => faq.q.length > 15 && faq.a.length > 40), c.slug);
  }
});

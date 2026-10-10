import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators} from '../calculators/extra.mjs';
const run=(slug,values={})=>{const t=calculators.find(t=>t.slug===slug);return t.calculate({...Object.fromEntries(t.fields.map(f=>[f.key,String(f.value)])),...values});};
test('unit price compares like quantities and handles free products',()=>{assert.ok(Math.abs(run('unit-price-calculator').value-7/850*100)<1e-10);assert.equal(run('unit-price-calculator',{costA:0}).value,0);assert.throws(()=>run('unit-price-calculator',{sizeB:0}));assert.throws(()=>run('unit-price-calculator',{costA:''}));});
test('reading time counts whitespace-separated words and rejects empty text',()=>{assert.equal(run('reading-time-calculator',{text:'one two\nthree',speed:3}).value,1);assert.throws(()=>run('reading-time-calculator',{text:' '}));});
test('break-even uses whole units and requires positive contribution',()=>{assert.equal(run('break-even-calculator').value,500);assert.equal(run('break-even-calculator',{fixed:101,price:5,variable:3}).value,51);assert.throws(()=>run('break-even-calculator',{price:30,variable:30}));});

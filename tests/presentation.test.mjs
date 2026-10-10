import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators as finance} from '../calculators/finance.mjs';
import {resultMarkup} from '../assets/render.mjs';
import {enrichResult} from '../assets/visuals.mjs';
import {convert} from '../assets/settings.mjs';
test('ROI breakdown renders array-based details and compares investment values without a 100% ring',()=>{
 const tool=finance.find(t=>t.slug==='roi-calculator'),values={initial:10000,final:16000,years:5};
 const result=enrichResult(tool,values,tool.calculate(values)),html=resultMarkup(result);
 assert.equal(result.value,60);assert.ok(html.includes('Initial investment'));assert.ok(html.includes('16,000'));assert.ok(!html.includes('100% ring'));assert.ok(result.chart.every(d=>Number.isFinite(d.value)));assert.ok(!html.includes('<dt></dt>'));
});
test('unit settings conversions preserve lengths, mass, speed and affine temperatures',()=>{
 assert.ok(Math.abs(convert(2.54,'cm','in')-1)<1e-12);assert.equal(convert(0,'°C','°F'),32);assert.equal(convert(212,'°F','°C'),100);assert.ok(Math.abs(convert(1,'kg','lb')-2.2046226218)<1e-8);assert.ok(Math.abs(convert(1,'mi','km')-1.609344)<1e-12);
});
test('IRR is expressed as a percentage, not a currency amount',()=>{
 const irr=finance.find(t=>t.slug==='irr-calculator').calculate({initial:100,annual:110,rate:5,years:1});
 assert.ok(Math.abs(irr.value-10)<1e-10);assert.equal(irr.unit,'%');
});
test('German presentation preserves passwords and IPv4 data while localizing measured decimal values',async()=>{
 const {localizeResult}=await import('../assets/i18n.mjs');
 const password='Math-3.14-Your result';assert.equal(localizeResult({value:password,details:[]},'password-generator').value,password);
 const data=localizeResult({value:'192.168.1.0',details:[{label:'Range',value:'192.168.1.0 – 192.168.1.255'},{label:'Weight',value:'53.5–72.0 kg'}]});assert.equal(data.value,'192.168.1.0');assert.equal(data.details[0].value,'192.168.1.0 – 192.168.1.255');assert.equal(data.details[1].value,'53,5–72,0 kg');
});

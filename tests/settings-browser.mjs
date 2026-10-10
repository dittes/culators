import assert from 'node:assert/strict';
import {chromium} from '/Users/dittes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
const load=async(path)=>{await page.goto('http://localhost:4173'+path);await page.waitForFunction(()=>document.querySelector('main').dataset.ready==='true');};
try {
 await load('/en/bmi-calculator/');const bmi=await page.locator('[data-result-value]').textContent(),kg=Number(await page.locator('[name=weight]').inputValue());
 await page.locator('.calculator-settings summary').click();await page.locator('[data-units]').selectOption('imperial');assert.ok(Number(await page.locator('[name=weight]').inputValue())>kg*2);assert.equal(await page.locator('[data-result-value]').textContent(),bmi);
 await page.locator('[data-share]').click();const link=await page.evaluate(()=>navigator.clipboard.readText());assert.ok(link.includes('_units=imperial'));await page.goto(link);await page.waitForFunction(()=>document.querySelector('main').dataset.ready==='true');assert.equal(await page.locator('[data-result-value]').textContent(),bmi);
 await page.locator('button[type=reset]').click();await page.waitForTimeout(50);assert.equal(Number(await page.locator('[name=weight]').inputValue()),kg);
 await load('/en/roi-calculator/');await page.locator('.calculator-settings summary').click();await page.locator('[data-currency]').selectOption('EUR');assert.ok((await page.locator('.chart-legend').innerText()).includes('EUR'));assert.equal(await page.locator('[data-result-value]').textContent(),'60');assert.equal(await page.locator('.result-details dt').count(),4);assert.equal(await page.locator('.calc-visual').count(),0);
 await load('/en/currency-calculator/');await page.locator('.calculator-settings summary').click();await page.locator('[data-source]').selectOption('GBP');await page.locator('[data-target]').selectOption('EUR');assert.ok((await page.locator('[data-field=rate] label').innerText()).includes('EUR per 1 GBP'));assert.equal(await page.locator('.result-unit').innerText(),'EUR');
 await load('/en/pace-calculator/');assert.equal(await page.locator('[data-units]').count(),0);await page.locator('[name=unit]').selectOption('mi');assert.equal(await page.locator('[data-field=distance] .unit').innerText(),'mi');assert.equal(await page.locator('.calc-visual').count(),0);
 await load('/de/roi-calculator/');assert.equal(await page.locator('h1').innerText(),'ROI-Rechner');assert.ok((await page.locator('.result-details').innerText()).includes('Anfangsinvestition'));assert.equal(await page.locator('.language').getAttribute('href'),'/en/roi-calculator/');
 await page.locator('button[type=submit]').click();await page.waitForTimeout(50);assert.ok((await page.locator('#result-status').innerText()).includes('berechnet'));assert.ok((await page.locator('[data-field=years] .unit').innerText()).includes('Jahre'));
 await page.locator('.sidebar-category > summary').last().click();assert.ok(await page.locator('.sidebar-category').last().getAttribute('open')!==null);
 await page.goto('http://localhost:4173/de/');await page.locator('#calculator-search').fill('Zinseszins');assert.ok(Number((await page.locator('#search-count').innerText()).split(' ')[0])>0);
 console.log('Passed: metric/imperial conversion preserves BMI, share/reset settings, ROI currency/chart/rows, currency-pair controls, pace unit selector, German runtime/search/language links and sidebar expansion.');
}finally{await browser.close();}

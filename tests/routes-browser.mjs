import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '/Users/dittes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const routes=JSON.parse(await readFile('dist/assets/routes.json','utf8'));
const redirects=JSON.parse(await readFile('dist/redirects.json','utf8'));
for(const[from,to]of Object.entries(redirects)){
 const response=await fetch('http://localhost:4173'+from+'?weight=93&_currency=EUR',{redirect:'manual'});
 assert.equal(response.status,301,from);assert.equal(response.headers.get('location'),to+'?weight=93&_currency=EUR');
}
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:375,height:900}});
 await page.goto('http://localhost:4173/de/bmi-calculator/?weight=93');await page.waitForFunction(()=>document.querySelector('main').dataset.ready==='true');assert.equal(new URL(page.url()).pathname,'/de/bmi-rechner/');assert.equal(await page.locator('[name=weight]').inputValue(),'93');
 await page.goto('http://localhost:4173/cs/body-fat-calculator/?weight=80');await page.waitForFunction(()=>document.querySelector('main').dataset.ready==='true');assert.equal(new URL(page.url()).pathname,routes.cs['body-fat-calculator']);assert.equal(await page.locator('.language-menu > summary').innerText(),'CZ');assert.equal(await page.locator('html').getAttribute('lang'),'cs');
 for(const lang of ['de','cs','pl']){
  await page.goto('http://localhost:4173'+routes[lang]['']);await page.locator('[data-open-search]').last().click();await page.locator('#dialog-query').fill('BMI');await page.waitForFunction(()=>document.querySelector('#dialog-results a'));
  assert.equal(await page.locator('#dialog-results a').first().getAttribute('href'),routes[lang]['bmi-calculator']);await page.locator('#dialog-results a').first().click();await page.waitForFunction(()=>document.querySelector('main').dataset.ready==='true');
  for(const other of ['en','de','cs','pl'])assert.equal(await page.locator(`[data-language=${other}]`).getAttribute('href'),routes[other]['bmi-calculator']);
  await page.locator('button[type=submit]').click();assert.equal(await page.locator('#form-error').innerText(),'');
 }
 // Static fallback pages preserve query/hash on hosts that do not consume _redirects.
 await page.goto('http://localhost:4173/en/');await page.route('**/legacy-route/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><head><script type="module" src="/assets/redirect.mjs"></script></head><body data-redirect="/de/bmi-rechner/"></body>'}));await page.goto('http://localhost:4173/legacy-route/?weight=81#result-output');await page.waitForURL('**/de/bmi-rechner/?weight=81#result-output');assert.equal(new URL(page.url()).search,'?weight=81');
 console.log(`Passed ${Object.keys(redirects).length} legacy redirect mappings, query retention, CZ folder/label with cs language semantics, localized search and four-language counterparts.`);
}finally{await browser.close();}

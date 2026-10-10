import {readFile} from 'node:fs/promises';
const routes=JSON.parse(await readFile('dist/assets/routes.json','utf8'));
import assert from 'node:assert/strict';
import {chromium} from '/Users/dittes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const page=await browser.newPage();
 for(const lang of ['en','de','cs','pl']){
  await page.goto('http://localhost:4173'+routes[lang]['']);
  const hero=await page.locator('.text-accent').evaluate(el=>getComputedStyle(el).color);
  await page.goto('http://localhost:4173'+routes[lang]['roi-calculator']);
  await page.waitForFunction(()=>document.querySelector('main').dataset.ready==='true');
  const styles=await page.locator('button[type=submit]').evaluate(el=>({color:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));
  assert.ok(['rgb(255, 255, 255)','oklch(1 0 0)'].includes(styles.color));assert.equal(styles.bg,hero,'Hero and primary button share the same orange');
  const compare=await page.locator('[data-compare]').evaluate(el=>getComputedStyle(el).backgroundColor);assert.notEqual(compare,styles.bg);
  if(lang!=='en'){assert.equal(await page.locator('[data-currency]').inputValue(),lang==='de'?'EUR':lang==='pl'?'PLN':'CZK');assert.ok((await page.locator('.chart-legend').innerText()).includes(lang==='de'?'EUR':lang==='pl'?'PLN':'CZK'));}
  await page.locator('.language-menu > summary').click();
  for(const code of ['en','de','cs','pl'])assert.equal(await page.locator(`[data-language=${code}]`).getAttribute('href'),routes[code]['roi-calculator']);
 }
 await page.goto('http://localhost:4173/de/roi-calculator/?_currency=USD');await page.waitForFunction(()=>document.querySelector('main').dataset.ready==='true');assert.equal(await page.locator('[data-currency]').inputValue(),'USD');
 await page.goto('http://localhost:4173/cz/');await page.locator('#calculator-search').fill('BMI');assert.ok(Number((await page.locator('#search-count').innerText()).split(' ')[0])>0);
 await page.goto('http://localhost:4173/pl/');await page.locator('#calculator-search').fill('ROI');await page.waitForTimeout(50);assert.equal(await page.locator('#search-count').innerText(),'1 kalkulator');
 console.log('Passed white primary labels, neutral scenario button, consistent orange, EUR/CZK/PLN defaults, explicit USD override, four language counterparts and Czech search.');
}finally{await browser.close();}

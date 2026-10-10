import assert from 'node:assert/strict';
import {chromium} from '/Users/dittes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const page=await browser.newPage();
 for(const lang of ['en','de','cs']){
  await page.goto(`http://localhost:4173/${lang}/`);
  const hero=await page.locator('.text-accent').evaluate(el=>getComputedStyle(el).color);
  await page.goto(`http://localhost:4173/${lang}/roi-calculator/`);
  await page.waitForFunction(()=>document.querySelector('main').dataset.ready==='true');
  const styles=await page.locator('button[type=submit]').evaluate(el=>({color:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));
  assert.ok(['rgb(255, 255, 255)','oklch(1 0 0)'].includes(styles.color));assert.equal(styles.bg,hero,'Hero and primary button share the same orange');
  const compare=await page.locator('[data-compare]').evaluate(el=>getComputedStyle(el).backgroundColor);assert.notEqual(compare,styles.bg);
  if(lang!=='en'){assert.equal(await page.locator('[data-currency]').inputValue(),lang==='de'?'EUR':'CZK');assert.ok((await page.locator('.chart-legend').innerText()).includes(lang==='de'?'EUR':'CZK'));}
  await page.locator('.language-menu > summary').click();
  for(const code of ['en','de','cs'])assert.equal(await page.locator(`[data-language=${code}]`).getAttribute('href'),`/${code}/roi-calculator/`);
 }
 await page.goto('http://localhost:4173/de/roi-calculator/?_currency=USD');await page.waitForFunction(()=>document.querySelector('main').dataset.ready==='true');assert.equal(await page.locator('[data-currency]').inputValue(),'USD');
 await page.goto('http://localhost:4173/cs/');await page.locator('#calculator-search').fill('BMI');assert.ok(Number((await page.locator('#search-count').innerText()).split(' ')[0])>0);
 console.log('Passed white primary labels, neutral scenario button, consistent orange, EUR/CZK defaults, explicit USD override, three language counterparts and Czech search.');
}finally{await browser.close();}

import assert from 'node:assert/strict';
import {chromium} from '/Users/dittes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://localhost:4173/en/age-calculator/');
 await page.waitForFunction(()=>document.querySelector('main').dataset.ready==='true');
 const initial=await page.locator('[data-result-value]').textContent();
 for(let i=0;i<2;i++){
  await page.locator('button[type=submit]').click();
  const motion=await page.locator('[data-result-value]').evaluate(el=>({animations:el.getAnimations().length,weight:getComputedStyle(el).fontWeight,frames:el.getAnimations()[0]?.effect.getKeyframes()}));
  assert.equal(motion.animations,1,'Every Calculate click starts one result-number animation');
  assert.ok(Number(motion.weight)>=700,'Result is bold');
  assert.ok(motion.frames[0].transform.includes('translateY'),'Normal motion animates the number');
  assert.equal(await page.locator('[data-result-value]').textContent(),initial,'Animation preserves exact answer');
  assert.ok(await page.locator('[data-calculation-indicator]').isVisible(),'Calculation confirmation is visible');
  await page.waitForTimeout(650);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('button[type=submit]').click();
 const frames=await page.locator('[data-result-value]').evaluate(el=>el.getAnimations()[0]?.effect.getKeyframes());
 assert.ok(frames?.length,'Reduced motion still gives visible feedback');
 assert.ok(frames.every(f=>!f.transform),'Reduced motion has no spatial animation');
 await page.setViewportSize({width:375,height:900});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('button[type=submit]').click();
 await page.waitForTimeout(700);
 assert.ok(await page.locator('[data-result-value]').isVisible());
 const box=await page.locator('[data-result-value]').boundingBox();
 assert.ok(box.y>=0&&box.y<900,'Mobile calculation scrolls the result into view');
 assert.equal(await page.locator('.desktop-sidebar').isVisible(),false);
 console.log('Passed: repeated result animation, unchanged answer, bold weight, calculated indicator, reduced motion and mobile result visibility.');
} finally {await browser.close();}

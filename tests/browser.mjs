import { chromium } from '/Users/dittes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseURL = process.env.CULATORS_BASE_URL || 'http://localhost:4173';
const executablePath = process.env.CULATORS_CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const routeFiles = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name === 'index.html') routeFiles.push(full);
  }
}
await walk(path.join(root, 'dist', 'en'));
await walk(path.join(root, 'dist', 'de'));
await walk(path.join(root, 'dist', 'cz'));
await walk(path.join(root, 'dist', 'pl'));
const localeRoutes=JSON.parse(await readFile(path.join(root,'dist/assets/routes.json'),'utf8'));
const localized=(route,lang)=>localeRoutes[lang][route.replace(/^\/en\//,'').replace(/\/$/,'')];
const routes = [];
for (const file of routeFiles) {
  const html = await readFile(file, 'utf8');
  const m = html.match(/<main\b[^>]*\bdata-calculator="([^"]+)"[^>]*>/);
  if (m) routes.push({ slug: m[1], path: '/'+path.relative(path.join(root,'dist'),path.dirname(file)).split(path.sep).join('/')+'/' });
}
routes.sort((a,b) => a.slug.localeCompare(b.slug));

const report = { baseURL, routeCount: routes.length, routeFailures: [], viewportFailures: [], interactionFailures: [], consoleErrors: [], pageErrors: [] };
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
page.setDefaultTimeout(10000);
let currentRoute = '';
page.on('console', msg => {
  if (msg.type() === 'error') report.consoleErrors.push({ route: currentRoute, message: msg.text() });
});
page.on('pageerror', error => report.pageErrors.push({ route: currentRoute, message: error.message }));

async function loadCalculator(route) {
  currentRoute = route.path;
  await page.goto(new URL(route.path, baseURL).href, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => {
    const main = document.querySelector('main[data-calculator]');
    return main && (main.dataset.ready === 'true' || document.querySelector('#form-error')?.textContent.trim());
  }, null, { timeout: 12000 });
}

try {
  if (!routes.length) throw new Error('No calculator routes found in dist/en. Build the site before running browser QA.');
  const response = await page.goto(new URL('/en/', baseURL).href, { waitUntil: 'networkidle', timeout: 20000 });
  if (!response?.ok()) throw new Error(`Site home returned ${response?.status() ?? 'no response'}`);

  for (const route of routes) {
    try {
      await loadCalculator(route);
      const errorText = (await page.locator('#form-error').textContent()).trim();
      const result = (await page.locator('#result-output [data-result-value]').textContent().catch(() => '')).trim();
      if (errorText) throw new Error(`default form error: ${errorText}`);
      if (!result || /NaN|Infinity|undefined/.test(result)) throw new Error('default result is empty or nonfinite');
      await page.locator('#calculator-form button[type=submit]').click();
      if ((await page.locator('#form-error').textContent()).trim()) throw new Error(`default submission error: ${(await page.locator('#form-error').textContent()).trim()}`);
      report.routeFailures.push(...[]);
    } catch (error) {
      report.routeFailures.push({ slug: route.slug, path: route.path, message: error.message });
    }
  }

  const viewportCases = [
    ['/en/', 'home'], ['/en/everyday/', 'everyday category'],
    ['/en/mortgage-calculator/', 'mortgage'], ['/en/bmi-calculator/', 'BMI'],
    ['/en/scientific-calculator/', 'scientific'], ['/en/password-generator/', 'password'],
    ['/en/age-calculator/', 'age'], ['/en/conversion-calculator/', 'conversion'],
  ];
  for (const width of [320, 375, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, label] of viewportCases.flatMap(([route,label])=>[[route,label],[localized(route,'de'),label+' German'],[localized(route,'cs'),label+' Czech'],[localized(route,'pl'),label+' Polish']])) {
      currentRoute = `${route} @ ${width}px`;
      try {
        await page.goto(new URL(route, baseURL).href, { waitUntil: 'networkidle', timeout: 20000 });
        if (await page.locator('[data-calculator]').count()) await page.waitForFunction(() => document.querySelector('#result-output [data-result-value]') || document.querySelector('#form-error')?.textContent.trim(), null, { timeout: 10000 });
        const dims = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
        if (dims.document > dims.viewport || dims.body > dims.viewport) report.viewportFailures.push({ route, label, width, ...dims });
      } catch (error) { report.viewportFailures.push({ route, label, width, message: error.message }); }
    }
  }

  // Category search, category filtering, and clear/reset of the directory filters.
  currentRoute = '/en/everyday/ interactions';
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(new URL('/en/everyday/', baseURL).href, { waitUntil: 'networkidle' });
  try {
    const search = page.locator('#calculator-search');
    await search.fill('zz-no-such-calculator-zz');
    if (!(await page.locator('.no-results').isVisible())) throw new Error('no-match state was not shown');
    await page.locator('[data-clear-search]').click();
    if ((await page.locator('#search-count').textContent()).trim() === '0 tools') throw new Error('clear filters did not restore results');
    await page.locator('[data-filter="saved"]').click();
    if (await page.locator('[data-filter="saved"]').getAttribute('aria-pressed') !== 'true') throw new Error('saved filter did not become active');
    await page.locator('[data-filter="all"]').click();
    const afterReset = await page.locator('#search-count').textContent();
    if (afterReset.trim() === '0 tools') throw new Error('all filter did not restore calculator results');
    report.interactionFailures.push(...[]);
  } catch (error) { report.interactionFailures.push({ feature: 'search/filter/reset', message: error.message }); }

  // Favorite one tool, then confirm that the saved filter exposes it.
  try {
    await loadCalculator({ slug: 'age-calculator', path: '/en/age-calculator/' });
    const favorite = page.locator('[data-save]');
    await favorite.click();
    if (await favorite.getAttribute('aria-pressed') !== 'true') throw new Error('favorite button did not enter saved state');
    await page.goto(new URL('/en/everyday/', baseURL).href, { waitUntil: 'networkidle' });
    await page.locator('[data-filter="saved"]').click();
    if (!(await page.locator('[data-slug="age-calculator"]').isVisible())) throw new Error('saved filter did not show the favorite');
    await page.locator('[data-filter="all"]').click();
    await loadCalculator({ slug: 'age-calculator', path: '/en/age-calculator/' });
    await page.locator('[data-save]').click();
    if (await page.locator('[data-save]').getAttribute('aria-pressed') !== 'false') throw new Error('favorite could not be removed');
  } catch (error) { report.interactionFailures.push({ feature: 'favorites', message: error.message }); }

  // Keep a scenario, change an input, and check the side-by-side comparison.
  try {
    await loadCalculator({ slug: 'bmi-calculator', path: '/en/bmi-calculator/' });
    await page.locator('[data-compare]').click();
    if (await page.locator('#scenario').isHidden()) throw new Error('scenario panel did not open');
    const before = (await page.locator('#kept-result').textContent()).trim();
    await page.locator('#calculator-form input[type="number"]').first().fill('82');
    await page.waitForTimeout(500);
    const after = (await page.locator('#current-result').textContent()).trim();
    if (!before || !after || before === after) throw new Error(`scenario did not update after input change (${before} / ${after})`);
    await page.locator('[data-clear-scenario]').click();
    if (!(await page.locator('#scenario').isHidden())) throw new Error('scenario panel did not close');
  } catch (error) { report.interactionFailures.push({ feature: 'scenario comparison', message: error.message }); }

  // Share non-default inputs through the clipboard or the app's text fallback, then reload that URL.
  try {
    await loadCalculator({ slug: 'bmi-calculator', path: '/en/bmi-calculator/' });
    await page.locator('input[name="weight"]').fill('82');
    await page.locator('[data-share]').click();
    let shareURL = '';
    try { shareURL = await page.evaluate(() => navigator.clipboard.readText()); } catch { /* app fallback is checked below */ }
    if (!shareURL) shareURL = await page.locator('#share-link').inputValue().catch(() => '');
    if (!shareURL) throw new Error('share link was neither copied nor displayed');
    const parsed = new URL(shareURL);
    if (parsed.searchParams.get('weight') !== '82') throw new Error(`share link did not include weight=82: ${shareURL}`);
    await page.goto(shareURL, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('#result-output [data-result-value]'), null, { timeout: 10000 });
    if (await page.locator('input[name="weight"]').inputValue() !== '82') throw new Error('shared input was not restored from the query string');
  } catch (error) { report.interactionFailures.push({ feature: 'share query inputs', message: error.message }); }

  // FAQ disclosure and reset to the generated defaults.
  try {
    await loadCalculator({ slug: 'age-calculator', path: '/en/age-calculator/' });
    const faq = page.locator('.article details').first();
    if (!(await faq.count())) throw new Error('no FAQ details were rendered');
    await faq.locator('summary').click();
    if (!(await faq.evaluate(el => el.open))) throw new Error('FAQ did not expand');
    const input = page.locator('input[type="date"]').first();
    const defaultValue = await input.inputValue();
    await input.fill('1990-01-01');
    await page.locator('#calculator-form button[type="reset"]').click();
    await page.waitForTimeout(100);
    if (await input.inputValue() !== defaultValue) throw new Error('reset did not restore the date default');
    if ((await page.locator('#form-error').textContent()).trim()) throw new Error('reset left a form error');
  } catch (error) { report.interactionFailures.push({ feature: 'FAQ/reset', message: error.message }); }

  // Console/page errors are global collectors. Remove duplicate identical reports while preserving routes.
  const dedupe = items => [...new Map(items.map(x => [`${x.route}\n${x.message}`, x])).values()];
  report.consoleErrors = dedupe(report.consoleErrors);
  report.pageErrors = dedupe(report.pageErrors);
} finally {
  await context.close();
  await browser.close();
}

report.passed = report.routeFailures.length === 0 && report.viewportFailures.length === 0 && report.interactionFailures.length === 0 && report.consoleErrors.length === 0 && report.pageErrors.length === 0;
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;

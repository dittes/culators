import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {calculators as finance} from '../calculators/finance.mjs';
import {calculators as health} from '../calculators/health.mjs';
import {calculators as math} from '../calculators/math.mjs';
import {calculators as everyday} from '../calculators/everyday.mjs';
import {calculators as extra} from '../calculators/extra.mjs';
import {resultMarkup} from '../assets/render.mjs';
const all=[...finance,...health,...math,...everyday,...extra];
const catalog=JSON.parse(await readFile('data/catalogue.json','utf8'));const slugs=new Set(all.map(t=>t.slug));
assert.equal(slugs.size,all.length,'Duplicate slug');for(const row of catalog)assert(slugs.has(row.slug),'Missing '+row.slug);
const titles=new Set(),descriptions=new Set();
for(const t of all){assert(t.fields.length&&t.formula&&t.explanation.length>=100&&t.example&&t.faqs.length>=2,`Content missing: ${t.slug}`);assert(!titles.has(t.title),'Duplicate title');titles.add(t.title);assert(!descriptions.has(t.description),'Duplicate description '+t.slug);descriptions.add(t.description);
 const values=Object.fromEntries(t.fields.map(f=>[f.key,String(f.value??'')]));const result=t.calculate(values);assert(result.value!==undefined,`${t.slug}: no result`);assert(!/NaN|Infinity|undefined/.test(resultMarkup(result)),`${t.slug}: non-finite output`);
 const html=await readFile(`dist/en/${t.slug}/index.html`,'utf8');assert(html.includes(`<h1>${t.title.replace(/&/g,'&amp;')}</h1>`),`${t.slug}: heading`);assert(html.includes('rel="canonical"'));assert(html.includes('hreflang="en"'));assert(html.includes('application/ld+json'));assert(html.includes('Frequently asked questions'));assert(html.includes('data-calculator'));assert(!html.includes('fonts.googleapis'));
 for(const [_,src]of html.matchAll(/(?:href|src)="(\/[^"?#]*)"/g)){if(src==='/')continue;const file=src.endsWith('/')?'dist'+src+'index.html':'dist'+src;await readFile(file);}
 const structured=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);JSON.parse(structured[1]);
}
console.log(`Verified ${all.length} working definitions, ${catalog.length}/${catalog.length} catalogue coverage, static links and SEO metadata.`);
// Verify every generated HTML page, including home/category links.
async function checkPages(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+entry.name;if(entry.isDirectory())await checkPages(path);else if(entry.name.endsWith('.html')){const html=await readFile(path,'utf8');for(const [,link]of html.matchAll(/(?:href|src)="(\/[^"?#]*)"/g)){const target=link.endsWith('/')?'dist'+link+'index.html':'dist'+link;await readFile(target).catch(()=>{throw Error(`Broken local link ${link} in ${path}`);});}}}}
await checkPages('dist');
console.log('Verified all generated page links, including the homepage.');

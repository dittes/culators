import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {localizeResult,setGermanStrings} from '../assets/i18n.mjs';
import {enrichResult} from '../assets/visuals.mjs';
const translations=JSON.parse(await readFile('dist/assets/de-tools.json','utf8'));
setGermanStrings(JSON.parse(await readFile('dist/assets/de-strings.json','utf8')));
let count=0;
for(const module of ['finance','health','math','everyday','extra'])for(const tool of (await import('../calculators/'+module+'.mjs')).calculators){
 const t=translations[tool.slug];assert.ok(t?.title&&t?.description&&t?.explanation&&t?.example&&t?.formula&&t?.everyday,'German text: '+tool.slug);assert.ok(t.faqs.length>=2&&t.faqs.every(f=>typeof f.q==='string'&&f.q&&typeof f.a==='string'&&f.a),'German FAQ shape: '+tool.slug);
 for(const field of tool.fields){assert.ok(t.fields?.[field.key]?.label,`German field: ${tool.slug}/${field.key}`);if(field.options)for(const option of field.options){const value=typeof option==='object'?option.value:option;assert.ok(t.fields[field.key].options?.[value],`German option: ${tool.slug}/${field.key}/${value}`);}}
 const en=await readFile(`dist/en/${tool.slug}/index.html`,'utf8'),de=await readFile(`dist/de/${tool.slug}/index.html`,'utf8');assert.ok(de.includes('<html lang="de">'));assert.ok(de.includes(`https://culators.com/de/${tool.slug}/`));assert.ok(de.includes(`hreflang="en" href="https://culators.com/en/${tool.slug}/"`));assert.ok(en.includes(`hreflang="de" href="https://culators.com/de/${tool.slug}/"`));assert.ok(de.includes('Häufige Fragen'));assert.ok(!de.includes('How to use this calculator'));assert.ok(!de.includes('<dt></dt>'));assert.ok(!/"inLanguage":"en"/.test(de));
 const values=Object.fromEntries(tool.fields.map(f=>[f.key,String(f.value??'')])),result=localizeResult(enrichResult(tool,values,tool.calculate(values)));assert.ok(result.details.every(d=>d.label&&d.value!==undefined),'Visible breakdown: '+tool.slug);count++;
}
console.log(`Verified ${count} German calculator translations, field/options, FAQ shapes, reciprocal language links, SEO and visible breakdown rows.`);

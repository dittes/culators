import {readFile,writeFile,mkdir} from 'node:fs/promises';
const locales={en:{folder:'en',name:'English'},de:{folder:'de',name:'Deutsch'},cs:{folder:'cz',name:'Čeština'},pl:{folder:'pl',name:'Polski'}};
const sections={en:{finance:'finance',health:'health',math:'math',everyday:'everyday',imprint:'imprint',privacy:'privacy'},de:{finance:'finanzen',health:'gesundheit',math:'mathematik',everyday:'alltag',imprint:'impressum',privacy:'datenschutz'},cs:{finance:'finance',health:'zdravi',math:'matematika',everyday:'kazdodenni-zivot',imprint:'pravni-informace',privacy:'soukromi'},pl:{finance:'finanse',health:'zdrowie',math:'matematyka',everyday:'codziennosc',imprint:'informacje-prawne',privacy:'prywatnosc'}};
export async function linkLanguages({dist,site,tools}){
 const routes={},replacements={},aliases={},pages=[];
 for(const [language,{folder}]of Object.entries(locales)){
  const translations=language==='en'?{}:JSON.parse(await readFile(new URL(`assets/${language}-tools.json`,dist),'utf8'));
  const slugs={...sections[language],'':''};
  for(const tool of tools){const slug=language==='en'?tool.slug:translations[tool.slug]?.slug;if(!slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error(`Invalid localized URL: ${language}/${tool.slug}`);slugs[tool.slug]=slug;}
  if(new Set(Object.values(slugs)).size!==Object.keys(slugs).length)throw Error('Duplicate localized URL: '+language);
  routes[language]=Object.fromEntries(Object.entries(slugs).map(([key,slug])=>[key,`/${folder}/${slug?slug+'/':''}`]));
  for(const[key,target]of Object.entries(routes[language])){const source=`/${language}/${key?key+'/':''}`;replacements[source]=target;if(source!==target)aliases[source]=target;if(language==='cs'){const czEnglish=`/cz/${key?key+'/':''}`;if(czEnglish!==target)aliases[czEnglish]=target;const csLocalized=target.replace('/cz/','/cs/');if(csLocalized!==target)aliases[csLocalized]=target;}pages.push({language,key,source,target,html:await readFile(new URL('.'+source+'index.html',dist),'utf8')});}
 }
 const expression=new RegExp(Object.keys(replacements).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
 // One replacement pass avoids translating already-localized paths a second time.
 for(const page of pages){let html=page.html.replace(expression,path=>replacements[path]);const {language,key,target}=page;
  html=html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g,'');
  const alternates=[...Object.keys(locales),'x-default'].map(lang=>`<link rel="alternate" hreflang="${lang}" href="${site.origin+routes[lang==='x-default'?'en':lang][key]}">`).join('');html=html.replace('<meta property="og:type"',alternates+'<meta property="og:type"');
  const menu=`<details class="language-menu"><summary aria-label="${{en:'Change language',de:'Sprache ändern',cs:'Změnit jazyk',pl:'Zmień język'}[language]}">${locales[language].folder.toUpperCase()}</summary><nav>${Object.entries(locales).map(([lang,l])=>`<a class="language" data-language="${lang}" href="${routes[lang][key]}" lang="${lang}" hreflang="${lang}"${lang===language?' aria-current="page"':''}>${l.name}</a>`).join('')}</nav></details>`;
  html=html.replace(/<a class="language"[^>]+>[^<]*<\/a>/,menu);
  const dir=new URL('.'+target,dist);await mkdir(dir,{recursive:true});await writeFile(new URL('index.html',dir),html);
 }
 // Compatibility pages keep bookmarks and shared inputs usable even on static hosts.
 for(const[source,target]of Object.entries(aliases)){
  if(pages.some(p=>p.target===source))throw Error('Redirect collides with canonical page: '+source);
  const dir=new URL('.'+source,dist);await mkdir(dir,{recursive:true});await writeFile(new URL('index.html',dir),`<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${site.origin+target}"><noscript><meta http-equiv="refresh" content="0;url=${target}"></noscript><title>culators</title><script type="module" src="/assets/redirect.mjs"></script></head><body data-redirect="${target}"><a href="${target}">culators</a></body></html>`);
 }
 await writeFile(new URL('assets/routes.json',dist),JSON.stringify(routes));await writeFile(new URL('redirects.json',dist),JSON.stringify(aliases));
 for(const lang of Object.keys(locales)){
  const file=new URL(`assets/${lang==='en'?'search':`search-${lang}`}.json`,dist);const search=JSON.parse(await readFile(file,'utf8'));for(const item of search)item.url=routes[lang][item.slug];await writeFile(file,JSON.stringify(search));
 }
 await writeFile(new URL('_redirects',dist),'/ /en/ 302\n'+Object.entries(aliases).map(([a,b])=>`${a} ${b} 301`).join('\n')+'\n');
 await writeFile(new URL('sitemap.xml',dist),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site.origin}/</loc></url>${pages.map(p=>`<url><loc>${site.origin+p.target}</loc></url>`).join('')}</urlset>`);
 console.log(`Localized ${pages.length} routes with ${Object.keys(aliases).length} legacy redirects.`);
}

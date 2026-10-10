import {readFile,writeFile,readdir} from 'node:fs/promises';
export async function linkLanguages({dist,site}){
 const languages={en:'English',de:'Deutsch',cs:'Čeština'};
 for(const language of Object.keys(languages)){
  const walk=async dir=>{for(const entry of await readdir(dir,{withFileTypes:true})){const file=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())await walk(file);else if(entry.name==='index.html'){
   let html=await readFile(file,'utf8');const path=html.match(/<body data-page="([^"]+)"/)[1];const counterpart=lang=>path.replace(/^\/(en|de|cs)\//,`/${lang}/`);
   html=html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g,'');
   const links=[...Object.keys(languages),'x-default'].map(lang=>`<link rel="alternate" hreflang="${lang}" href="${site.origin+counterpart(lang==='x-default'?'en':lang)}">`).join('');
   html=html.replace('<meta property="og:type"',links+'<meta property="og:type"');
   const menu=`<details class="language-menu"><summary aria-label="${language==='de'?'Sprache ändern':language==='cs'?'Změnit jazyk':'Change language'}">${language.toUpperCase()}</summary><nav>${Object.entries(languages).map(([lang,name])=>`<a class="language" data-language="${lang}" href="${counterpart(lang)}" lang="${lang}" hreflang="${lang}"${lang===language?' aria-current="page"':''}>${name}</a>`).join('')}</nav></details>`;
   html=html.replace(/<a class="language"[^>]+>[^<]*<\/a>/,menu);
   await writeFile(file,html);
  }}};await walk(new URL(`${language}/`,dist));
 }
}

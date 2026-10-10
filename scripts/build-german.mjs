import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {german,setLocaleStrings,localizeResult} from '../assets/i18n.mjs';
import {escape,resultMarkup} from '../assets/render.mjs';
import {enrichResult} from '../assets/visuals.mjs';
import {labelCurrency} from '../assets/settings.mjs';
const germanCommon={
 'Consumer Financial Protection Bureau: mortgage payment basics':'Consumer Financial Protection Bureau: Grundlagen der Hypothekenrate',
 'Consumer Financial Protection Bureau: fixed-rate payment method':'Consumer Financial Protection Bureau: Berechnung fester Kreditraten',
 'IRS: federal income tax rates and brackets':'IRS: US-Einkommensteuersätze und Tarifstufen',
 'IRS: required minimum distribution FAQs':'IRS: Fragen zu vorgeschriebenen Mindestentnahmen',
 'CDC: Adult BMI categories and calculation':'CDC: BMI-Kategorien und Berechnung für Erwachsene',
 'Mifflin–St Jeor equation paper (PubMed)':'Studie zur Mifflin–St-Jeor-Gleichung (PubMed)',
 'Deurenberg et al. adult body-fat prediction equation (PubMed)':'Deurenberg et al.: Körperfett-Schätzgleichung für Erwachsene (PubMed)',
 'ACOG: Pregnancy dating and 280-day LMP estimate':'ACOG: Schwangerschaftsdatierung und 280-Tage-Schätzung',
 'CDC: Pregnancy weight-gain recommendations':'CDC: Empfehlungen zur Gewichtszunahme in der Schwangerschaft',
 'ACOG: Pregnancy dating and gestational length':'ACOG: Datierung und Dauer der Schwangerschaft',
 'ACOG: Pregnancy dating and estimated due dates':'ACOG: Schwangerschaftsdatierung und errechneter Geburtstermin',
 'U.S. Army: Body Composition Program policy update':'U.S. Army: Richtlinien zum Körperzusammensetzungsprogramm',
 '2024 Adult Compendium of Physical Activities':'Kompendium körperlicher Aktivitäten für Erwachsene (2024)',
 'American Heart Association: Target heart-rate zones':'American Heart Association: Zielbereiche für die Herzfrequenz',
 'National Kidney Foundation: 2021 CKD-EPI creatinine equation':'National Kidney Foundation: CKD-EPI-Kreatinin-Gleichung von 2021',
 'Mosteller equation review (NCBI Bookshelf)':'Übersicht zur Mosteller-Gleichung (NCBI Bookshelf)',
 'U.S. Patent 6,040,531: Process for controlling body weight (historical calories-fat-fiber formula)':'US-Patent 6,040,531: Verfahren zur Gewichtskontrolle (historische Kalorien-Fett-Ballaststoff-Formel)',
 'WeightWatchers: current Points and macronutrient information':'WeightWatchers: Informationen zum aktuellen Points-System und zu Makronährstoffen',
 'USGA Rules of Handicapping, Rule 5.2a':'USGA-Handicap-Regeln, Regel 5.2a',
 'US National Weather Service':'US National Weather Service: Wetterdienst',

 'Free Online Calculators — Money, Health, Math & Life | culators':'Kostenlose Online-Rechner — Finanzen, Gesundheit, Mathe & Alltag | culators',
 'Free Online Tool, Formula & Examples':'Online-Rechner, Formel & Beispiele',
 'Free Tools & Visual Results':'Kostenlose Rechner & verständliche Ergebnisse',
 'Calculators —':'Rechner —',
 'free calculators':'kostenlose Rechner',
 'free online calculators with visual results, clear formulas and worked examples. Work out money, health, math and everyday questions with culators.':'kostenlose Online-Rechner mit verständlichen Ergebnissen, Formeln und Rechenbeispielen. Berechne Fragen zu Finanzen, Gesundheit, Mathematik und Alltag mit culators.',
 'Plan the money decisions that matter. Explore loans, savings, investments, taxes and the everyday arithmetic behind a budget.':'Plane deine Finanzen mit Rechnern für Kredite, Sparen, Investitionen, Steuern und dein monatliches Budget.',
 'Understand the numbers behind nutrition, training and body measurements. Estimates with clear assumptions, not a substitute for personal medical advice.':'Verstehe Zahlen zu Ernährung, Training und Körpermaßen. Die Rechner zeigen Schätzungen mit klaren Annahmen und ersetzen keine medizinische Beratung.',
 'Make sense of numbers, shapes and statistics. Get useful answers with the formulas and examples that explain how they work.':'Rechne mit Zahlen, Formen und Statistik. Formeln und Beispiele zeigen dir, wie das Ergebnis zustande kommt.',
 'A little less mental arithmetic. Calculate dates, time, building materials, energy, travel and the practical details of everyday life.':'Weniger Kopfrechnen im Alltag: Berechne Datum, Zeit, Baustoffe, Energie, Reisen und viele praktische Alltagsfragen.',
 'ways to work it out':'Rechner für deine Fragen',
 'Use consistent units and check the assumptions below before applying the result.':'Verwende passende Einheiten und prüfe die Annahmen unten, bevor du das Ergebnis anwendest.',
 'Select Calculate to see the answer and its breakdown.':'Klicke auf Berechnen, um das Ergebnis und seine Aufschlüsselung zu sehen.',
 'Keep a scenario, change an input and compare the results.':'Merke dir eine Variante, ändere eine Angabe und vergleiche die Ergebnisse.',
 'Health calculations are estimates for education. They cannot diagnose a condition or replace a clinician’s assessment. Individual needs vary, especially during pregnancy, illness and growth.':'Gesundheitsrechner liefern Schätzungen zur Orientierung. Sie können keine Diagnose stellen und keine ärztliche Einschätzung ersetzen. Individuelle Bedürfnisse unterscheiden sich, besonders in Schwangerschaft, Krankheit und Wachstum.',
 'Financial projections use your assumptions. Actual returns, lender terms, fees and tax rules can differ; these results do not guarantee a future outcome.':'Finanzprognosen beruhen auf deinen Annahmen. Tatsächliche Renditen, Kreditbedingungen, Gebühren und Steuerregeln können abweichen. Die Ergebnisse garantieren keine zukünftige Entwicklung.',
 'The result depends on the values you enter and the method described above. Displayed numbers may be rounded; calculations use the unrounded values. Check that this model matches your situation before relying on it.':'Das Ergebnis hängt von deinen Angaben und dem beschriebenen Rechenweg ab. Angezeigte Zahlen können gerundet sein; berechnet wird mit ungerundeten Werten. Prüfe, ob dieses Modell zu deiner Situation passt.',
 'This calculator needs JavaScript to update. The result shown uses the example inputs above.':'Zum Aktualisieren braucht dieser Rechner JavaScript. Das gezeigte Ergebnis verwendet die Beispielwerte oben.',
 'No matching tools. Try another word.':'Kein passender Rechner. Probiere einen anderen Suchbegriff.',
 'Provider information':'Anbieterinformationen','Imprint & Contact | culators':'Impressum & Kontakt | culators','Provider details and contact information for culators.com.':'Anbieter- und Kontaktinformationen für culators.com.','About these calculators':'Über diese Rechner',
 'culators provides free calculation tools and educational explanations. Results depend on the inputs and assumptions shown on each page. Please report any calculation or content errors using the email address above.':'culators bietet kostenlose Rechner und verständliche Erklärungen. Ergebnisse hängen von den Eingaben und den Annahmen auf der jeweiligen Seite ab. Melde Rechen- oder Inhaltsfehler bitte über die oben genannte E-Mail-Adresse.',
 'Germany':'Deutschland','Privacy — Browser-Local Calculations | culators':'Datenschutz — Berechnungen im Browser | culators','How culators handles calculator inputs, saved favourites and share links.':'Wie culators mit Angaben, gespeicherten Rechnern und geteilten Links umgeht.','Simple by design':'Bewusst einfach','Saved favourites':'Gespeicherte Rechner','Share links':'Geteilte Links','Hosting':'Hosting',
 'Calculator inputs are processed in your browser. This site does not include third-party analytics, advertising scripts or externally loaded fonts.':'Deine Angaben werden in deinem Browser verarbeitet. Diese Website enthält keine Analyse-Skripte Dritter, Werbe-Skripte oder extern geladenen Schriften.',
 'When you save a calculator, its identifier is stored in your browser’s local storage. This keeps your favourites available on this device. Use the save button again to remove a favourite. No calculator inputs are stored with favourites.':'Wenn du einen Rechner speicherst, wird seine Kennung im lokalen Speicher deines Browsers abgelegt. So findest du deine gespeicherten Rechner auf diesem Gerät wieder. Klicke erneut auf den Stern, um einen Rechner zu entfernen. Dabei werden keine Rechenangaben gespeichert.',
 '“Share inputs” places the current inputs in the URL and copies that URL to your clipboard. Anyone with the link can read the inputs. URLs may be recorded in browser history and hosting logs. Avoid sharing sensitive personal, medical or financial details. Keep scenario comparisons stay in page memory and disappear when you reload.':'„Angaben teilen“ schreibt die aktuellen Angaben in die URL und kopiert den Link in deine Zwischenablage. Wer den Link hat, kann diese Angaben lesen. URLs können im Browserverlauf und in Hosting-Protokollen gespeichert werden. Teile keine sensiblen persönlichen, medizinischen oder finanziellen Angaben. Gemerkte Varianten bleiben nur im Seitenspeicher und verschwinden beim Neuladen.',
 'The hosting provider may process technical request information, including an IP address, timestamp and requested URL, to deliver the site. Calculator inputs are not sent by a calculation request; opening a share link does send the URL to the hosting provider.':'Der Hosting-Anbieter kann technische Informationen wie IP-Adresse, Zeitpunkt und angeforderte URL verarbeiten, um die Website auszuliefern. Eine Berechnung sendet keine Angaben an den Server. Beim Öffnen eines geteilten Links wird allerdings die URL an den Hosting-Anbieter übermittelt.',
 'For privacy questions, contact':'Bei Fragen zum Datenschutz schreibe an','The provider is':'Anbieter ist',
 'Free online calculators for finance, health, math and everyday life. Start exploring culators in English.':'Kostenlose Online-Rechner für Finanzen, Gesundheit, Mathematik und Alltag. Entdecke culators auf Deutsch.',
 'Page Not Found | culators':'Seite nicht gefunden | culators','That number is missing.':'Diese Seite fehlt.','This page could not be found. There are plenty of other ways to work it out.':'Diese Seite wurde nicht gefunden. Entdecke stattdessen einen unserer anderen Rechner.','Browse calculators':'Rechner entdecken',
};
const escapeRegex=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export async function buildGerman({tools,dist,site,language='de'}){
 const common=language==='de'?germanCommon:JSON.parse(await readFile(new URL(`../data/locales/${language}-interface.json`,import.meta.url),'utf8'));
 const ui=language==='pl'?{password:'Wygeneruj hasło',passwordLabel:'Nowe hasło powstaje na twoim urządzeniu',passwordNote:'Włącz JavaScript, aby wygenerować hasło.',method:'Sposób obliczania i wzór',everyday:common['A familiar situation'],enter:'Wpisz',more:' oraz pozostałe dane',ending:'.',step2:'Kliknij Oblicz, aby zobaczyć wynik i jego rozpisanie.',step3:'Zachowaj wariant, zmień dane i porównaj wyniki.'}:language==='de'?{password:'Passwort generieren',passwordLabel:'Ein neues Passwort wird auf deinem Gerät erstellt',passwordNote:'Aktiviere JavaScript, um ein Passwort zu erstellen.',method:'Rechenweg und Formel',everyday:'Aus dem Alltag',enter:'Trage',more:' und die weiteren Angaben',ending:' ein.',step2:'Klicke auf Berechnen, um das Ergebnis und seine Aufschlüsselung zu sehen.',step3:'Merke dir eine Variante, ändere eine Angabe und vergleiche die Ergebnisse.'}:{password:'Vygenerovat heslo',passwordLabel:'Nové heslo se vytváří na tvém zařízení',passwordNote:'Pro vygenerování hesla zapni JavaScript.',method:'Postup výpočtu a vzorec',everyday:common['A familiar situation'],enter:'Zadej',more:' a další údaje',ending:'.',step2:'Klikni na Vypočítat a zobrazí se výsledek i jeho rozpis.',step3:'Ulož si variantu, změň údaj a porovnej výsledky.'};
 const translations={},runtime={...common};
 for(const category of ['finance','health','math','everyday']){const file=new URL(`../data/locales/${language}-${category}.json`,import.meta.url);if(!existsSync(file))throw Error('Missing translations: '+category);const parsed=JSON.parse(await readFile(file,'utf8'));Object.assign(translations,parsed.calculators||parsed);const extra=new URL(`../data/locales/${language}-${category}-runtime.json`,import.meta.url);if(existsSync(extra)){const parsedRuntime=JSON.parse(await readFile(extra,'utf8'));Object.assign(runtime,parsedRuntime.translations||parsedRuntime.strings||parsedRuntime,parsedRuntime.errors||{},parsedRuntime.fieldLabels||{});if(parsedRuntime.patterns)runtime.__patterns=[...(runtime.__patterns||[]),...parsedRuntime.patterns];}}
 Object.assign(runtime,common);
 for(const tool of tools){const t=translations[tool.slug];if(!t?.title||!t.description||!t.explanation||!t.example||!t.everyday||!t.faqs?.length)throw Error('Incomplete translated calculator '+tool.slug);runtime[tool.title]=t.title;runtime[tool.title.replace(/ Calculator$/,'')]=t.title.replace(/[- ]?Rechner$/i,'');for(const f of tool.fields){const tr=t.fields?.[f.key];if(!tr?.label)throw Error(`Missing translated field ${tool.slug}/${f.key}`);if(tr.help&&f.help)runtime[f.help]=tr.help;runtime[f.label]=tr.label;if(f.options)for(const o of f.options){const value=typeof o==='object'?o.value:o,label=typeof o==='object'?o.label:o;if(tr.options?.[value])runtime[label]=tr.options[value];}}}
 Object.assign(runtime,common);
 await writeFile(new URL(`assets/${language}-tools.json`,dist),JSON.stringify(translations));await writeFile(new URL(`assets/${language}-strings.json`,dist),JSON.stringify(runtime));
 await writeFile(new URL(`assets/search-${language}.json`,dist),JSON.stringify(tools.map(t=>({slug:t.slug,category:t.category,title:translations[t.slug].title,description:translations[t.slug].description}))));
 if(language==='de')for(const [en,de]of Object.entries({'finance':'Finanz','health & fitness':'Gesundheits- und Fitness','math':'Mathematik','everyday':'Alltags'})){runtime[`All ${en} calculators`]=`Alle ${de}rechner`;runtime[`All ${en} tools`]=`Alle ${de}rechner`;runtime[`Explore ${en}`]=`${de}rechner entdecken`;}
 await writeFile(new URL(`assets/${language}-strings.json`,dist),JSON.stringify(runtime));
 const files=[];async function walk(dir){for(const f of await readdir(dir,{withFileTypes:true})){const full=new URL(f.name+(f.isDirectory()?'/':''),dir);if(f.isDirectory())await walk(full);else if(f.name==='index.html')files.push(full);}}await walk(new URL('en/',dist));
 for(const file of files){let en=await readFile(file,'utf8');const path=en.match(/<body data-page="([^"]+)"/)?.[1];const tool=tools.find(t=>path===`/en/${t.slug}/`),t=tool&&translations[tool.slug];const dePath=path.replace('/en/',`/${language}/`);
 const reciprocal=`<link rel="alternate" hreflang="${language}" href="${site.origin+dePath}">`;
 en=en.replace('<meta property="og:type"',reciprocal+'<meta property="og:type"').replace('href="/de/" lang="de"',`href="${dePath}" lang="de"`);await writeFile(file,en);
 const specific={...runtime};if(tool){for(const key of ['title','description','explanation','example','formula','limitations'])if(tool[key]&&t[key])specific[tool[key]]=t[key];for(let i=0;i<tool.faqs.length;i++){if(t.faqs[i]){specific[tool.faqs[i].q]=t.faqs[i].q;specific[tool.faqs[i].a]=t.faqs[i].a;}}for(const f of tool.fields)specific[f.label]=t.fields[f.key].label;}
 setLocaleStrings(language,specific);
 let de=en.replace('<html lang="en">',`<html lang="${language}">`).replaceAll('/en/',`/${language}/`);
 // Keep every input name/value, URL slug and data attribute stable; translate content and accessible labels.
 const scripts=[];de=de.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,script=>{if(script.includes('application/ld+json')){const value=JSON.parse(script.match(/>([\s\S]*)<\/script>/)[1]);const translate=x=>typeof x==='string'?german(x):Array.isArray(x)?x.map(translate):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,k==='inLanguage'?language:k==='priceCurrency'?(language==='de'?'EUR':language==='pl'?'PLN':'CZK'):translate(v)])):x;script=script.replace(/>[\s\S]*<\/script>/,'>'+JSON.stringify(translate(value)).replace(/</g,'\\u003c')+'</script>');}scripts.push(script);return`<!--I18N_SCRIPT_${scripts.length-1}-->`;});
 de=de.split(/(<[^>]+>)/g).map(fragment=>fragment.startsWith('<')?fragment.replace(/\b(content|aria-label|placeholder|title|alt)="([^"]*)"/g,(_,key,value)=>`${key}="${escape(german(value.replace(/&amp;/g,'&').replace(/&quot;/g,'"')))}"`):escape(german(fragment.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>')))).join('');
 de=de.replace(/<!--I18N_SCRIPT_(\d+)-->/g,(_,i)=>scripts[Number(i)]);
 de=de.replace(/<link rel="alternate" hreflang="en" href="[^"]+">/,`<link rel="alternate" hreflang="en" href="${site.origin+path}">`).replace(/<link rel="alternate" hreflang="x-default" href="[^"]+">/,`<link rel="alternate" hreflang="x-default" href="${site.origin+path}">`);
 de=de.replace(/<a class="language"[^>]+>DE<\/a>/,`<a class="language" href="${path}" lang="en" hreflang="en" aria-label="Switch to English">EN</a>`);
 if(tool){const values=Object.fromEntries(tool.fields.map(f=>[f.key,String(f.value??'')]));const raw=enrichResult(tool,values,tool.calculate(values));const money=tool.fields.some(f=>/USD|GBP|CAD|currency/.test(f.unit||''));const currency=language==='de'?'EUR':language==='pl'?'PLN':'CZK';const result=tool.slug==='password-generator'?{value:ui.password,label:ui.passwordLabel,details:[],note:ui.passwordNote}:localizeResult(money?labelCurrency(raw,tool.slug==='currency-calculator'?(language==='cs'?'CZK':language==='pl'?'PLN':'USD'):currency):raw,tool.slug);
 de=de.replace(/(<div id="result-output"[^>]*>)[\s\S]*?(<\/div><div class="result-tools">)/,(_,start,end)=>start+resultMarkup(result,language)+end);
 de=de.replace(/(<h2>)How [\s\S]*? is calculated(<\/h2>)/,`$1${ui.method}$2`);
 de=de.replace(new RegExp(`(<h2>${escapeRegex(ui.everyday)}</h2><p>)[\\s\\S]*?(</p>)`),(_,start,end)=>start+escape(t.everyday)+end);
 de=de.replace(/<ol>[\s\S]*?<\/ol>/,`<ol><li>${ui.enter} ${escape(tool.fields.slice(0,3).map(f=>t.fields[f.key].label).join(', '))}${tool.fields.length>3?ui.more:''}${ui.ending}</li><li>${ui.step2}</li><li>${ui.step3}</li></ol>`);
 // Help remains concise: show translated source help only, rather than inventing repetitive instructions.
 for(const f of tool.fields){if(money&&tool.slug!=='currency-calculator'&&f.unit){const value=german(f.unit.replace(/USD|GBP|CAD|currency/g,currency));de=de.replace(new RegExp(`(<div class="field" data-field="${escapeRegex(f.key)}"[\\s\\S]*?<span class="unit">)[^<]*(</span>)`),(_,a,b)=>a+escape(value)+b);}const help=t.fields[f.key].help||'';de=de.replace(new RegExp(`(<p class="field-help" id="field-${escapeRegex(f.key)}-help">)[\\s\\S]*?(</p>)`),(_,a,b)=>a+escape(help)+b);}
 }
 de=de.replace(/(<a\b[^>]*data-slug="([^"]+)"[^>]*data-search=")[^"]*(")/g,(_,start,slug,end)=>start+escape((translations[slug]?.title+' '+translations[slug]?.description).toLowerCase())+end);
 de=de.replaceAll('</svg>Gesundheit &amp; Fitness<span class="expand-mark"','</svg>Gesundheit<span class="expand-mark"');
 if(language==='de')de=de.replace(/All ([^<]+) calculators/g,'Alle $1-Rechner').replace(/All ([^<]+) tools/g,'Alle $1-Rechner').replace(/Explore ([^<]+)/g,'$1 entdecken').replace(/(\d+) calculators/g,'$1 Rechner').replace(/(\d+) tools/g,'$1 Rechner');
 const target=new URL('.'+dePath,dist);await mkdir(target,{recursive:true});await writeFile(new URL('index.html',target),de);
 }
 setLocaleStrings(language,runtime);
 const sitemapFile=new URL('sitemap.xml',dist);let sitemap=await readFile(sitemapFile,'utf8');sitemap=sitemap.replace('</urlset>',files.map(f=>'<url><loc>'+site.origin+f.pathname.replace(new URL('en/',dist).pathname,`/${language}/`).replace(/index.html$/,'')+'</loc></url>').join('')+'</urlset>');await writeFile(sitemapFile,sitemap);
 console.log(`Generated ${language} translations for ${tools.length} calculators and ${files.length} pages with reciprocal language links.`);
}

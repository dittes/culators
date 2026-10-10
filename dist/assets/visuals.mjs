import {escape as e,format,normalizeResult} from './render.mjs';
const num=(v,key)=>Number(v[key]);
const figure=(svg,caption)=>`<figure class="calc-visual"><svg viewBox="0 0 320 160" role="img"><title>${e(caption)}</title>${svg}</svg><figcaption>${e(caption)}</figcaption></figure>`;
const text=(x,y,label,cls='')=>`<text x="${x}" y="${y}" class="${cls}">${e(label)}</text>`;
function percentage(value){const percent=Math.max(0,Math.min(100,value)),length=2*Math.PI*52;return figure(`<circle class="visual-track" cx="160" cy="76" r="52"/><circle class="visual-progress" cx="160" cy="76" r="52" stroke-dasharray="${length*percent/100} ${length}" transform="rotate(-90 160 76)"/>${text(160,82,format(value)+'%','visual-center')}`,'A part of the whole · 100% ring');}
export function enrichResult(tool,v,result){result=normalizeResult(result);if(tool.slug==='roi-calculator'){result={...result,chart:[{label:'Initial investment',value:Number(v.initial)},{label:'Ending value',value:Number(v.final)}],chartUnit:'currency'};}let visual='';const slug=tool.slug;
 if(slug==='bmi-calculator'||slug==='anorexic-bmi-calculator'||slug==='overweight-calculator'){
  const weight=num(v,'weight'),height=num(v,'height'),bmi=weight/(height/100)**2;
  if(Number.isFinite(bmi)&&bmi>0){const x=20+(Math.max(12,Math.min(40,bmi))-12)/28*280;visual=figure(`<rect class="visual-track-fill" x="20" y="56" width="280" height="22" rx="5"/><rect class="visual-highlight" x="85" y="56" width="65" height="22"/>${[18.5,25,30].map(b=>text(20+(b-12)/28*280,110,String(b))).join('')}<path class="visual-line" d="M ${x} 35 V 88"/>${text(x,25,format(bmi))}`,'Adult BMI scale · marker limited to 12–40');}
 }
 if(slug==='circle-calculator'){const input=num(v,'value'),given=v.given;const radius=given==='diameter'?input/2:given==='circumference'?input/(2*Math.PI):given==='area'?Math.sqrt(input/Math.PI):input;visual=figure(`<circle class="visual-shape" cx="160" cy="76" r="57"/><path class="visual-line" d="M160 76H217"/><circle class="visual-point" cx="160" cy="76" r="3"/>${text(183,65,'r = '+format(radius))}`,'Circle measurements · diagram not to scale');}
 if(['pythagorean-theorem-calculator','right-triangle-calculator','triangle-calculator'].includes(slug)){
  let a=num(v,'a'),b=num(v,'b'),c;
  if(slug==='pythagorean-theorem-calculator'&&v.known==='hypotenuse-leg'){c=a;a=Math.sqrt(c*c-b*b);}
  if(slug==='right-triangle-calculator'&&v.known==='leg-angle')b=a/Math.tan(num(v,'b')*Math.PI/180);
  if(a>0&&b>0&&Number.isFinite(a+b)){
   if(slug==='triangle-calculator'){const angle=num(v,'angle')*Math.PI/180;const third=Math.sqrt(a*a+b*b-2*a*b*Math.cos(angle));const x=b*Math.cos(angle),y=b*Math.sin(angle),minX=Math.min(0,x),maxX=Math.max(a,x),scale=Math.min(240/(maxX-minX),105/y);const p=40-minX*scale,q=130;visual=figure(`<path class="visual-shape" d="M${p} ${q}L${p+a*scale} ${q}L${p+x*scale} ${q-y*scale}Z"/>${text(160,151,'a '+format(a)+' · b '+format(b)+' · c '+format(third))}`,'Two sides and the included angle · proportional diagram');}
   else{const scale=110/Math.max(a,b),w=b*scale,h=a*scale;visual=figure(`<path class="visual-shape" d="M75 130H${75+w}L75 ${130-h}Z"/><path class="visual-line" d="M75 118H87V130"/>${text(160,151,'a '+format(a)+' · b '+format(b)+' · c '+format(c||Math.hypot(a,b)))}`,'Right triangle · proportional sides');}
  }
 }
 if(['area-calculator','square-footage-calculator','concrete-calculator','tile-calculator','mulch-calculator','gravel-calculator'].includes(slug)){
  const shape=v.shape||'rectangle';if(shape==='circle')visual=figure('<circle class="visual-shape" cx="160" cy="74" r="52"/><path class="visual-line" d="M160 74H212"/>','Surface area · diagram not to scale');else{const a=num(v,'a')||num(v,'length')||1,b=num(v,'b')||num(v,'width')||1,scale=175/Math.max(a,b);const width=Math.max(10,a*scale),height=Math.max(10,b*scale*.55),x=(320-width)/2,y=(145-height)/2;visual=figure(shape==='triangle'?`<path class="visual-shape" d="M${x} ${y+height}H${x+width}L${x+width/2} ${y}Z"/>${text(160,151,'Base × height ÷ 2')}`:`<rect class="visual-shape" x="${x}" y="${y}" width="${width}" height="${height}" rx="2"/>${text(160,151,'Length '+format(a)+' · width '+format(b))}`,'Your surface · schematic diagram');}
 }
 if(['volume-calculator','surface-area-calculator'].includes(slug)){
 const shape=v.shape||'box';let svg;
 if(shape==='sphere')svg='<circle class="visual-shape" cx="160" cy="76" r="56"/><ellipse class="visual-shape" cx="160" cy="76" rx="56" ry="18"/><ellipse class="visual-shape" cx="160" cy="76" rx="20" ry="56"/>';
 else if(shape==='cylinder')svg='<ellipse class="visual-shape" cx="160" cy="40" rx="58" ry="20"/><path class="visual-shape" d="M102 40V119C102 145 218 145 218 119V40"/><ellipse class="visual-shape" cx="160" cy="119" rx="58" ry="20"/>';
 else if(shape==='cone')svg='<ellipse class="visual-shape" cx="160" cy="126" rx="62" ry="18"/><path class="visual-shape" d="M98 126L160 20L222 126"/>';
 else if(shape==='pyramid')svg='<path class="visual-shape" d="M80 115L160 20L240 115L160 145Z"/><path class="visual-line" d="M160 20V145M80 115L160 94L240 115"/>';else svg='<path class="visual-shape" d="M83 56L173 26L237 65V126L148 151L83 113Z"/><path class="visual-line" d="M83 56L148 92L237 65M148 92V151"/>';
 visual=figure(svg,'A solid in three dimensions · schematic diagram');
 }
 if(slug==='fraction-calculator'){const denominator=Math.abs(num(v,'b')),numerator=Math.abs(num(v,'a'));if(denominator>0&&denominator<=30&&numerator<=denominator){const columns=Math.min(10,denominator),slot=26,x=(320-columns*slot)/2;visual=figure(Array.from({length:denominator},(_,i)=>`<rect class="${i<numerator?'visual-highlight':'visual-track-fill'}" x="${x+(i%columns)*slot}" y="${42+Math.floor(i/columns)*slot}" width="22" height="22" rx="4"/>`).join(''),'First fraction · '+format(numerator)+' of '+format(denominator)+' equal parts');}}
 if(['time-calculator','sleep-calculator'].includes(slug)){
  const resultClock=/^\d{2}:\d{2}/.test(String(result.value))?String(result.value):v.time||'';const clock=String(resultClock).split(':').map(Number),hours=Number.isFinite(clock[0])?clock[0]:8,minutes=Number.isFinite(clock[1])?clock[1]:0;const angleH=(hours%12+minutes/60)*Math.PI/6,angleM=minutes*Math.PI/30;visual=figure(`<circle class="visual-shape" cx="160" cy="76" r="58"/>${Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return`<circle class="visual-point" cx="${160+Math.sin(a)*50}" cy="${76-Math.cos(a)*50}" r="1.5"/>`;}).join('')}<path class="visual-line" d="M${160+Math.sin(angleH)*29} ${76-Math.cos(angleH)*29}L160 76L${160+Math.sin(angleM)*42} ${76-Math.cos(angleM)*42}"/>`,'Clock time · '+String(resultClock).slice(0,5));
 }
 if(['age-calculator','date-calculator','day-counter','day-of-the-week-calculator','due-date-calculator','pregnancy-calculator','pregnancy-conception-calculator','conception-calculator','period-calculator','ovulation-calculator'].includes(slug)){
  const dates=Object.entries(v).filter(([,x])=>/^\d{4}-\d{2}-\d{2}$/.test(String(x))).map(([,x])=>String(x));if(dates.length&&(dates.length>1||/^\d{4}-\d{2}-\d{2}$/.test(String(result.value)))){visual=figure(`<path class="visual-line" d="M28 65H292"/><circle class="visual-point" cx="28" cy="65" r="5"/><circle class="visual-point" cx="292" cy="65" r="5"/>${text(85,110,dates[0])}${text(235,110,dates[1]||String(result.value).slice(0,15))}`,dates.length>1?'Calendar dates · each calculation uses the method below':'Selected date / result');}
 }
 if(!visual&&['percent-calculator','body-fat-calculator','army-body-fat-calculator','margin-calculator','discount-calculator','probability-calculator'].includes(slug)&&typeof result.value==='number'&&result.value>=0&&result.value<=100&&/%/.test(String(result.unit)))visual=percentage(result.value);
 return {...result,...(visual?{visual}:{})};
}

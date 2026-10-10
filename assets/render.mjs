export const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function format(value) {
 if(typeof value !== 'number') return String(value ?? '');
 if(!Number.isFinite(value)) throw Error('This result is outside the supported number range. Try smaller values.');
 if(value !== 0 && Math.abs(value)<.00001) return value.toExponential(5);
 return new Intl.NumberFormat('en',{maximumFractionDigits:Math.abs(value)<1?6:2}).format(Object.is(value,-0)?0:value);
}
export function chartMarkup(series,unit) {
 const data=(series || []).filter(x=>Number.isFinite(Number(x.value))).map(x=>({label:String(x.label),value:Number(x.value)}));
 if(!data.length) return '';
 const max=Math.max(...data.map(x=>Math.abs(x.value)),1e-15),n=data.length;
 const labels=data.length>8 ? [data[0],data.at(-1)] : data;
 let shapes='';
 if(n>8){const points=data.map((x,i)=>`${10+i*280/(n-1)},${100-((x.value+max)/(2*max))*90}`);shapes=`<path d="M ${points.join(' L ')}"/>`;}
 else {const slot=280/n;shapes=data.map((x,i)=>`<rect class="${i%2?'secondary':''}" x="${10+i*slot}" y="${100-Math.abs(x.value)/max*85}" width="${Math.max(4,slot-8)}" height="${Math.max(1,Math.abs(x.value)/max*85)}" rx="3"><title>${escape(x.label)}: ${escape(format(x.value))}</title></rect>`).join('');}
 return `<figure class="chart" aria-label="${escape(data.map(x=>x.label+': '+format(x.value)).join('; '))}"><svg viewBox="0 0 300 110" role="img"><title>Result breakdown</title>${shapes}</svg><figcaption class="chart-legend">${unit?`<span>${escape(unit)}</span>`:""}${labels.map(x=>`<span>${escape(x.label)} · ${escape(format(x.value))}</span>`).join('')}</figcaption></figure>`;
}
export function resultMarkup(result) {
 const val=format(result.value);
 return `<div class="result-inner"><div class="result-value ${val.length>16?'long':''}" data-result-value>${escape(val)}</div><div class="result-unit">${escape(result.unit||'')}</div><div class="result-label">${escape(result.label||'Result')}</div>${result.visual||chartMarkup(result.chart,result.chartUnit)}<dl class="result-details">${(result.details||[]).map(x=>`<div><dt>${escape(x.label)}</dt><dd>${escape(format(x.value))}</dd></div>`).join('')}</dl>${result.note?`<p class="result-note">${escape(result.note)}</p>`:''}</div>`;
}

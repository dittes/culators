import {createCalculator} from './pocket-engine.mjs';
import {animateResultNumber} from './result-motion.mjs';
import {german} from './i18n.mjs';
export function initPocketCalculators(lang='en'){
 const tr=value=>lang==='en'?value:german(value);
 for(const root of document.querySelectorAll('[data-pocket]')){
  const calculator=createCalculator(),display=root.querySelector('[data-pocket-display]'),expression=root.querySelector('[data-pocket-expression]'),memory=root.querySelector('[data-pocket-memory]'),feedback=root.querySelector('[data-pocket-feedback]');
  function fitText(){display.style.fontSize=Math.max(12,Math.min(56,display.clientWidth/(Math.max(1,display.textContent.length)*.65)))+'px';}
  new ResizeObserver(fitText).observe(display);
  function paint(state,animate=false){display.textContent=state.error?tr(state.display):lang==='en'?state.display:state.display.replace('.',',');expression.textContent=state.expression||'';memory.hidden=!state.memoryActive;root.dataset.state=state.error?'error':state.justCalculated?'success':'default';display.setAttribute('aria-invalid',String(!!state.error));feedback.textContent=tr(state.error|| (state.justCalculated?'Calculated':'Ready to calculate'));fitText();
   root.querySelectorAll('[data-pocket-key]').forEach(button=>{if(['+','-','*','/'].includes(button.dataset.pocketKey)){const symbol=({'*':'×','/':'÷'})[button.dataset.pocketKey]||button.dataset.pocketKey;button.setAttribute('aria-pressed',String(state.expression?.endsWith(' '+symbol)||false));}button.disabled=!!state.error&&['sqrt','square','reciprocal','percent','m+','m-','sign'].includes(button.dataset.pocketKey);});
   if(animate&&!state.error)animateResultNumber(display,{locale:lang,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches});
  }
  function press(key){paint(calculator.press(key),key==='=');const button=[...root.querySelectorAll('[data-pocket-key]')].find(b=>b.dataset.pocketKey===key);if(button&&!matchMedia('(prefers-reduced-motion: reduce)').matches)button.animate([{transform:'translateY(2px)'},{transform:'translateY(0)'}],{duration:140});}
  root.addEventListener('click',event=>{const button=event.target.closest('[data-pocket-key]');if(button)press(button.dataset.pocketKey);});
  root.addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey)return;if(event.target.tagName==='BUTTON'&&['Enter',' '].includes(event.key))return;const key=/^[0-9+*/.-]$/.test(event.key)?event.key:({'Enter':'=','=':'=',',':'.','Escape':'clear','Backspace':'backspace','Delete':'clearEntry','%':'percent'})[event.key];if(key){event.preventDefault();press(key);}});
  root.querySelector('[data-pocket-key="."]').textContent=lang==='en'?'.':',';paint(calculator.snapshot());root.dataset.pocketReady='true';root.setAttribute('aria-busy','false');
 }
}

export function animateResultNumber(number,{reduced=false,mobile=false,locale='en'}={}){
 if(reduced){number.animate([{opacity:.6},{opacity:1}],{duration:120});return;}
 const value=number.textContent;
 const characters=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(locale,{granularity:'grapheme'}).segment(value)].map(x=>x.segment):Array.from(value);
 const stagger=Math.min(55,400/Math.max(1,characters.length-1));
 const fragment=document.createDocumentFragment();
 characters.forEach((character,i)=>{const span=document.createElement('span');span.className='result-character';span.textContent=character;fragment.append(span);});
 number.replaceChildren(fragment);
 [...number.children].forEach((span,i)=>span.animate([{opacity:0,transform:'translateY(.16em) scale(.86)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:320,delay:(mobile?150:0)+i*stagger,fill:'both',easing:'cubic-bezier(.16,1,.3,1)'}));
}

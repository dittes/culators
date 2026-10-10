export function fieldPresentation(tool,v){
 const result=Object.fromEntries(tool.fields.map(f=>[f.key,{visible:true,label:f.label}]));
 const only=(keys,labels={})=>{for(const key of ['a','b','c'])if(result[key])result[key]={visible:keys.includes(key),label:labels[key]||result[key].label};};
 if(tool.slug==='area-calculator'){
  if(v.shape==='circle')only(['a'],{a:'Radius'});
  else if(v.shape==='triangle')only(['a','b'],{a:'Base',b:'Perpendicular height'});
  else if(v.shape==='trapezoid')only(['a','b','c'],{a:'First parallel side',b:'Perpendicular height',c:'Second parallel side'});
  else only(['a','b'],{a:'Length',b:'Width'});
 }
 if(tool.slug==='volume-calculator'){
  if(v.shape==='sphere')only(['a'],{a:'Radius'});
  else if(v.shape==='cube')only(['a'],{a:'Edge length'});
  else if(['cylinder','cone'].includes(v.shape))only(['a','b'],{a:'Radius',b:'Height'});
  else if(v.shape==='tri-prism')only(['a','b','c'],{a:'Triangle base',b:'Triangle height',c:'Prism length'});
  else only(['a','b','c'],{a:'Length',b:'Width',c:'Height'});
 }
 if(tool.slug==='surface-area-calculator'){
  if(v.shape==='sphere')only(['a'],{a:'Radius'});
  else if(v.shape==='cube')only(['a'],{a:'Edge length'});
  else if(v.shape==='cylinder')only(['a','b'],{a:'Radius',b:'Height'});
  else if(v.shape==='cone')only(['a','c'],{a:'Radius',c:'Slant height'});
  else if(v.shape==='pyramid')only(['a','c'],{a:'Square base edge',c:'Slant height'});
  else only(['a','b','c'],{a:'Length',b:'Width',c:'Height'});
 }
 if(tool.slug==='scientific-notation-calculator'){result.value.visible=v.mode==='to-sci';result.coefficient.visible=result.exponent.visible=v.mode==='from-sci';}
 if(tool.slug==='weight-watchers-points-calculator'){for(const key of ['calories','fat','fiber'])result[key].visible=v.mode==='legacy-food';for(const key of ['allowance','used'])result[key].visible=v.mode==='budget';}
 return result;
}

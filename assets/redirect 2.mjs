const target=document.body.dataset.redirect;
if(target){const url=new URL(target,location.origin);url.search=location.search;url.hash=location.hash;location.replace(url.href);}

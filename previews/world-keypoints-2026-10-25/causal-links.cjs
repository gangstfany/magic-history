function linksForStep(links,chainId,step){return links.filter(l=>l.chainId===chainId&&l.step===step);}
function makeCausalBookmark({chainId,step,unit,camera,scrollTop=0,pageScrollTop=null,overview=false}){return Object.freeze({chainId,step,unit,camera:Object.freeze({...camera}),scrollTop:Math.max(0,Number(scrollTop)||0),pageScrollTop:pageScrollTop===null?null:Math.max(0,Number(pageScrollTop)||0),overview:!!overview});}
if(typeof module!=='undefined')module.exports={linksForStep,makeCausalBookmark};

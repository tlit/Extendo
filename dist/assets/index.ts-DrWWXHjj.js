import{C as n}from"./harvester-Cu8zpfFx.js";console.log("Extendo: Content Injector Active");chrome.runtime.onMessage.addListener((e,r,t)=>{if(e.action==="HARVEST"){const o=n.harvest();t(o)}});

const PREFIX = 'learning-preview-spelling-';
const CACHE = PREFIX + 'v8';
const ASSETS = ['./','./index.html','./classic.html','./app.css','./voice.js','./progress-view.js','./language-help.js','./progress-view.css','./adventure.css','./adventure.js','./capy-garden-v2.png','./app.js','./content.js','./words.js','./manifest.json','./icon-192-v2.png','./icon-512-v2.png','./apple-touch-icon-v2.png'];
const APP_ROOT = new URL(self.registration.scope);
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(asset=>new Request(new URL(asset,APP_ROOT),{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', e => {
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==APP_ROOT.origin||!url.pathname.startsWith(APP_ROOT.pathname))return;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const hit=await cache.match(e.request);
  if(hit)return hit;
  try{return await fetch(e.request)}catch{
   if(e.request.mode==='navigate')return await cache.match(new URL('index.html',APP_ROOT).href)||Response.error();
   return Response.error();
  }
 })());
});

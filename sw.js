/* LAPAPPA v2.0 · cache offline */
const CACHE='bsp-v23';
const ASSETS=['./','./index.html','./lapappa.css','./app.js','./ricette.js','./calendar.js','./bonanza.js','./panoramica.js','./sleep.js','./cycle.js','./seasonality.js','./wellbeing.js','./grimorio.js','./raven.svg','./icon.svg','./manifest.webmanifest','./lapappa-logo-v122.png','./lapappa-logo-v122-192.png','./lapappa-logo-v122-512.png','./jspdf.umd.min.js','./jspdf.plugin.autotable.min.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('bsp-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);
 const isFont=url.origin==='https://fonts.googleapis.com'||url.origin==='https://fonts.gstatic.com';
 if(url.origin!==self.location.origin&&!isFont)return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok||response.type==='opaque'){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,clone)).catch(()=>{})}return response}).catch(()=>caches.match(event.request,{ignoreSearch:!isFont})))});

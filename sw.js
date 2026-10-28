const CACHE="kaguya-v5", TILES="kaguya-tiles";
const FILES=["./","./index.html","./manifest.webmanifest","./maplibre-gl.js","./maplibre-gl.css","./apple-touch-icon.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function tile(req){
  const c=await caches.open(TILES);
  const hit=await c.match(req.url); if(hit) return hit;
  let res;
  try{ res=await fetch(req.url,{mode:"cors"}); if(!res.ok) throw 0; }
  catch(e){ res=await fetch(req.url,{mode:"no-cors"}); }
  c.put(req.url,res.clone()).catch(()=>{});
  return res;
}
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  const url=new URL(e.request.url);
  if(url.hostname==="cyberjapandata.gsi.go.jp"){ e.respondWith(tile(e.request)); return; }
  if(url.origin!==location.origin) return;
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return res}).catch(()=>caches.match("./index.html",{ignoreSearch:true})));
    return;
  }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return res})));
});

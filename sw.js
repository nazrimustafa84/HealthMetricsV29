const CACHE = 'burnfit-v2';
const SHELL = ['./','./index.html','./manifest.json'];

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{})));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(!url.protocol.startsWith('http')) return;
  e.respondWith(
    fetch(req).then(res=>{
      if(res.ok&&res.type==='basic'){
        const clone=res.clone();
        caches.open(CACHE).then(c=>c.put(req,clone)).catch(()=>{});
      }
      return res;
    }).catch(()=>caches.match(req).then(cached=>cached||caches.match('./index.html')))
  );
});

self.addEventListener('message', e=>{
  if(e.data&&e.data.type==='SKIP_WAITING') self.skipWaiting();
});

/* LAPAPPA v2.3 · Il Grimorio: backup in un tocco, copie automatiche sul telefono, ripristino guidato.
   Compatibile con i backup v1 già scaricati. Nessun dato viene inviato a server: la condivisione la scegli tu. */
(()=>{'use strict';
const root=document.getElementById('grimorioApp');if(!root)return;
const LAST='lapappa-grimorio-last-export-v1',PERIOD=14*864e5,KEEP=7;
const el=id=>document.getElementById(id);
const fmt=t=>new Date(t).toLocaleString('it-IT',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
root.innerHTML=`
<div class="grim-status" id="grimStatus" role="status"></div>
<section class="grim-step"><h3>📤 1 · Salva il backup fuori dal telefono</h3>
 <p>Un tocco crea il file con tutti i dati e le foto e apre la condivisione del telefono: scegli <b>Drive</b>, <b>Telegram</b> (Messaggi salvati), <b>WhatsApp</b> a te stessa o la mail. Se il telefono non può condividere, il file finisce in Download.</p>
 <label class="check"><input type="checkbox" id="grimLock"> 🔒 Proteggi con una password (consigliato se lo mandi in chat o per mail)</label>
 <div id="grimPwdBox" hidden><label for="grimPwd">Password</label><input id="grimPwd" type="password" autocomplete="new-password" placeholder="Almeno 6 caratteri: non la potrò recuperare io"></div>
 <button class="action big" type="button" id="grimExport">📤 Salva backup ora</button><button class="action big secondary" type="button" id="grimReady" hidden>✨ File pronto: tocca per condividerlo</button></section>
<section class="grim-step"><h3>🕯️ 2 · Copie automatiche su questo telefono</h3>
 <p>Ogni giorno, aprendo l’app, il Grimorio salva da solo una copia dei dati (senza foto) e tiene le ultime ${KEEP}. Servono se cancelli qualcosa per sbaglio: un tocco su <b>Ripristina</b> e torni indietro.</p>
 <p class="muted fine">Attenzione: le copie vivono nel browser. Se cancelli i dati di Chrome o perdi il telefono spariscono anche loro, per questo esiste il passo 1.</p>
 <div id="grimSnaps"></div><button class="action secondary mini" type="button" id="grimSnapNow">Crea una copia adesso</button></section>
<section class="grim-step"><h3>📥 3 · Ripristina da un file</h3>
 <p>Hai cambiato telefono o browser? Apri LAPAPPA, tocca il pulsante e scegli il file <code>LAPAPPA-grimorio-…json</code> da Drive, Telegram o Download.</p>
 <label class="action secondary" for="grimImport">📥 Scegli il file di backup</label><input class="sr-only" id="grimImport" type="file" accept=".json,application/json">
 <div id="grimReview" class="grim-review" hidden><p id="grimReviewText"></p>
  <div id="grimPwdAskBox" hidden><label for="grimPwdAsk">Password del backup</label><input id="grimPwdAsk" type="password" autocomplete="current-password"><button class="action mini" type="button" id="grimUnlock">Sblocca</button></div>
  <div id="grimModeBox"><label class="check"><input type="radio" name="grimMode" value="merge" checked> Unisci ai dati attuali (consigliato)</label><label class="check"><input type="radio" name="grimMode" value="replace"> Sostituisci tutto con il backup</label>
  <button class="action" id="grimConfirm" type="button">Ripristina</button><button class="action secondary" id="grimCancel" type="button">Annulla</button></div></div></section>
<p class="muted fine">Non caricare i backup su GitHub: contengono dati di salute e foto.</p>`;
const st=document.createElement('style');st.textContent='.grim-step{border-top:1px dashed var(--line);padding-top:12px;margin-top:14px}.grim-step:first-of-type{border-top:0}.grim-step h3{font-size:19px}.action.big{width:100%;padding:15px;font-size:17px}.snap{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)}.snap:last-child{border:0}.grim-review{background:var(--wine-soft);border-radius:12px;padding:12px;margin-top:12px}';document.head.appendChild(st);
const keys=()=>{const k=[];for(let i=0;i<localStorage.length;i++){const x=localStorage.key(i);if(x&&x.startsWith('bsp-'))k.push(x)}return k};
const localDump=()=>{const o={};for(const k of keys())o[k]=localStorage.getItem(k);return o};
function idb(name,store,opts){return new Promise((res,rej)=>{const r=indexedDB.open(name,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(store))r.result.createObjectStore(store,opts)};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
const photosDB=()=>idb('bsp-bonanza-photos','photos'),snapsDB=()=>idb('bsp-snapshots','snaps',{keyPath:'at'});
function b64(blob){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=()=>rej(r.error);r.readAsDataURL(blob)})}
function unb64(s,type){const bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:type||'image/jpeg'})}
async function collectPhotos(){const db=await photosDB();const rows=await new Promise((res,rej)=>{const tx=db.transaction('photos','readonly'),s=tx.objectStore('photos');let k=[],v=[];s.getAllKeys().onsuccess=e=>k=e.target.result;s.getAll().onsuccess=e=>v=e.target.result;tx.oncomplete=()=>{db.close();res(k.map((id,i)=>({id,blob:v[i]})))};tx.onerror=()=>{db.close();rej(tx.error)}});const out=[];for(const r of rows)if(r.blob instanceof Blob)out.push({id:String(r.id),mime:r.blob.type||'image/jpeg',bytes:await b64(r.blob)});return out}
async function restorePhotos(ps){if(!ps.length)return;const db=await photosDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite'),s=tx.objectStore('photos');for(const p of ps)s.put(unb64(p.bytes,p.mime),p.id);tx.oncomplete=()=>{db.close();res()};tx.onerror=()=>{db.close();rej(tx.error)}})}
async function sha(str){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function keyFrom(pwd,salt){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pwd),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:200000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
const toB=u=>btoa(String.fromCharCode(...u)),fromB=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function encrypt(text,pwd){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const k=await keyFrom(pwd,salt);const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(text)));let s='';for(let i=0;i<ct.length;i+=32768)s+=String.fromCharCode(...ct.subarray(i,i+32768));return JSON.stringify({schema:'lapappa-grimorio-cifrato',version:1,salt:toB(salt),iv:toB(iv),data:btoa(s)})}
async function decrypt(obj,pwd){const k=await keyFrom(pwd,fromB(obj.salt));const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromB(obj.iv)},k,fromB(obj.data));return new TextDecoder().decode(pt)}
function counts(local,photos){const j=k=>{try{return JSON.parse(local[k]||'null')}catch{return null}};const a=j('bsp-v1')||{},b=j('bsp-bonanza-v1')||[];return `${(a.foods||[]).length} ingredienti, ${Array.isArray(b)?b.length:0} pasti, ${(a.logs||[]).length} voci di diario${photos!==undefined?`, ${photos} foto`:''}`}
async function status(){const last=Number(localStorage.getItem(LAST));let persisted=false;try{persisted=await navigator.storage?.persisted?.()}catch{}
 el('grimStatus').innerHTML=`${last?`✅ Ultimo backup salvato: <b>${fmt(last)}</b>`:'⚠️ Nessun backup salvato fuori dal telefono: fai il passo 1.'}<br>${persisted?'🛡️ Il browser non cancellerà i dati da solo.':'🛡️ Protezione dalla pulizia automatica del browser: richiesta.'}`}
/* ── 1. backup in un tocco ── */
el('grimLock').onchange=e=>{el('grimPwdBox').hidden=!e.target.checked};
async function exportBackup(){const btn=el('grimExport');const lock=el('grimLock').checked,pwd=el('grimPwd').value;if(lock&&pwd.length<6)return alert('Scegli una password di almeno 6 caratteri (e segnatela!).');btn.disabled=true;btn.textContent='Preparo il Grimorio…';
 try{const local=localDump(),photos=await collectPhotos();const payload={schema:'lapappa-grimorio',version:1,exportedAt:new Date().toISOString(),origin:location.origin,local,photos};const body=JSON.stringify(payload);let text=JSON.stringify({...payload,sha256:await sha(body)});if(lock)text=await encrypt(text,pwd);
  const stamp=payload.exportedAt.slice(0,16).replace('T','_').replace(':','-');const name=`LAPAPPA-grimorio-${stamp}${lock?'-protetto':''}.json`;const file=new File([text],name,{type:'application/json'});let done='scaricato in Download';
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Backup LAPAPPA',text:'Il mio Grimorio di LAPAPPA'});done='condiviso'}catch(e){if(e.name==='AbortError'){btn.textContent='📤 Salva backup ora';btn.disabled=false;return}
   /* il telefono chiede un nuovo tocco quando il file è grande: offro un secondo pulsante già pronto */
   pending=file;const r=el('grimReady');r.hidden=false;btn.disabled=false;btn.textContent='📤 Salva backup ora';return}}else download(file);
  localStorage.setItem(LAST,String(Date.now()));document.getElementById('grimReminder')?.remove();status();alert(`📜 Backup ${done}: ${counts(local,photos.length)}.${lock?' Ricorda la password: senza non si apre.':''}`)}
 catch(e){alert('Backup non riuscito: '+e.message+'. I dati restano dove sono.')}finally{btn.disabled=false;btn.textContent='📤 Salva backup ora'}}
function download(file){const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
let pending=null;
el('grimExport').onclick=exportBackup;
el('grimReady').onclick=async()=>{if(!pending)return;try{await navigator.share({files:[pending],title:'Backup LAPAPPA'});localStorage.setItem(LAST,String(Date.now()));status();alert('📜 Backup condiviso.')}catch(e){if(e.name!=='AbortError'){download(pending);localStorage.setItem(LAST,String(Date.now()));status();alert('Condivisione non disponibile: file scaricato in Download.')}}el('grimReady').hidden=true;pending=null};
/* ── 2. copie automatiche ── */
async function snaps(){const db=await snapsDB();return new Promise((res,rej)=>{const tx=db.transaction('snaps','readonly'),r=tx.objectStore('snaps').getAll();r.onsuccess=()=>{db.close();res((r.result||[]).sort((a,b)=>b.at-a.at))};r.onerror=()=>{db.close();rej(r.error)}})}
async function snapshot(){const db=await snapsDB();const all=await snaps();await new Promise((res,rej)=>{const tx=db.transaction('snaps','readwrite'),s=tx.objectStore('snaps');s.put({at:Date.now(),local:localDump()});all.slice(KEEP-1).forEach(x=>s.delete(x.at));tx.oncomplete=()=>{db.close();res()};tx.onerror=()=>{db.close();rej(tx.error)}});renderSnaps()}
async function renderSnaps(){try{const all=await snaps();el('grimSnaps').innerHTML=all.length?all.map(x=>`<div class="snap"><span><b>${fmt(x.at)}</b><br><small>${counts(x.local)}</small></span><button class="action secondary mini" type="button" data-snap="${x.at}">Ripristina</button></div>`).join(''):'<p class="muted">Nessuna copia ancora: la prima arriva da sola.</p>';
 el('grimSnaps').querySelectorAll('[data-snap]').forEach(b=>b.onclick=async()=>{const x=(await snaps()).find(s=>String(s.at)===b.dataset.snap);if(!x)return;if(!confirm(`Tornare ai dati del ${fmt(x.at)}? Prima salvo una copia di come sono adesso, così puoi sempre tornare indietro.`))return;await snapshot();for(const k of keys())if(!(k in x.local))localStorage.removeItem(k);for(const [k,v] of Object.entries(x.local))localStorage.setItem(k,v);alert('Fatto! Ricarico l’app 🔮');location.reload()})}catch(e){el('grimSnaps').textContent='Copie automatiche non disponibili in questo browser.'}}
el('grimSnapNow').onclick=()=>snapshot().then(()=>alert('Copia creata 🕯️'));
(async()=>{try{await navigator.storage?.persist?.()}catch{}status();try{const all=await snaps();if(!all.length||Date.now()-all[0].at>20*3600e3)await snapshot();else renderSnaps()}catch{renderSnaps()}})();
/* ── 3. ripristino ── */
let raw=null,cand=null;
function combine(a,b){const out={...a};for(const [k,v] of Object.entries(b)){try{if(k==='bsp-v1'){const l=JSON.parse(a[k]||'{}'),r=JSON.parse(v),n={...l,...r};for(const f of['foods','recipes','labs','logs','shop']){const seen=new Set();n[f]=[...(l[f]||[]),...(r[f]||[])].filter(z=>{const s=JSON.stringify(z);if(seen.has(s))return false;seen.add(s);return true})}n.prices={...(l.prices||{}),...(r.prices||{})};out[k]=JSON.stringify(n)}
 else if(k==='bsp-bonanza-v1'){const m=new Map(JSON.parse(a[k]||'[]').map(z=>[z.id,z]));for(const z of JSON.parse(v))m.set(z.id,z);out[k]=JSON.stringify([...m.values()])}
 else if(k==='bsp-cycle-v1'){out[k]=JSON.stringify([...new Map([...JSON.parse(a[k]||'[]'),...JSON.parse(v)].map(z=>[JSON.stringify(z),z])).values()])}
 else if(/planner|sleep|daily/.test(k)){out[k]=JSON.stringify({...JSON.parse(a[k]||'{}'),...JSON.parse(v)})}else out[k]=v}catch{out[k]=v}}return out}
async function validate(text){const x=JSON.parse(text);if(x.schema!=='lapappa-grimorio'||!x.local||!Array.isArray(x.photos))throw Error('non è un backup di LAPAPPA');if(Object.keys(x.local).some(k=>!k.startsWith('bsp-')))throw Error('dati non validi');if(x.sha256){const {sha256,...rest}=x;if(await sha(JSON.stringify(rest))!==sha256)throw Error('file incompleto o modificato')}return x}
function ready(x){cand=x;el('grimPwdAskBox').hidden=true;el('grimModeBox').hidden=false;el('grimReviewText').innerHTML=`✅ Backup del <b>${fmt(x.exportedAt)}</b> verificato: ${counts(x.local,x.photos.length)}.`}
el('grimImport').onchange=async ev=>{cand=null;const f=ev.target.files?.[0];if(!f)return;el('grimReview').hidden=false;try{raw=await f.text();const o=JSON.parse(raw);if(o.schema==='lapappa-grimorio-cifrato'){el('grimReviewText').textContent='🔒 Questo backup è protetto: inserisci la password.';el('grimPwdAskBox').hidden=false;el('grimModeBox').hidden=true}else ready(await validate(raw))}catch(e){el('grimReviewText').textContent='Impossibile usare il file: '+e.message;el('grimModeBox').hidden=true}};
el('grimUnlock').onclick=async()=>{try{ready(await validate(await decrypt(JSON.parse(raw),el('grimPwdAsk').value)))}catch(e){el('grimReviewText').textContent='Password errata o file danneggiato.'}};
el('grimCancel').onclick=()=>{cand=null;el('grimReview').hidden=true;el('grimImport').value=''};
el('grimConfirm').onclick=async()=>{if(!cand)return;const mode=document.querySelector('[name=grimMode]:checked').value;if(!confirm(mode==='replace'?'Sostituire i dati attuali con il backup? Prima salvo una copia automatica di sicurezza.':'Unire il backup ai dati attuali? Prima salvo una copia automatica di sicurezza.'))return;
 try{await snapshot();const cur=localDump();const merged=mode==='merge'?combine(cur,cand.local):cand.local;await restorePhotos(cand.photos);if(mode==='replace')for(const k of keys())if(!(k in merged))localStorage.removeItem(k);for(const [k,v] of Object.entries(merged))localStorage.setItem(k,v);alert('Ripristino completato! Ricarico l’app 🔮');location.reload()}catch(e){alert('Ripristino non riuscito: '+e.message+'. I dati attuali sono al sicuro nella copia automatica.')}};
/* ── promemoria ogni 14 giorni ── */
const last=Number(localStorage.getItem(LAST));if(!last||Date.now()-last>=PERIOD){const b=document.createElement('div');b.className='card';b.id='grimReminder';b.innerHTML='<strong>📜 È ora di salvare il Grimorio</strong><p>Non risulta un backup fuori dal telefono negli ultimi 14 giorni. Bastano due tocchi.</p><button class="action" type="button" id="grimGo">📤 Salva backup ora</button><button class="action secondary" type="button" id="grimLater">Più tardi</button>';document.getElementById('home')?.prepend(b);b.querySelector('#grimGo').onclick=exportBackup;b.querySelector('#grimLater').onclick=()=>b.remove()}
})();

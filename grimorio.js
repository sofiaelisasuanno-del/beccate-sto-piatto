/* LAPAPPA v1.3 – Backup completo creato su richiesta, senza inviare dati in rete. */
(()=>{
'use strict';
const root=document.getElementById('grimorioApp');if(!root)return;
const localKeys=['bsp-v1','bsp-planner-v2','bsp-bonanza-v1','bsp-cycle-v1','bsp-sleep-v1'];
const LAST='lapappa-grimorio-last-export-v1',PERIOD=14*24*60*60*1000;
const el=id=>document.getElementById(id);
root.innerHTML=`
<p>Qui custodisci la tua dispensa, i calendari, il diario, i dati sul ciclo, il sonno e le fotografie della bonanza. Il file rimane sotto il tuo controllo: non viene inviato a servizi esterni.</p>
<div class="grim-status" id="grimStatus" role="status"></div>
<div class="grim-actions"><button class="action" type="button" id="grimExport">⬇ Esporta il Grimorio completo</button>
<label for="grimImport">📥 Seleziona un backup da ripristinare</label><input id="grimImport" type="file" accept=".json,application/json"></div>
<div id="grimReview" class="grim-review" hidden><h3>Verifica prima del ripristino</h3><p id="grimReviewText"></p>
<label for="grimMode">Come vuoi ripristinare?</label><select id="grimMode"><option value="merge">Unisci al contenuto esistente (consigliato)</option><option value="replace">Sostituisci il contenuto esistente (attenzione)</option></select>
<p class="muted">La modalità Unisci conserva le voci locali non presenti nel backup quando possibile. Per i record in conflitto, prevale il backup. Per maggiore sicurezza, esporta prima lo stato attuale.</p>
<button class="action" id="grimConfirm" type="button">Conferma ripristino</button><button class="action secondary" id="grimCancel" type="button">Annulla</button></div>
<details open><summary><b>📖 Come ripristinare LAPAPPA, passo dopo passo</b></summary><ol class="grim-instructions">
<li>Apri <b>Il Grimorio</b> sullo stesso browser in cui vuoi riavere i dati.</li>
<li>Premi <b>Seleziona un backup</b> e scegli il file <code>LAPAPPA-grimorio-...json</code> dalla cartella <b>Backup_lapappa</b> (o da Download).</li>
<li>Leggi il riepilogo e controlla la data del backup e quanti ingredienti e foto contiene.</li>
<li>Se hai dati nuovi, scegli <b>Unisci</b>. Usa <b>Sostituisci</b> soltanto se intendi rimpiazzare il contenuto attuale.</li>
<li>Premi <b>Conferma ripristino</b>, attendi il messaggio finale e riapri LAPAPPA.</li>
</ol></details>
<details><summary><b>📂 Dove conservare i backup sul telefono</b></summary><p>Apri l'app <b>File</b>, crea una cartella <b>Backup_lapappa</b> nella memoria interna, quindi sposta lì il file scaricato da <b>Download</b>. Meglio mantenere anche una copia privata esterna al telefono. Non caricare il backup su GitHub: può contenere informazioni sanitarie e foto.</p><p>Il browser non può promettere un download automatico silenzioso ogni 14 giorni, né scrivere liberamente in una cartella di Android. Quando apri l'app dopo 14 giorni ti ricordiamo di esportare il Grimorio.</p></details>
<p class="muted">Attenzione: non cancellare i dati di Brave/Chrome prima di avere un backup scaricato e verificato. Se perdi anche l'ultimo backup, il recupero potrebbe essere impossibile.</p>`;
const extraStyle=document.createElement('style');extraStyle.textContent=`#grimorioApp .grim-status{background:#0c2118;border:1px solid #baa37d;border-radius:6px;padding:12px;margin:14px 0;line-height:1.55;color:#f1e4cb}#grimorioApp .grim-actions{display:grid;gap:9px}#grimorioApp .grim-actions>label{margin:0;font-weight:700}#grimorioApp input[type=file]{min-height:54px}#grimorioApp details{margin-top:18px;background:#0d271b;border:1px solid #a99166;border-radius:7px;padding:13px}#grimorioApp summary{cursor:pointer}#grimorioApp .grim-instructions{padding-left:23px;list-style:decimal}#grimorioApp .grim-instructions li{display:list-item;border:0;padding:8px 0}#grimorioApp code{overflow-wrap:anywhere}#grimorioApp .grim-review{padding:12px;margin-top:15px;background:#173a29;border:1px solid #b5a079;border-radius:8px}`;document.head.appendChild(extraStyle);
let candidate=null;
function state(){const t=Number(localStorage.getItem(LAST));return t>0?`Ultimo backup scaricato: ${new Date(t).toLocaleString('it-IT')}. Prossimo controllo dopo 14 giorni.`:'Nessun backup completo esportato da questo browser.'}
function showStatus(t){el('grimStatus').textContent=t}
showStatus(state());
function findKeys(){let keys=new Set(localKeys);for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('bsp-'))keys.add(k)}return [...keys].filter(k=>localStorage.getItem(k)!==null)}
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('bsp-bonanza-photos',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('photos'))r.result.createObjectStore('photos')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||Error('Archivio foto non disponibile'))})}
async function collectPhotos(){const db=await openDB();const rows=await new Promise((resolve,reject)=>{const tx=db.transaction('photos','readonly');const store=tx.objectStore('photos');let keys=[],values=[];store.getAllKeys().onsuccess=e=>{keys=e.target.result};store.getAll().onsuccess=e=>{values=e.target.result};tx.oncomplete=()=>{db.close();resolve(keys.map((id,i)=>({id,blob:values[i]})))};tx.onerror=()=>{db.close();reject(tx.error)}});const out=[];for(const row of rows){if(!(row.blob instanceof Blob))throw Error('Foto non leggibile');out.push({id:String(row.id),mime:row.blob.type||'image/jpeg',bytes:await toBase64(row.blob)})}return out}
function toBase64(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})}
function fromBase64(encoded,type){const binary=atob(encoded),arr=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)arr[i]=binary.charCodeAt(i);return new Blob([arr],{type:type||'image/jpeg'})}
async function hash(str){const encoded=new TextEncoder().encode(str);const digest=await crypto.subtle.digest('SHA-256',encoded);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function summarize(store,photos){const obj=k=>{try{return JSON.parse(store[k]||'null')}catch{return null}};const a=obj('bsp-v1')||{},b=obj('bsp-bonanza-v1')||[];return {ingredients:Array.isArray(a.foods)?a.foods.length:0,shop:Array.isArray(a.shop)?a.shop.length:0,health:Array.isArray(a.labs)?a.labs.length:0,diary:Array.isArray(a.logs)?a.logs.length:0,meals:Array.isArray(b)?b.length:0,photos:photos.length}}
function triggerDownload(data,name){const url=URL.createObjectURL(new Blob([data],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
async function exportBackup(){const btn=el('grimExport');btn.disabled=true;showStatus('Preparazione del backup, fotografie comprese…');try{
const local={};for(const k of findKeys())local[k]=localStorage.getItem(k);
const photos=await collectPhotos();const payload={schema:'lapappa-grimorio',version:1,exportedAt:new Date().toISOString(),origin:location.origin,local,photos};
const body=JSON.stringify(payload);const backup={...payload,sha256:await hash(body)};
const stamp=payload.exportedAt.replaceAll(':','-').slice(0,19);triggerDownload(JSON.stringify(backup),`LAPAPPA-grimorio-${stamp}.json`);
localStorage.setItem(LAST,String(Date.now()));const n=summarize(local,photos);showStatus(`Download richiesto. Controlla Download: ${n.ingredients} ingredienti, ${n.meals} pasti registrati, ${n.photos} foto. Sposta il file in Backup_lapappa e verifica che sia presente. Ricontrollo tra 14 giorni.`);
}catch(e){showStatus('Backup non riuscito: '+e.message+'. Non cancellare alcun dato.')}finally{btn.disabled=false}}
el('grimExport').addEventListener('click',exportBackup);
function countDescribe(x){const s=summarize(x.local,x.photos);return `${s.ingredients} ingredienti, ${s.shop} voci di spesa, ${s.health} valori salute, ${s.diary} registrazioni diario, ${s.meals} pasti e ${s.photos} foto.`}
el('grimImport').addEventListener('change',async ev=>{candidate=null;el('grimReview').hidden=true;const file=ev.target.files?.[0];if(!file)return;try{
if(file.size>120*1024*1024)throw Error('File troppo grande (>120 MB)');const raw=await file.text();const x=JSON.parse(raw);
if(x.schema!=='lapappa-grimorio'||x.version!==1||!x.local||typeof x.local!=='object'||!Array.isArray(x.photos)||!x.sha256)throw Error('Formato Grimorio non valido');
if(Object.keys(x.local).some(k=>!k.startsWith('bsp-')||typeof x.local[k]!=='string'))throw Error('Dati locali non validi');
for(const v of Object.values(x.local))JSON.parse(v);
for(const p of x.photos){if(typeof p.id!=='string'||!p.id||typeof p.bytes!=='string'||!/^[-\w+/=]*$/.test(p.bytes)||p.bytes.length>15_000_000)throw Error('Fotografia non valida')}
const {sha256,...rest}=x;if(await hash(JSON.stringify(rest))!==sha256)throw Error('Controllo integrità fallito: file alterato o incompleto');
candidate=x;el('grimReviewText').textContent=`Backup del ${new Date(x.exportedAt).toLocaleString('it-IT')}. Contiene ${countDescribe(x)} ATTENZIONE: scegli come integrare questi dati.`;el('grimReview').hidden=false;showStatus('Backup verificato. Scegli come ripristinare e conferma.');
}catch(e){showStatus('Impossibile importare: '+e.message)}});
function combine(a,b){const output={...a};for(const [k,v] of Object.entries(b)){if(k==='bsp-v1'){const left=JSON.parse(a[k]||'{}'),right=JSON.parse(v);const next={...left,...right};for(const field of ['foods','recipes','labs','logs','shop']){const l=Array.isArray(left[field])?left[field]:[],r=Array.isArray(right[field])?right[field]:[];const seen=new Set();next[field]=[...l,...r].filter(z=>{const key=JSON.stringify(z);if(seen.has(key))return false;seen.add(key);return true})}output[k]=JSON.stringify(next)}else if(k==='bsp-bonanza-v1'){const l=JSON.parse(a[k]||'[]'),r=JSON.parse(v);const items=new Map(l.map(z=>[z.id,z]));for(const z of r)items.set(z.id,z);output[k]=JSON.stringify([...items.values()])}else if(k==='bsp-planner-v2'||k==='bsp-sleep-v1'){output[k]=JSON.stringify({...JSON.parse(a[k]||'{}'),...JSON.parse(v)})}else if(k==='bsp-cycle-v1'){const l=JSON.parse(a[k]||'[]'),r=JSON.parse(v);if(Array.isArray(l)&&Array.isArray(r))output[k]=JSON.stringify([...new Map([...l,...r].map(z=>[JSON.stringify(z),z])).values()]);else output[k]=v}else output[k]=v}return output}
function restorePhotos(photos){return openDB().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction('photos','readwrite'),s=tx.objectStore('photos');try{for(const p of photos)s.put(fromBase64(p.bytes,p.mime),p.id)}catch(e){db.close();reject(e);return}tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}}))}
el('grimCancel').onclick=()=>{candidate=null;el('grimReview').hidden=true;el('grimImport').value='';showStatus(state())};
el('grimConfirm').onclick=async()=>{if(!candidate)return;const mode=el('grimMode').value;const ok=confirm(mode==='replace'?'Vuoi SOSTITUIRE i dati attuali con il backup? Le voci attuali non presenti potrebbero andare perdute.':'Vuoi UNIRE il backup ai dati locali attuali? Le voci compatibili verranno mantenute.');if(!ok)return;
const btn=el('grimConfirm');btn.disabled=true;showStatus('Ripristino in corso. Non chiudere questa pagina…');try{
const existing={};for(const k of findKeys())existing[k]=localStorage.getItem(k);
const merged=mode==='merge'?combine(existing,candidate.local):candidate.local;
// Photographs are imported first; state data are only committed when this step succeeds.
await restorePhotos(candidate.photos);
// Avoid clearing keys belonging to other features. Backups only replace app-owned keys.
if(mode==='replace')for(const k of findKeys())if(!(k in merged))localStorage.removeItem(k);
for(const [k,v] of Object.entries(merged))localStorage.setItem(k,v);
showStatus('Ripristino completato. Ricarica LAPAPPA per visualizzare i dati.');el('grimReview').hidden=true;candidate=null;
}catch(e){showStatus('Ripristino non riuscito: '+e.message+'. Non cancellare i dati.')}finally{btn.disabled=false}};
function isDue(){const n=Number(localStorage.getItem(LAST));return !n||Date.now()-n>=PERIOD}
function displayReminder(){if(!isDue())return;const banner=document.createElement('div');banner.className='card';banner.id='grimReminder';banner.style.cssText='border:2px solid #b5a079;background:#142c20;margin:10px 0;color:#f4ead8';banner.innerHTML='<strong>📜 È tempo di proteggere il tuo Grimorio!</strong><p>Non risulta un backup completo negli ultimi 14 giorni. Salva ora una copia dei tuoi dati e delle foto in Backup_lapappa.</p><button class="action" type="button" id="grimGo">Apri il Grimorio</button><button class="action secondary" type="button" id="grimLater">Più tardi</button>';const home=document.getElementById('home');if(home){home.prepend(banner);banner.querySelector('#grimGo').onclick=()=>go('grimorio');banner.querySelector('#grimLater').onclick=()=>banner.remove()}}
displayReminder();
})();

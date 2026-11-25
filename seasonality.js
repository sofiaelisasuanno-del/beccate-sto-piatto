/* Stagionalità italiana indicativa + Ruota dell'Anno: sabba, lune piene (esbat) e lune nuove.
   Fonti delle corrispondenze: tradizione wiccan e neopagana contemporanea (Ruota dell'Anno di Kelly/Farrar, manuali Llewellyn, Cunningham),
   nomi tradizionali delle lune piene dell'almanacco. Fasi lunari calcolate localmente (mese sinodico 29,53 giorni). */
(function(){
const calendar={"1":{"vegetables":["broccoli","cavolfiore","finocchi","carciofi","bietole","spinaci","cavolo","verza","porri","radicchio","zucca","carote","sedano","patate"],"fruits":["arance","mandarini","clementine","limoni","kiwi","mele","pere"],"season":"inverno"},"2":{"vegetables":["broccoli","cavolfiore","finocchi","carciofi","bietole","spinaci","cavolo","verza","porri","radicchio","carote","sedano","patate"],"fruits":["arance","mandarini","limoni","kiwi","mele","pere"],"season":"inverno"},"3":{"vegetables":["asparagi","carciofi","spinaci","bietole","cavolfiore","broccoli","finocchi","agretti","carote","ravanelli","patate"],"fruits":["arance","limoni","kiwi","mele","pere","fragole"],"season":"primavera"},"4":{"vegetables":["asparagi","carciofi","spinaci","bietole","piselli","fave","agretti","lattuga","ravanelli","carote","zucchine"],"fruits":["fragole","limoni","mele","pere"],"season":"primavera"},"5":{"vegetables":["asparagi","zucchine","piselli","fave","carciofi","lattuga","ravanelli","carote","bietole","fagiolini","cetrioli"],"fruits":["fragole","ciliegie","nespole","limoni"],"season":"primavera"},"6":{"vegetables":["zucchine","pomodori","melanzane","peperoni","fagiolini","cetrioli","lattuga","carote","bietole","piselli"],"fruits":["ciliegie","albicocche","pesche","fragole","susine","melone"],"season":"estate"},"7":{"vegetables":["pomodori","melanzane","zucchine","peperoni","fagiolini","cetrioli","lattuga","carote","basilico"],"fruits":["pesche","albicocche","anguria","melone","susine","fichi"],"season":"estate"},"8":{"vegetables":["pomodori","melanzane","zucchine","peperoni","fagiolini","cetrioli","lattuga","carote"],"fruits":["pesche","anguria","melone","fichi","susine","uva"],"season":"estate"},"9":{"vegetables":["zucca","funghi","radicchio","bietole","pomodori","melanzane","peperoni","fagiolini","carote","sedano"],"fruits":["uva","fichi","mele","pere","prugne","melograno"],"season":"autunno"},"10":{"vegetables":["zucca","funghi","radicchio","bietole","finocchi","broccoli","cavolfiore","carote","porri","spinaci","verza"],"fruits":["mele","pere","uva","cachi","castagne","melograno","kiwi"],"season":"autunno"},"11":{"vegetables":["zucca","funghi","radicchio","finocchi","cavolfiore","broccoli","bietole","porri","spinaci","verza","carote"],"fruits":["mele","pere","cachi","kiwi","mandarini","clementine","arance"],"season":"autunno"},"12":{"vegetables":["broccoli","cavolfiore","finocchi","zucca","bietole","spinaci","cavolo","verza","radicchio","porri","carote"],"fruits":["arance","mandarini","clementine","kiwi","mele","pere","limoni"],"season":"inverno"}};
const months=['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const byMonth=m=>calendar[String(m)]||calendar['1'];
const season=d=>byMonth(d.getMonth()+1).season;
const has=(name,date)=>{const x=byMonth(date.getMonth()+1);const n=String(name||'').trim().toLowerCase();return x.vegetables.includes(n)||x.fruits.includes(n)};
window.BSPseason={byMonth,season,has,monthOf:date=>byMonth(new Date(date+'T12:00').getMonth()+1)};
const root=document.getElementById('seasonalityHome');if(!root)return;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* ── Sabba ── */
const SABBAT={
 samhain:{nome:'Samhain',kind:'Sabba maggiore',m:9,d:31,icon:'🎃',bg:['#2B1B2E','#5B2A1E'],fg:'#FDFDFB',
  frase:'Samhain è soglia e trasformazione: il velo è sottile, si onorano le antenate e si lascia andare ciò che ha finito il suo ciclo. È il capodanno delle streghe.',
  colori:[['Nero','#141414'],['Arancione','#D9731A'],['Viola','#5B2A6E'],['Argento','#B8BCC2'],['Rosso scuro','#7A1022']],
  temi:['Onorare antenate e antenati','Divinazione','Lasciare andare','Shadow work','Gratitudine per il raccolto','Protezione della casa'],
  pietre:['Ossidiana','Onice nera','Tormalina nera','Quarzo fumé','Ametista','Granato'],tavola:['Zucca','Mele','Melograno','Castagne','Radici al forno']},
 yule:{nome:'Yule',kind:'Solstizio d’inverno',m:11,d:21,icon:'🕯️',bg:['#0F3B2A','#7A1022'],fg:'#FDFDFB',
  frase:'Nella notte più lunga la luce rinasce: si accendono candele, si riposa e si celebra il poco che basta. Da qui le giornate tornano ad allungarsi.',
  colori:[['Rosso','#A3122A'],['Verde abete','#1F5D3C'],['Oro','#C9A227'],['Bianco','#F4F4F0'],['Argento','#B8BCC2']],
  temi:['Rinascita della luce','Speranza','Riposo e raccoglimento','Famiglia e calore','Gratitudine','Nuove intenzioni per l’anno'],
  pietre:['Granato','Rubino','Eliotropio','Smeraldo','Cristallo di rocca','Serpentino'],tavola:['Arance','Frutta secca','Cannella','Zuppe calde','Pane speziato']},
 imbolc:{nome:'Imbolc',kind:'Sabba maggiore',m:1,d:1,icon:'🔥',bg:['#F3EEF7','#E9F1EC'],fg:'#1B2A21',
  frase:'Imbolc accende la brace sotto la cenere: è la festa di Brigid, della purificazione e dei primi segni di risveglio. Nutri ciò che sta nascendo.',
  colori:[['Bianco','#F7F7F4'],['Argento','#B8BCC2'],['Rosa pallido','#F2C6D2'],['Giallo tenue','#F4E27A'],['Verde chiaro','#A9D3B1']],
  temi:['Purificazione','Nuovi inizi','Ispirazione e creatività','Cura del focolare','Benedire i semi e i progetti','Pulizie di stagione'],
  pietre:['Ametista','Pietra di luna','Granato','Turchese','Onice','Cristallo di rocca'],tavola:['Latte vegetale caldo','Pane fatto in casa','Semi','Agrumi','Tisane']},
 ostara:{nome:'Ostara',kind:'Equinozio di primavera',m:2,d:20,icon:'🌱',bg:['#E8F4DC','#FBE7EF'],fg:'#1B2A21',
  frase:'Con Ostara giorno e notte si equivalgono: è tempo di semina, equilibrio e rinnovamento. Pianta intenzioni come semi e muoviti con leggerezza.',
  colori:[['Verde tenero','#9BCB7A'],['Giallo','#F2D44E'],['Rosa','#F2A7BF'],['Lilla','#C3A6DB'],['Azzurro','#A9D4EE']],
  temi:['Equilibrio','Fertilità e semina','Rinnovamento','Crescita personale','Nuovi progetti','Connessione con la natura'],
  pietre:['Acquamarina','Quarzo rosa','Pietra di luna','Avventurina','Ametista','Giada'],tavola:['Germogli','Asparagi','Piselli','Erbe fresche','Fragole']},
 beltane:{nome:'Beltane',kind:'Sabba maggiore',m:4,d:1,icon:'🌸',bg:['#7A1022','#1F5D3C'],fg:'#FDFDFB',
  frase:'Beltane celebra la vita in piena fioritura: passione, creatività e gioia. Si saltano i fuochi, si intrecciano nastri e si onora il piacere di esistere.',
  colori:[['Rosso','#B3122E'],['Bianco','#F7F7F4'],['Verde','#3E8E4F'],['Rosa','#F2A7BF'],['Oro','#C9A227']],
  temi:['Passione e amore','Fertilità e creatività','Gioia e piacere','Unione','Coraggio','Onorare il corpo'],
  pietre:['Corniola','Smeraldo','Quarzo rosa','Malachite','Granato','Zaffiro'],tavola:['Fiori eduli','Fragole','Verdure fresche','Pane dolce','Erbe aromatiche']},
 litha:{nome:'Litha',kind:'Solstizio d’estate',m:5,d:21,icon:'☀️',bg:['#F6C343','#E07A1F'],fg:'#1B2A21',
  frase:'Litha è il giorno più lungo: la luce è al suo culmine. Celebra la tua forza, raccogli energia e ricorda che da domani il sole inizia a calare.',
  colori:[['Oro','#C9A227'],['Giallo','#F2D44E'],['Arancione','#E07A1F'],['Rosso','#B3122E'],['Blu cielo','#5AA6D6'],['Verde','#3E8E4F']],
  temi:['Potere e abbondanza','Celebrare la luce','Protezione','Successo','Fiducia in sé','Vita all’aperto'],
  pietre:['Citrino','Occhio di tigre','Ambra','Pietra del sole','Smeraldo','Lapislazzuli'],tavola:['Frutta estiva','Pomodori','Erbe del solstizio','Insalate','Limonata']},
 lughnasadh:{nome:'Lughnasadh',kind:'Sabba maggiore · Lammas',m:7,d:1,icon:'🌾',bg:['#C98A2B','#7A4E1D'],fg:'#FDFDFB',
  frase:'Il primo raccolto onora Lugh, dio dalle mille abilità: riconosci ciò che hai costruito, condividi il pane e ringrazia anche per la fatica.',
  colori:[['Oro','#C9A227'],['Arancione','#E07A1F'],['Giallo grano','#E3C16F'],['Marrone','#7A4E1D'],['Verde','#3E8E4F']],
  temi:['Primo raccolto','Gratitudine','Condivisione','Mettersi alla prova','Abilità e talenti','Sacrificio e impegno'],
  pietre:['Corniola','Citrino','Avventurina','Occhio di tigre','Peridoto','Ambra'],tavola:['Pane','Cereali','Mais','More','Frutta estiva']},
 mabon:{nome:'Mabon',kind:'Equinozio d’autunno',m:8,d:22,icon:'🍂',bg:['#8A3B12','#5B2A6E'],fg:'#FDFDFB',
  frase:'Mabon riporta l’equilibrio tra luce e buio: è il secondo raccolto, il tempo del bilancio. Tieni ciò che nutre, lascia cadere il resto come foglie.',
  colori:[['Arancione','#D9731A'],['Rosso scuro','#7A1022'],['Marrone','#7A4E1D'],['Oro','#C9A227'],['Viola','#5B2A6E'],['Bordeaux','#800020']],
  temi:['Equilibrio','Gratitudine','Secondo raccolto','Bilancio','Lasciare andare','Prepararsi al riposo'],
  pietre:['Zaffiro','Lapislazzuli','Occhio di tigre','Citrino','Ametista','Ambra'],tavola:['Mele','Uva','Zucca','Noci','Funghi']}};
const ORDER=['imbolc','ostara','beltane','litha','lughnasadh','mabon','samhain','yule'];
const ESBAT={nome:'Esbat · Luna piena',icon:'🌕',bg:['#DCE4F2','#F7F7FA'],fg:'#1B2A21',
 frase:'Con la luna piena si celebra l’esbat: momento di gratitudine, di ricarica e di rilascio. Metti i cristalli alla luce della luna e guarda cosa è sbocciato.',
 colori:[['Bianco','#F7F7F4'],['Argento','#B8BCC2'],['Azzurro','#A9D4EE'],['Blu notte','#1E2A4A']],
 temi:['Gratitudine','Manifestare','Ricaricare i cristalli','Divinazione','Rilasciare ciò che pesa','Celebrare i risultati'],
 pietre:['Cristallo di rocca','Pietra di luna','Selenite','Ametista','Labradorite']};
const LUNE=[['Luna del Lupo','Granato','proteggere e restare unite'],['Luna della Neve','Ametista','purificare e chiarire'],['Luna del Verme','Acquamarina','risvegliare e preparare il terreno'],['Luna Rosa','Quarzo rosa','aprirsi e fiorire'],['Luna dei Fiori','Smeraldo','abbondanza e fertilità'],['Luna delle Fragole','Pietra di luna','dolcezza e raccolto dei frutti'],['Luna del Cervo','Rubino','forza e crescita'],['Luna dello Storione','Peridoto','gratitudine e nutrimento'],['Luna del Raccolto','Zaffiro','raccogliere e fare bilancio'],['Luna del Cacciatore','Tormalina','prepararsi e proteggersi'],['Luna del Castoro','Topazio','costruire e mettere al sicuro'],['Luna Fredda','Turchese','riposare e custodire la luce']];
const NEWMOON={nome:'Luna nuova',icon:'🌑',bg:['#151A2E','#2D2348'],fg:'#FDFDFB',
 frase:'Nella luna nuova il cielo è buio e fertile: è il momento delle intenzioni, dei semi invisibili e dell’ascolto interiore. Scrivi cosa vuoi far crescere.',
 colori:[['Nero','#141414'],['Blu notte','#1E2A4A'],['Indaco','#3B2F7A'],['Argento scuro','#8A8F99']],
 temi:['Fissare intenzioni','Nuovi inizi','Introspezione','Riposo','Shadow work','Pulizia energetica'],
 pietre:['Ossidiana','Labradorite','Pietra di luna nera','Onice','Tormalina nera']};
/* ── Fasi lunari ── */
const SYN=29.530588853,REF=Date.UTC(2000,0,6,18,14);
const moonAge=d=>{const a=((d.getTime()-REF)/864e5)%SYN;return a<0?a+SYN:a};
function nextPhase(from,target){const a=moonAge(from);let dd=target-a;if(dd<0)dd+=SYN;const x=new Date(from.getTime()+dd*864e5);return x}
function sabbatDate(k,y){const s=SABBAT[k];return new Date(y,s.m,s.d,12)}
function nearestSabbat(d){let best=null;for(const y of [d.getFullYear()-1,d.getFullYear(),d.getFullYear()+1])for(const k of ORDER){const t=sabbatDate(k,y),diff=Math.round((t-d)/864e5);if(!best||Math.abs(diff)<Math.abs(best.diff))best={k,diff,date:t}}return best}
function lastSabbat(d){let best=null;for(const y of [d.getFullYear()-1,d.getFullYear()])for(const k of ORDER){const t=sabbatDate(k,y);if(t<=d&&(!best||t>best.date))best={k,date:t}}return best}
function nextSabbat(d){let best=null;for(const y of [d.getFullYear(),d.getFullYear()+1])for(const k of ORDER){const t=sabbatDate(k,y);if(t>d&&(!best||t<best.date))best={k,date:t}}return best}
const fmt=d=>d.toLocaleDateString('it-IT',{day:'numeric',month:'long'});
function currentEvent(now){const ns=nearestSabbat(now);if(Math.abs(ns.diff)<=3){const s=SABBAT[ns.k];return{...s,label:s.kind+(ns.diff===0?' · oggi':ns.diff>0?` · tra ${ns.diff} ${ns.diff===1?'giorno':'giorni'}`:` · ${-ns.diff} ${ns.diff===-1?'giorno':'giorni'} fa`)}}
 const age=moonAge(now);if(Math.abs(age-SYN/2)<=1.1){const L=LUNE[now.getMonth()];return{...ESBAT,nome:`Esbat · ${L[0]}`,label:'Luna piena',temi:[...ESBAT.temi,L[2][0].toUpperCase()+L[2].slice(1)],pietre:[L[1],...ESBAT.pietre]}}
 if(age<=1.1||age>=SYN-1.1)return{...NEWMOON,label:'Fase lunare'};
 const ls=lastSabbat(now),nx=nextSabbat(now),s=SABBAT[ls.k];return{...s,nome:`Tempo di ${s.nome}`,label:`Ruota dell’Anno · verso ${SABBAT[nx.k].nome} (${fmt(nx.date)})`}}
function monthEvent(m){let k=ORDER.find(k=>SABBAT[k].m===m-1);if(!k)k=lastSabbat(new Date(new Date().getFullYear(),m-1,15)).k;const s=SABBAT[k];return{...s,label:`${s.kind} · ${s.d} ${months[s.m].toLowerCase()}${s.m!==m-1?' · la ruota in questo mese':''}`}}
let selected=new Date().getMonth()+1;
root.innerHTML=`<div class="season-layout"><div class="season-wheel"><div class="season-core"><span id="seasonIcon" style="font-size:28px">🌿</span><strong id="seasonTitle"></strong><small id="seasonName"></small></div></div><div class="season-side"><h3>La ruota delle stagioni</h3><p class="muted" style="margin:3px 0">Frutta e ortaggi indicativamente di stagione in Italia.</p><p id="seasonCount" class="pill"></p></div></div>
<div class="season-months"><button type="button" id="seasonPrev" aria-label="Mese precedente">←</button><strong id="seasonMonth"></strong><button type="button" id="seasonNext" aria-label="Mese successivo">→</button></div>
<b>Ortaggi</b><div class="season-foods" id="seasonVeg"></div><b style="display:block;margin-top:12px">Frutta</b><div class="season-foods" id="seasonFruit"></div>
<div id="sabbatBox" class="sabbat"></div>
<p class="muted fine" style="margin-top:10px">Calendario locale, senza internet. La Ruota dell’Anno segue gli otto sabba moderni; le fasi lunari sono calcolate dal telefono (precisione ±1 giorno).</p>`;
function circles(cs){return cs.map(([n,h])=>`<span class="swatch"><i style="background:${h}"></i>${esc(n)}</span>`).join('')}
function renderBox(){const now=new Date(),isNow=selected===now.getMonth()+1;const e=isNow?currentEvent(now):monthEvent(selected);
 const nf=nextPhase(now,SYN/2),nn=nextPhase(now,0),nx=nextSabbat(now);
 const box=document.getElementById('sabbatBox');box.style.background=`linear-gradient(140deg,${e.bg[0]},${e.bg[1]})`;box.style.color=e.fg;box.classList.toggle('dark',e.fg==='#FDFDFB');
 box.innerHTML=`<div class="sabbat-head"><span class="sabbat-icon">${e.icon}</span><div><small>${esc(e.label)}</small><h3>${esc(e.nome)}</h3></div></div><p class="sabbat-phrase">${esc(e.frase)}</p>
 <div class="sabbat-sec"><b>Colori</b><div class="swatches">${circles(e.colori)}</div></div>
 <div class="sabbat-sec"><b>Temi da onorare</b><div class="sabbat-chips">${e.temi.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div>
 <div class="sabbat-sec"><b>Pietre per l’altare</b><div class="sabbat-chips">${e.pietre.map(t=>`<span>💎 ${esc(t)}</span>`).join('')}</div></div>
 ${e.tavola?`<div class="sabbat-sec"><b>Sulla tavola</b><div class="sabbat-chips">${e.tavola.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div>`:''}
 ${isNow?`<p class="sabbat-next">🌕 Luna piena ${fmt(nf)} (${LUNE[nf.getMonth()][0]}) · 🌑 Luna nuova ${fmt(nn)} · ${SABBAT[nx.k].icon} ${SABBAT[nx.k].nome} ${fmt(nx.date)}</p>`:''}`}
function render(){const x=byMonth(selected),e=monthEvent(selected);document.getElementById('seasonTitle').textContent=x.season;document.getElementById('seasonName').textContent=months[selected-1];document.getElementById('seasonMonth').textContent=months[selected-1];document.getElementById('seasonCount').textContent=(x.vegetables.length+x.fruits.length)+' ingredienti';document.getElementById('seasonIcon').textContent=e.icon;document.getElementById('seasonVeg').innerHTML=x.vegetables.map(s=>`<span class="season-chip">${esc(s)}</span>`).join('');document.getElementById('seasonFruit').innerHTML=x.fruits.map(s=>`<span class="season-chip">${esc(s)}</span>`).join('');renderBox()}
document.getElementById('seasonPrev').onclick=()=>{selected=selected===1?12:selected-1;render()};document.getElementById('seasonNext').onclick=()=>{selected=selected===12?1:selected+1;render()};
let day=new Date().getDate();document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&new Date().getDate()!==day){day=new Date().getDate();selected=new Date().getMonth()+1;render()}});
render();
})();

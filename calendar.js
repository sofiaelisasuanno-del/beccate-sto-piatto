/* LAPAPPA · PAPPA BUONA: calendario locale, porzioni sulle calorie, valori nutrizionali, pasti mangiati e vitamine. */
(function(){
const meals=BSP.slots; // ['Colazione','Pranzo','Spuntino','Cena'] · indice = slot del catalogo
const templates=window.BSP_RECIPE_CATALOG||[];
const NU=window.BSPnutri;
const icons=['🍵','🧉','🌿','🕯️'];
const section=document.getElementById('ricette');
const block=document.createElement('div');
block.innerHTML=`<div class="card"><div class="cal-head"><h3>🧪 Il calendario della pappa</h3><select id="calView" aria-label="Vista"><option value="week">Settimana</option><option value="day">Giorno</option></select></div>
<p class="muted">Genera solo i pasti ancora possibili. Approva un piatto per renderlo definitivo; spunta <b>Mangiato</b> quando l’hai pappato davvero e finisce nello Storico della bonanza.</p>
<div class="weeknav"><button type="button" class="action secondary mini" id="calPrev" aria-label="Settimana precedente">←</button><div class="weekbar" id="calDays"></div><button type="button" class="action secondary mini" id="calNext" aria-label="Settimana successiva">→</button></div>
<div class="calendar-actions"><button type="button" class="action" id="calGenerate">🔮 Genera la settimana</button><button type="button" class="action secondary" id="calDay">Rigenera il giorno</button><button type="button" class="action secondary" id="calMissing">Aggiungi mancanti alla spesa</button></div>
<p class="minicap" id="calStatus" role="status"></p><div id="calMeals"></div></div>
<div class="card" id="nutritionSummary"><h3>🌿 Qualità nutrizionale della settimana</h3><div id="nutritionBody"></div></div>`;
section.appendChild(block);

const extra=document.createElement('div');extra.className='card';extra.innerHTML=`<h3>🍕 Un pasto fuori programma?</h3><p class="muted extra-quote">Ogni tanto bisogna pappare forte... e tu non ti fermi al gelatino miserabile! Quando va fatto, te magni pure il gelataio!</p><button type="button" class="action secondary" id="extraToggle">+ Registra un pasto fuori programma</button><div id="extraForm" hidden><label for="extraDate">Data del pasto</label><input type="date" id="extraDate"><label for="extraTime">Orario</label><input type="time" id="extraTime"><label for="extraSlot">Tipo di pasto</label><select id="extraSlot"><option>Colazione</option><option>Pranzo</option><option>Spuntino</option><option>Cena</option><option>Altro</option></select><label for="extraTitle">Che cosa hai mangiato?</label><input id="extraTitle" placeholder="Es. pizza vegana con verdure"><label for="extraCategories">Categoria alimentare (anche più di una)</label><select multiple size="7" id="extraCategories"><option>Verdure e frutta</option><option>Legumi e derivati</option><option>Cereali e tuberi</option><option>Frutta secca e semi</option><option>Dolce</option><option>Snack salato</option><option>Fritto</option><option>Bevanda</option><option>Altro</option></select><label>Ingredienti (facoltativi: calcolano da soli calorie e nutrienti)</label><div id="extraIngs" class="ing-editor"></div><label>Oppure valori nutrizionali a mano (se li conosci, vincono sugli ingredienti)</label><div class="grid five"><input id="extraKcal" type="number" min="0" inputmode="numeric" placeholder="kcal" aria-label="Calorie"><input id="extraProt" type="number" min="0" step="0.1" placeholder="Prot g" aria-label="Proteine"><input id="extraCarb" type="number" min="0" step="0.1" placeholder="Carb g" aria-label="Carboidrati"><input id="extraFat" type="number" min="0" step="0.1" placeholder="Grassi g" aria-label="Grassi"><input id="extraFib" type="number" min="0" step="0.1" placeholder="Fibre g" aria-label="Fibre"></div><label for="extraNotes">Ingredienti / note (facoltativi)</label><textarea id="extraNotes" placeholder="Puoi annotare ingredienti e quantità se le conosci"></textarea><button type="button" class="action" id="extraSave">Salva nello Storico della bonanza</button></div>`;
section.appendChild(extra);
const ed=document.getElementById('extraDate'),et=document.getElementById('extraTime');const now=new Date();ed.value=isoDay(now);et.value=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
let extraEd=BSP.ingEditor(document.getElementById('extraIngs'),[]);
document.getElementById('extraToggle').onclick=()=>{const p=document.getElementById('extraForm');p.hidden=!p.hidden};
document.getElementById('extraSave').onclick=()=>{
 const title=document.getElementById('extraTitle').value.trim(),date=ed.value,time=et.value;
 if(!title||!date||!time)return alert('Inserisci alimento, data e ora.');
 const when=new Date(date+'T'+time);if(when>new Date())return alert('Puoi registrare solo pasti già consumati. Niente profezie qui 🔮');
 const selectedTypes=Array.from(document.getElementById('extraCategories').selectedOptions).map(x=>x.value);
 if(!selectedTypes.length)return alert('Seleziona almeno una categoria alimentare.');
 const num=id=>{const v=document.getElementById(id).value;return v===''?null:Number(v)};const kcal=num('extraKcal');
 const manual=kcal===null?null:{kcal:Math.round(kcal),prot:num('extraProt')||0,carb:num('extraCarb')||0,fat:num('extraFat')||0,fib:num('extraFib')||0};
 if(extraEd.invalid())return alert('Alcuni ingredienti non sono stati scelti dall’elenco: selezionali o toglili.');const xIngs=extraEd.get();const xN=!manual&&xIngs.length?NU.compute(xIngs):null;
 const entries=records();entries.push({id:'x'+Date.now().toString(36)+Math.random().toString(36).slice(2),date,slot:document.getElementById('extraSlot').value,title,notes:document.getElementById('extraNotes').value.trim(),category:selectedTypes.join(', '),outOfPlan:true,approved:false,eaten:true,hasPhoto:false,eatenAt:when.toISOString(),photoTime:null,ingredients:xIngs,steps:'',manual,nutrition:xN||undefined});
 saveRecords(entries);window.dispatchEvent(new CustomEvent('bsp:extra',{detail:{date}}));['extraTitle','extraNotes','extraKcal','extraProt','extraCarb','extraFat','extraFib'].forEach(id=>document.getElementById(id).value='');extraEd=BSP.ingEditor(document.getElementById('extraIngs'),[]);document.getElementById('extraForm').hidden=true;alert('Pasto salvato nello Storico della bonanza. Ora puoi fotografarlo 📷');
};

const dlg=document.createElement('dialog');dlg.className='sheet';dlg.id='mealDialog';dlg.innerHTML=`<h3>🪶 Modifica gli ingredienti</h3><p class="minicap" id="mealDlgTitle"></p><p class="muted fine">Sostituisci un ingrediente cercandone un altro (🧺 = ce l’hai in dispensa), cambia le quantità o toglilo. Calorie e nutrienti si ricalcolano da soli.</p><div id="mealDlgEd" class="ing-editor"></div><div class="sheet-actions"><button type="button" class="action" id="mealDlgSave">Salva il piatto</button><button type="button" class="action secondary" id="mealDlgCancel">Annulla</button></div>`;document.body.appendChild(dlg);
let mealEd=null,mealTarget=null;
function openEditor(date,slot){const lock=approved(date,slot);const r=lock||(plan[date]||[]).find(x=>x.slot===meals[slot]);if(!r)return;mealTarget={date,slot,lockId:lock?.id};document.getElementById('mealDlgTitle').textContent=`${meals[slot]} · ${r.title}`;mealEd=BSP.ingEditor(document.getElementById('mealDlgEd'),(r.ingredients||[]).map(x=>({...x,id:x.id||NU.find(x.name)?.id||''})));dlg.showModal?dlg.showModal():dlg.setAttribute('open','')}
document.getElementById('mealDlgCancel').onclick=()=>dlg.close();
document.getElementById('mealDlgSave').onclick=()=>{if(!mealTarget)return;if(mealEd.invalid())return alert('Scegli dall’elenco ogni ingrediente nuovo, oppure toglilo.');const ings=mealEd.get();if(!ings.length)return alert('Un piatto senza ingredienti è magia troppo avanzata anche per noi 🔮');const {date,slot,lockId}=mealTarget;
 const ix=(plan[date]||[]).findIndex(x=>x.slot===meals[slot]);if(ix>=0){plan[date][ix]={...NU.withNutrition(plan[date][ix],ings),edited:true};localStorage.setItem(pfx,JSON.stringify(plan))}
 if(lockId){const list=records(),e=list.find(x=>x.id===lockId);if(e){const w=NU.withNutrition(e,ings);e.ingredients=ings;e.nutrition=w.nutrition;e.ferro=w.ferro;e.edited=true;saveRecords(list)}}
 dlg.close();renderCal();setStatus('Ingredienti aggiornati: valori ricalcolati 🪶')};
const pfx='bsp-planner-v2',bkey='bsp-bonanza-v1';
let plan={};try{plan=JSON.parse(localStorage.getItem(pfx)||'{}');if(!plan||typeof plan!=='object'||Array.isArray(plan))plan={}}catch(e){plan={}}
const cutoff=[10*60+30,14*60,17*60+30,22*60];
const iso=isoDay,today=()=>iso(new Date());
function weekMonday(d){const x=new Date(d);x.setHours(12,0,0,0);x.setDate(x.getDate()-(x.getDay()+6)%7);return x}
let start=weekMonday(new Date()),selected=today();
function dateOffset(i){const d=new Date(start);d.setDate(d.getDate()+i);return iso(d)}
function weekDates(){return Array.from({length:7},(_,i)=>dateOffset(i))}
function eligibility(date,slot){const n=new Date();const current=today();if(date<current)return false;if(date>current)return true;return n.getHours()*60+n.getMinutes()<=cutoff[slot]}
function records(){return BSP.records()}
function saveRecords(list){localStorage.setItem(bkey,JSON.stringify(list));window.BSPwellbeing?.render?.();window.dispatchEvent(new Event('bsp:data'))}
function approved(date,slot){return records().find(e=>e.date===date&&e.slot===meals[slot]&&e.approved===true)}
function latest(){return [...(data.logs||[])].sort((a,b)=>(b.date+' '+b.time).localeCompare(a.date+' '+a.time))[0]||null}
const basic=new Set(NU?.basic||[]);
function available(){const v={};for(const f of(data.foods||[])){const k=String(f.name||'').trim().toLowerCase();if(!k)continue;const key=k+'|'+(f.unit||'g');v[key]=(v[key]||0)+Math.max(0,Number(f.qty)||0)}return v}
function missingFor(recipe,inventory){return (recipe.ingredients||[]).filter(x=>!basic.has(x.name)&&((inventory[String(x.name).toLowerCase()+'|'+x.unit]||0)<Number(x.qty||0)))}
function nut(r){return r.nutrition&&Number.isFinite(r.nutrition.kcal)?r.nutrition:(NU?NU.compute(r.ingredients):null)}
function slotTarget(slot){return BSP.targets().kcal*BSP.slotShare(slot)}
function fit(t,slot){const target=slotTarget(slot),k=t.nutrition?.kcal||target;return Math.min(1.6,Math.max(.6,target/k))}
function choose(slot,seed,used,prevTitle,date,opts={}){
 const activeSeason=window.BSPseason?.season?.(new Date(date+'T12:00'))||'autunno';
 let options=templates.filter(t=>t.slot===slot&&t.season===activeSeason);if(!options.length)throw Error('Archivio ricette non caricato.');
 if(opts.ironOnly){const iron=options.filter(t=>t.nutrition.iron*fit(t,slot)>=NU.ironMin);if(iron.length)options=iron}
 const log=latest(),highBloat=log&&Number(log.bloat)>=7,lowEnergy=log&&Number(log.energy)<=4;
 const period=window.BSPcycle?.status?.(date)||{};
 const history=Object.entries(plan).flatMap(([d,rs])=>(rs||[]).filter(r=>r.slot===meals[slot]&&d!==date).map(r=>r.title));
 const approvedTitles=records().filter(r=>r.approved).map(r=>r.title);
 const recent=new Set([...history,...approvedTitles]);
 const prefs=String(data.diet?.prefs||'').toLowerCase();
 const disallowed=prefs.includes('no tempeh')?['tempeh']:[];
 const recomposition=/ricomposizione/i.test(data.diet?.goal||'');
 const target=slotTarget(slot);
 const ranked=options.map((t,i)=>{
  let score=t.ingredients.reduce((a,x)=>a+((used[x.name.toLowerCase()+'|'+x.unit]||0)>=x.qty?1.8:0),0);
  if(highBloat&&t.tags.includes('delicato'))score+=3;
  if(highBloat&&t.ingredients.some(x=>/ceci|fagioli|edamame|lenticchie/.test(x.name)))score-=2;
  if(lowEnergy&&t.tags.includes('facile'))score+=2;
  if(period.bleeding&&t.ferro==='si')score+=2; if(period.bleeding&&t.tags.includes('vitamina C'))score+=1.5; if(window.BSPseason?.has?.(t.produce,new Date(date+'T12:00')))score+=2.5; else if(t.produce)score-=1;
  if(recent.has(t.title))score-=35; if(history.slice(-14).some(x=>x.split(' · ')[0].replace(/ \(.*\)$/,'')===t.title.split(' · ')[0].replace(/ \(.*\)$/,'')))score-=15;
  if(t.title===prevTitle)score-=70;
  if(t.market)score+=3;
  if(t.ingredients.some(x=>/zucchin/i.test(x.name)))score-=13;
  if(t.ingredients.some(x=>/tempeh/i.test(x.name)))score-=40;
  if(t.ingredients.some(x=>/miso|funghi|shiitake|tofu|seitan|cicoria|zucca|avocado|cetrioli|riso|wasa|cocco/i.test(x.name)))score+=2;
  if(t.ingredients.some(x=>/yogurt di soia/i.test(x.name)))score-=9;
  if(disallowed.some(x=>t.ingredients.some(y=>y.name.includes(x))))score-=100;
  // nuove regole v2: porzione vicina al target calorico e, in ricomposizione, densità proteica
  const k=t.nutrition.kcal;score-=Math.min(4,Math.abs(Math.log(target/k))*4);
  if(recomposition)score+=Math.min(3,(t.nutrition.prot*4/k)*12);
  score+=((seed+i*17)%53)/53;
  return {t,score};
 }).sort((a,b)=>b.score-a.score);
 const pick=JSON.parse(JSON.stringify(ranked[0].t));
 return NU.scale(pick,fit(pick,slot));
}
function validatePlan(){for(const [date,list]of Object.entries(plan)){if(!Array.isArray(list)){delete plan[date];continue}plan[date]=list.filter(r=>r&&meals.includes(r.slot)).map(r=>({...r,ingredients:(r.ingredients||[]).map(x=>Array.isArray(x)?{name:x[0],qty:x[1],unit:x[2]}:x)}))}}
validatePlan();
function store(){localStorage.setItem(pfx,JSON.stringify(plan));renderCal();window.BSPwellbeing?.render?.()}
function hasIron(date){return BSP.activeSlots().some(s=>{const r=approved(date,s)||(plan[date]||[]).find(x=>x.slot===meals[s]);if(!r)return false;const n=nut(r);return n&&n.iron>=NU.ironMin})}
function ensureIron(date,used){if(!window.BSPcycle?.status?.(date)?.bleeding||hasIron(date))return false;
 // sceglie il pasto modificabile più adatto (prima pranzo e cena) e lo sostituisce con un piatto ricco di ferro
 for(const slot of [1,3,0,2].filter(s=>BSP.activeSlots().includes(s))){if(approved(date,slot)||!eligibility(date,slot))continue;const ix=(plan[date]||[]).findIndex(r=>r.slot===meals[slot]);const r=choose(slot,Number(date.replaceAll('-',''))+slot+7,used,ix>=0?plan[date][ix].title:'',date,{ironOnly:true});r.slot=meals[slot];r.source='Generatore locale · ferro';if(ix>=0)plan[date][ix]=r;else plan[date].push(r);return true}return false}
function generate(dayOnly){const used=available(),dates=dayOnly?[selected]:weekDates();let changed=0,locked=0,iron=0;
 for(const date of dates){if(!plan[date])plan[date]=[];for(const slot of BSP.activeSlots()){
  const ix=plan[date].findIndex(r=>r.slot===meals[slot]);if(approved(date,slot)){locked++;continue}if(!eligibility(date,slot)){locked++;if(ix!==-1)plan[date].splice(ix,1);continue}
  const old=ix>=0?plan[date][ix]:null;const r=choose(slot,Number(date.replaceAll('-',''))+slot+Math.floor(Math.random()*100),used,old?.title,date);r.slot=meals[slot];r.source='Generatore locale';if(ix>=0)plan[date][ix]=r;else plan[date].push(r);changed++;
  for(const x of r.ingredients){const k=x.name.toLowerCase()+'|'+x.unit;used[k]=Math.max(0,(used[k]||0)-Number(x.qty||0))}
 }if(ensureIron(date,used))iron++;plan[date].sort((a,b)=>meals.indexOf(a.slot)-meals.indexOf(b.slot))}
 store();setStatus(changed?`${changed} pasti generati o aggiornati. ${locked} pasti protetti o fuori orario.${iron?` 🌙 ${iron} ${iron===1?'giorno':'giorni'} di ciclo con piatto ricco di ferro garantito.`:''}`:'Nessun pasto modificabile: approvato oppure oltre l’orario consentito.')}
function setStatus(s){document.getElementById('calStatus').textContent=s}
function approve(date,slot,silent){if(!eligibility(date,slot)){alert('Il termine per approvare questo pasto è trascorso.');return false}if(approved(date,slot)){if(!silent)alert('Questo piatto è già approvato.');return false}const r=(plan[date]||[]).find(x=>x.slot===meals[slot]);if(!r)return false;
 if(!silent&&!confirm(`Approvare definitivamente «${r.title}» per ${meals[slot].toLowerCase()} del ${date}? Non potrai più rigenerarlo.`))return false;
 const list=records();if(list.some(x=>x.date===date&&x.slot===meals[slot]&&x.approved))return false;
 list.push({id:'b'+Date.now().toString(36)+Math.random().toString(36).slice(2),date,slot:meals[slot],title:r.title,notes:'',hasPhoto:false,approved:true,eaten:false,approvedAt:new Date().toISOString(),takenAt:null,ingredients:r.ingredients,steps:r.steps,nutrition:nut(r),ferro:r.ferro||(nut(r)?.iron>=NU.ironMin?'si':'no')});saveRecords(list);store();window.dispatchEvent(new Event('bsp:approved'));if(!silent)setStatus('Piatto approvato! Quando l’hai mangiato, spunta “Mangiato”.');return true}
function setEaten(date,slot,checked){if(date>today()){alert('Non puoi aver già mangiato un pasto del futuro. A meno che tu non sia una vera strega 🔮');return renderCal()}
 let rec=approved(date,slot);
 if(checked&&!rec){if(!confirm('Segnare come mangiato approva anche il piatto in modo definitivo. Procedo?'))return renderCal();if(!approve(date,slot,true))return renderCal();rec=approved(date,slot)}
 if(!rec)return renderCal();const list=records(),e=list.find(x=>x.id===rec.id);e.eaten=!!checked;e.eatenAt=checked?new Date().toISOString():null;saveRecords(list);window.dispatchEvent(new CustomEvent('bsp:eaten',{detail:{date}}));renderCal();setStatus(checked?'Segnato come mangiato e spedito nello Storico della bonanza 🐦‍⬛':'Tolto dai pasti mangiati.')}
function gatherMissing(){const stock=available(),needs={};for(const date of weekDates()){for(const recipe of plan[date]||[]){const s=meals.indexOf(recipe.slot);if(!BSP.activeSlots().includes(s))continue;if(!eligibility(date,s)&&!approved(date,s))continue;for(const x of recipe.ingredients||[]){if(basic.has(x.name))continue;const k=x.name.toLowerCase()+'|'+x.unit;needs[k]=(needs[k]||0)+Number(x.qty||0)}}}return Object.entries(needs).map(([k,qty])=>{const [name,unit]=k.split('|');return{name,unit,qty:Math.max(0,qty-(stock[k]||0))}}).filter(x=>x.qty>0)}
function chips(n){if(!n)return'';return `<div class="macro-chips"><span class="chip kcal">${n.kcal} kcal</span><span class="chip">P ${n.prot} g</span><span class="chip">C ${n.carb} g</span><span class="chip">G ${n.fat} g</span><span class="chip">F ${n.fib} g</span></div>`}
function bar(label,v,t,unit){const pct=t?Math.min(130,v/t*100):0;return `<div class="tbar"><span class="tlabel">${label}</span><span class="ttrack"><span style="width:${Math.min(100,pct)}%" class="${pct>110?'over':''}"></span></span><span class="tval">${v}${unit} <small>/ ${t}${unit}</small></span></div>`}
function dayPanel(date){const tg=BSP.targets(),act=BSP.activeSlots();let planned={kcal:0,prot:0,carb:0,fat:0,fib:0};for(const s of act){const r=approved(date,s)||(plan[date]||[]).find(x=>x.slot===meals[s]);const n=r&&nut(r);if(n)for(const k in planned)planned[k]+=Number(n[k])||0}
 for(const k of['prot','carb','fat','fib'])planned[k]=Math.round(planned[k]);const eaten=BSP.dayTotals(date),d=BSP.daily()[date]||{};
 return `<div class="daypanel"><div class="vits"><label class="check"><input type="checkbox" data-vit="vitD" data-date="${date}" ${d.vitD?'checked':''}> ☀️ Vitamina D</label><label class="check"><input type="checkbox" data-vit="vitB12" data-date="${date}" ${d.vitB12?'checked':''}> 🌿 Vitamina B12</label></div>
 <details><summary>Valori del giorno · pianificati <b>${planned.kcal}</b> kcal · mangiati <b>${eaten.kcal}</b> kcal</summary>${bar('kcal',eaten.kcal,tg.kcal,'')}${bar('Proteine',Math.round(eaten.prot),tg.prot,' g')}${bar('Carboidrati',Math.round(eaten.carb),tg.carb,' g')}${bar('Grassi',Math.round(eaten.fat),tg.fat,' g')}${bar('Fibre',Math.round(eaten.fib),tg.fib,' g')}<p class="minicap">Pianificato: P ${planned.prot} g · C ${planned.carb} g · G ${planned.fat} g · F ${planned.fib} g</p></details></div>`}
function renderCal(){const days=weekDates(),act=BSP.activeSlots();document.getElementById('calDays').innerHTML=days.map(date=>{const i=new Date(date+'T12:00').getDay();return `<button type="button" class="daytab ${date===selected?'on':''} ${date===today()?'today':''}" data-date="${date}">${['Dom','Lun','Mar','Mer','Gio','Ven','Sab'][i]}<br><small>${date.slice(-2)}</small></button>`}).join('');document.querySelectorAll('.daytab').forEach(b=>b.onclick=()=>{selected=b.dataset.date;renderCal()});
 const dates=document.getElementById('calView').value==='day'?[selected]:days,inv=available();let html='';
 for(const date of dates){const availableSlots=act.filter(i=>eligibility(date,i)||approved(date,i));const bleeding=window.BSPcycle?.status?.(date)?.bleeding;
  html+=`<div class="dayblock"><h3 class="dayhead">${new Date(date+'T12:00').toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'})}${bleeding?' <span class="pill wine">🌙 ciclo · ferro</span>':''}</h3>`;
  if(!availableSlots.length){html+=`<p class="muted">Nessun pasto ancora generabile.</p>`}
  for(const slot of availableSlots){const lock=approved(date,slot);const r=lock||((plan[date]||[]).find(x=>x.slot===meals[slot]));if(!r){html+=`<p class="minicap">${meals[slot]} · Da generare</p>`;continue}const miss=missingFor(r,inv),n=nut(r),fe=n&&n.iron>=NU.ironMin,eaten=lock&&BSP.isEaten(lock);
   html+=`<div class="mealcard${eaten?' eaten':''}"><details><summary><div class="mealhead"><span class="meal-sticker">${icons[slot]}</span><span class="mealtext"><small>${esc(meals[slot])}${lock?' · ✓ Approvato':''}${fe?' · <span class="fe">Fe ricco di ferro</span>':''}</small><br><b>${esc(r.title)}</b>${n?`<br><small class="kcal-line">${n.kcal} kcal · P ${n.prot} · C ${n.carb} · G ${n.fat} · F ${n.fib}</small>`:''}</span></div><span aria-hidden="true">⌄</span></summary><div class="mealbody">${chips(n)}<b>Ingredienti</b><ul>${(r.ingredients||[]).map(x=>`<li>${esc(x.name)} — ${esc(x.qty)} ${esc(x.unit)}</li>`).join('')}</ul><b>Preparazione</b><p>${esc(r.steps||'')}</p>${r.sauceTip?`<div class="sauce-note"><b>Occhio ai condimenti, Arun:</b> ${esc(r.sauceTip)}</div>`:''}${miss.length?`<p class="missing">Da verificare nella dispensa: ${miss.map(x=>esc(x.name)).join(', ')}</p>`:''}<p class="minicap">${esc(r.origin||'')}${r.origin?' · ':''}${esc(r.season||'')} · ${esc((r.tags||[]).join(' · '))}${r.scale&&r.scale!==1?` · porzione ×${String(r.scale).replace('.',',')} sul tuo obiettivo calorico`:''}<br>Ricco di ferro: ${fe?'sì':'no'} (${n?n.iron:'–'} mg)${n&&n.ca!==undefined?` · calcio ${n.ca} mg`:''}${r.edited?' · ✎ ingredienti modificati':''} · Valori calcolati dal database ingredienti.</p></div></details>
   <div class="mealfoot">${lock?'<span class="pill">✓ Definitivo</span>':`<button type="button" class="action mini" data-approve-date="${date}" data-approve-slot="${slot}">✓ Approva piatto</button>`}<button type="button" class="action secondary mini" data-edit-date="${date}" data-edit-slot="${slot}">✎ Ingredienti</button><label class="check eat"><input type="checkbox" data-eat-date="${date}" data-eat-slot="${slot}" ${eaten?'checked':''} ${date>today()?'disabled':''}> 🍽️ Mangiato</label></div></div>`;
  }
  html+=dayPanel(date)+'</div>'}
 document.getElementById('calMeals').innerHTML=html;
 document.querySelectorAll('[data-approve-date]').forEach(b=>b.onclick=()=>approve(b.dataset.approveDate,Number(b.dataset.approveSlot)));
 document.querySelectorAll('[data-edit-date]').forEach(b=>b.onclick=()=>openEditor(b.dataset.editDate,Number(b.dataset.editSlot)));
 document.querySelectorAll('[data-eat-date]').forEach(c=>c.onchange=()=>setEaten(c.dataset.eatDate,Number(c.dataset.eatSlot),c.checked));
 document.querySelectorAll('[data-vit]').forEach(c=>c.onchange=()=>BSP.setDaily(c.dataset.date,{[c.dataset.vit]:c.checked}));
 renderNutrition();const log=latest();if(!document.getElementById('calStatus').textContent)setStatus(log?`Ultimo diario: energia ${log.energy}/10, gonfiore ${log.bloat}/10, stress ${log.stress}/10.`:`${templates.length} ricette stagionali nel calderone · frigo, sintomi, ciclo e calorie. Daje tutta, Arun!`)}
function renderNutrition(){const days=weekDates(),act=BSP.activeSlots(),rs=days.flatMap(d=>act.map(s=>approved(d,s)||(eligibility(d,s)?(plan[d]||[]).find(x=>x.slot===meals[s]):null)).filter(Boolean));const el=document.getElementById('nutritionBody');if(!rs.length){el.innerHTML='<p class="muted">Genera un piano per vedere l’indicatore orientativo.</p>';return}
 const names=rs.flatMap(r=>(r.ingredients||[]).map(x=>String(x.name||'').toLowerCase()));const has=re=>names.some(x=>re.test(x));const relevantSlots=days.flatMap(d=>act.map(i=>({d,i})).filter(x=>eligibility(x.d,x.i)||approved(x.d,x.i)));const checks=[['Verdure',has(/zucchin|carot|spinac|verd|zucca|brocc|pomodor|insalat|bietol|cavol|lattug|cicori|funghi|peperon|melanzan/)],['Proteine vegetali',has(/tofu|seitan|ceci|lenticch|fagiol|edamame|soia|pisell/)],['Cereali e tuberi',has(/riso|pasta|pane|avena|patat|cous|farro|quinoa|orzo|polenta|noodles|udon|soba|bulgur|gnocchi/)],['Varietà',new Set(names).size>=8],['Pasti pianificati',relevantSlots.length>0&&relevantSlots.every(({d,i})=>(plan[d]||[]).some(x=>x.slot===meals[i])||approved(d,i))]];const score=checks.filter(x=>x[1]).length;
 const tot=rs.map(nut).filter(Boolean),avgK=Math.round(tot.reduce((a,n)=>a+n.kcal,0)/Math.max(1,new Set(days).size));
 el.innerHTML=`<div class="scoreRow"><strong class="scoreBig">${score}<small>/5</small></strong><div><b>Indicatore orientativo del piano</b><p class="minicap">Media pianificata ≈ ${avgK} kcal al giorno su ${BSP.targets().kcal} di obiettivo. Non è una valutazione clinica.</p></div></div><div class="qualityTrack"><div style="width:${score*20}%"></div></div><ul class="qualityChecks">${checks.map(([t,ok])=>`<li>${ok?'✓':'○'} ${esc(t)}</li>`).join('')}</ul>`}
function shiftWeek(n){start.setDate(start.getDate()+7*n);const d=new Date(start);selected=iso(d);renderCal()}
document.getElementById('calGenerate').onclick=()=>generate(false);
document.getElementById('calDay').onclick=()=>generate(true);
document.getElementById('calPrev').onclick=()=>shiftWeek(-1);
document.getElementById('calNext').onclick=()=>shiftWeek(1);
document.getElementById('calView').onchange=renderCal;
document.getElementById('calMissing').onclick=()=>{const list=gatherMissing();if(!list.length)return alert('Non risultano ingredienti mancanti.');for(const x of list){const existing=data.shop.find(y=>y.name.toLowerCase()===x.name&&!y.done);if(!existing)data.shop.push({name:x.name,qty:Math.ceil(x.qty)+' '+x.unit,price:data.prices?.[x.name]??'',done:false})}persist();alert('Ingredienti mancanti aggiunti alla spesa (olio e basi di dispensa esclusi). Verifica quantità e scorte.')};
['bsp:approved','bsp:cycle','bsp:diet','bsp:daily','bsp:bonanza'].forEach(ev=>window.addEventListener(ev,renderCal));
window.BSPplan={get:()=>plan,save:store,getWeek:weekDates,eligible:eligibility,approved,setEaten};renderCal();
})();

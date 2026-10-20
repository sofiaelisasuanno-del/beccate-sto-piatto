/* LAPAPPA · calendario locale, senza API */
(function(){
const meals=['Colazione','Pranzo','Spuntino','Cena'];
const templates=window.BSP_RECIPE_CATALOG||[];
if(templates.length<1312)console.warn('Catalogo stagionale incompleto:',templates.length);
const style=document.createElement('style');style.textContent=`.weekbar{display:flex;gap:6px;overflow-x:auto;padding:6px 0 12px}.daytab{flex:1;min-width:65px;border:1px solid #d6e4d9;background:#f2f7f3;border-radius:12px;padding:10px 5px;font-weight:700;color:#193d29}.daytab.on{background:#1d6842;color:white}.mealcard{border:1px solid #d9e4db;border-radius:13px;margin:9px 0;overflow:hidden;background:#fff}.mealcard summary{cursor:pointer;list-style:none;padding:13px;display:flex;justify-content:space-between;gap:8px}.mealcard summary::-webkit-details-marker{display:none}.mealbody{padding:0 13px 13px;font-size:14px}.mealbody ul{list-style:disc;padding-left:20px}.mealbody li{display:list-item;border:0;padding:2px 0}.missing{color:#8a4d22;font-size:12px}.calendar-actions{display:flex;flex-wrap:wrap;gap:7px}.calendar-actions button{margin:3px 0}.minicap{font-size:12px;color:#5a695e}.inline-note{background:#eef5ef;padding:10px;border-radius:10px;font-size:13px}.cal-head{display:flex;justify-content:space-between;align-items:center;gap:8px}.cal-head select{width:auto}.scoreRow{display:flex;gap:18px;align-items:center}.scoreBig{font-size:46px;color:#1d6842;white-space:nowrap}.scoreBig small{font-size:18px}.qualityTrack{height:10px;background:#e7ede8;border-radius:10px;overflow:hidden;margin:14px 0}.qualityTrack>div{height:100%;background:#1d6842}.qualityChecks li{font-size:13px}`;document.head.appendChild(style);
const section=document.getElementById('ricette');
const block=document.createElement('div');
block.innerHTML=`<div class="card"><div class="cal-head"><h3>📅 Il tuo calendario pasti</h3><select id="calView"><option value="week">Settimana</option><option value="day">Giorno</option></select></div><p class="muted">Genera solo i pasti ancora possibili. Approva un piatto per renderlo definitivo.</p><div class="weekbar" id="calDays"></div><div class="calendar-actions"><button class="action" id="calGenerate">Genera la settimana</button><button class="action secondary" id="calDay">Rigenera il giorno</button><button class="action secondary" id="calMissing">Aggiungi mancanti alla spesa</button></div><p class="minicap" id="calStatus" role="status"></p><div id="calMeals"></div></div><div class="card" id="nutritionSummary"><h3>🌿 Qualità nutrizionale della settimana</h3><div id="nutritionBody"></div></div>`;
section.appendChild(block);

const extra=document.createElement('div');extra.className='card';extra.innerHTML=`<h3>🍕 Un pasto fuori programma?</h3><p class="muted">Nessun giudizio, Arun. Anche questo fa parte della tua alimentazione.</p><button type="button" class="action secondary" id="extraToggle">+ Registra un pasto fuori programma</button><div id="extraForm" hidden><label>Data del pasto</label><input type="date" id="extraDate"><label>Orario</label><input type="time" id="extraTime"><label>Tipo di pasto</label><select id="extraSlot"><option>Colazione</option><option>Pranzo</option><option>Spuntino</option><option>Cena</option><option>Altro</option></select><label>Che cosa hai mangiato?</label><input id="extraTitle" placeholder="Es. pizza vegana con verdure"><label>Categoria alimentare (anche più di una)</label><select multiple size="7" id="extraCategories"><option>Verdure e frutta</option><option>Legumi e derivati</option><option>Cereali e tuberi</option><option>Frutta secca e semi</option><option>Dolce</option><option>Snack salato</option><option>Fritto</option><option>Bevanda</option><option>Altro</option></select><label>Ingredienti / note (facoltativi)</label><textarea id="extraNotes" placeholder="Puoi annotare ingredienti e quantità se le conosci"></textarea><button type="button" class="action" id="extraSave">Salva nello Storico della bonanza</button></div>`;
section.appendChild(extra);
const ed=document.getElementById('extraDate'),et=document.getElementById('extraTime');const now=new Date();ed.value=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');et.value=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
document.getElementById('extraToggle').onclick=()=>{const p=document.getElementById('extraForm');p.hidden=!p.hidden};
document.getElementById('extraSave').onclick=()=>{
 const title=document.getElementById('extraTitle').value.trim(),date=ed.value,time=et.value;
 if(!title||!date||!time)return alert('Inserisci alimento, data e ora.');
 const when=new Date(date+'T'+time);if(when>new Date())return alert('Puoi registrare solo pasti già consumati.');
 const selectedTypes=Array.from(document.getElementById('extraCategories').selectedOptions).map(x=>x.value);
 if(!selectedTypes.length)return alert('Seleziona almeno una categoria alimentare.');
 const entries=records();entries.push({id:'x'+Date.now().toString(36)+Math.random().toString(36).slice(2),date,slot:document.getElementById('extraSlot').value,title,notes:document.getElementById('extraNotes').value.trim(),category:selectedTypes.join(', '),outOfPlan:true,approved:false,hasPhoto:false,eatenAt:when.toISOString(),photoTime:null,ingredients:[],steps:''});
 localStorage.setItem(bkey,JSON.stringify(entries));window.dispatchEvent(new CustomEvent('bsp:extra',{detail:{date}}));window.BSPwellbeing?.render?.();document.getElementById('extraTitle').value='';document.getElementById('extraNotes').value='';document.getElementById('extraForm').hidden=true;alert('Pasto salvato nello Storico della bonanza. Puoi aggiungere una foto.');
};

const pfx='bsp-planner-v2',bkey='bsp-bonanza-v1';
let plan={};try{plan=JSON.parse(localStorage.getItem(pfx)||'{}');if(!plan||typeof plan!=='object'||Array.isArray(plan))plan={}}catch(e){plan={}}
const cutoff=[10*60+30,14*60,17*60+30,22*60];
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>iso(new Date());
function weekMonday(d){const x=new Date(d);x.setHours(12,0,0,0);x.setDate(x.getDate()-(x.getDay()+6)%7);return x}
let start=weekMonday(new Date()),selected=today();
function dateOffset(i){const d=new Date(start);d.setDate(d.getDate()+i);return iso(d)}
function weekDates(){return Array.from({length:7},(_,i)=>dateOffset(i))}
function eligibility(date,slot){const now=new Date();let current=today();if(date<current)return false;if(date>current)return true;return now.getHours()*60+now.getMinutes()<=cutoff[slot]}
function records(){try{const v=JSON.parse(localStorage.getItem(bkey)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
function approved(date,slot){return records().find(e=>e.date===date&&e.slot===meals[slot]&&e.approved===true)}
function latest(){return [...(data.logs||[])].sort((a,b)=>(b.date+' '+b.time).localeCompare(a.date+' '+a.time))[0]||null}
function available(){let v={};for(const f of(data.foods||[])){let k=String(f.name||'').trim().toLowerCase();if(!k)continue;let key=k+'|'+(f.unit||'g');v[key]=(v[key]||0)+Math.max(0,Number(f.qty)||0)}return v}
function missingFor(recipe,inventory){return (recipe.ingredients||[]).filter(x=>((inventory[String(x.name).toLowerCase()+'|'+x.unit]||0)<Number(x.qty||0)))}
function choose(slot,seed,used,prevTitle,date){
 const activeSeason=window.BSPseason?.season?.(new Date(date+'T12:00'))||'autunno';const options=templates.filter(t=>t.slot===slot&&t.season===activeSeason);if(!options.length)throw Error('Archivio ricette non caricato.');
 const log=latest(),highBloat=log&&Number(log.bloat)>=7,lowEnergy=log&&Number(log.energy)<=4;
 const period=window.BSPcycle?.status?.(date)||{};
 const history=Object.entries(plan).flatMap(([d,rs])=>(rs||[]).filter(r=>r.slot===meals[slot]&&d!==date).map(r=>r.title));
 const approvedTitles=records().filter(r=>r.approved).map(r=>r.title);
 const recent=new Set([...history,...approvedTitles]);
 const prefs=String(data.diet?.prefs||'').toLowerCase();
 const disallowed=prefs.includes('no tempeh')?['tempeh']:[];
 const ranked=options.map((t,i)=>{
 let score=t.ingredients.reduce((a,x)=>a+((used[x.name.toLowerCase()+'|'+x.unit]||0)>=x.qty?1.8:0),0);
 if(highBloat&&t.tags.includes('delicato'))score+=3;
 if(highBloat&&t.ingredients.some(x=>/ceci|fagioli|edamame/.test(x.name)))score-=2;
 if(lowEnergy&&t.tags.includes('facile'))score+=2;
 if(period.bleeding&&t.tags.some(x=>x.includes('ferro')))score+=2; if(period.bleeding&&t.tags.includes('vitamina C'))score+=1.5; if(window.BSPseason?.has?.(t.produce,new Date(date+'T12:00')))score+=2.5; else score-=1;
 if(recent.has(t.title))score-=35; if(history.slice(-14).some(x=>x.split(' · ')[0]===t.title.split(' · ')[0]))score-=15;
 if(t.title===prevTitle)score-=70;
 if(t.id.startsWith('market-'))score+=3;
 if(t.ingredients.some(x=>/zucchin/i.test(x.name)))score-=13;
 if(t.ingredients.some(x=>/tempeh/i.test(x.name)))score-=40;
 if(t.ingredients.some(x=>/miso|funghi|shiitake|tofu|seitan|cicoria|zucca|avocado|cetrioli|riso|wasa|cocco/i.test(x.name)))score+=2;
 if(t.ingredients.some(x=>/yogurt di soia/i.test(x.name)))score-=9;
 if(disallowed.some(x=>t.ingredients.some(y=>y.name.includes(x))))score-=100;
 // rotazione deterministica in assenza di storico; casualità solo per desempate
 score+=((seed+i*17)%53)/53;
 return {t,score};
 }).sort((a,b)=>b.score-a.score);
 return JSON.parse(JSON.stringify(ranked[0].t));
}
function validatePlan(){for(const [date,list]of Object.entries(plan)){if(!Array.isArray(list)){delete plan[date];continue}plan[date]=list.filter(r=>r&&meals.includes(r.slot)).map(r=>({...r,ingredients:(r.ingredients||[]).map(x=>Array.isArray(x)?{name:x[0],qty:x[1],unit:x[2]}:x)}));}}
validatePlan();
function store(){localStorage.setItem(pfx,JSON.stringify(plan));renderCal();window.BSPwellbeing?.render?.()}
function generate(dayOnly){const used=available(),dates=dayOnly?[selected]:weekDates();let changed=0,locked=0;
for(let date of dates){if(!plan[date])plan[date]=[];for(let slot=0;slot<4;slot++){
const ix=plan[date].findIndex(r=>r.slot===meals[slot]);if(approved(date,slot)){locked++;continue}if(!eligibility(date,slot)){locked++;if(ix!==-1)plan[date].splice(ix,1);continue}
const old=ix>=0?plan[date][ix]:null;const r=choose(slot,Number(date.replaceAll('-',''))+slot+Math.floor(Math.random()*100),used,old?.title,date);r.slot=meals[slot];r.source='Generatore locale';if(ix>=0)plan[date][ix]=r;else plan[date].push(r);changed++;
for(const x of r.ingredients){let k=x.name.toLowerCase()+'|'+x.unit;used[k]=Math.max(0,(used[k]||0)-Number(x.qty||0))}
}plan[date].sort((a,b)=>meals.indexOf(a.slot)-meals.indexOf(b.slot))}
store();setStatus(changed?`${changed} pasti generati o aggiornati. ${locked} pasti protetti o fuori orario.`:'Nessun pasto modificabile: approvato oppure oltre l’orario consentito.');}
function setStatus(s){document.getElementById('calStatus').textContent=s}
function approve(date,slot){if(!eligibility(date,slot))return alert('Il termine per approvare questo pasto è trascorso.');if(approved(date,slot))return alert('Questo piatto è già approvato.');const r=(plan[date]||[]).find(x=>x.slot===meals[slot]);if(!r)return;
if(!confirm(`Approvare definitivamente «${r.title}» per ${meals[slot].toLowerCase()} del ${date}? Non potrai più rigenerarlo.`))return;
const list=records();if(list.some(x=>x.date===date&&x.slot===meals[slot]&&x.approved))return;
list.push({id:'b'+Date.now().toString(36)+Math.random().toString(36).slice(2),date,slot:meals[slot],title:r.title,notes:'',hasPhoto:false,approved:true,approvedAt:new Date().toISOString(),takenAt:null,ingredients:r.ingredients,steps:r.steps});localStorage.setItem(bkey,JSON.stringify(list));store();window.dispatchEvent(new Event('bsp:approved'));setStatus('Piatto approvato! Ora puoi aggiungere la fotografia nello Storico della bonanza.');}
function gatherMissing(){const stock=available(),needs={};for(const date of weekDates()){for(const recipe of plan[date]||[]){if(!eligibility(date,meals.indexOf(recipe.slot))&&!approved(date,meals.indexOf(recipe.slot)))continue;for(const x of recipe.ingredients||[]){const k=x.name.toLowerCase()+'|'+x.unit;needs[k]=(needs[k]||0)+Number(x.qty||0)}}}return Object.entries(needs).map(([k,qty])=>{const [name,unit]=k.split('|');return{name,unit,qty:Math.max(0,qty-(stock[k]||0))}}).filter(x=>x.qty>0)}
function renderCal(){const days=weekDates();document.getElementById('calDays').innerHTML=days.map(date=>{const i=new Date(date+'T12:00').getDay();return `<button class="daytab ${date===selected?'on':''}" data-date="${date}">${['Dom','Lun','Mar','Mer','Gio','Ven','Sab'][i]}<br><small style="color:inherit">${date.slice(-2)}</small></button>`}).join('');document.querySelectorAll('.daytab').forEach(b=>b.onclick=()=>{selected=b.dataset.date;renderCal()});const dates=document.getElementById('calView').value==='day'?[selected]:days,inv=available();let html='';
for(const date of dates){const availableSlots=meals.map((_,i)=>i).filter(i=>eligibility(date,i)||approved(date,i));if(!availableSlots.length){html+=`<p class="muted">${esc(date)} · Nessun pasto ancora generabile.</p>`;continue}
html+=`<h3 style="margin-top:18px">${new Date(date+'T12:00').toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'})}</h3>`;
for(let slot of availableSlots){const lock=approved(date,slot);const r=lock||((plan[date]||[]).find(x=>x.slot===meals[slot]));if(!r){html+=`<p class="minicap">${meals[slot]} · Da generare</p>`;continue}const miss=missingFor(r,inv);
html+=`<div class="mealcard"><details><summary><span><small>${esc(meals[slot])} ${lock?'· ✓ Approvato':''}</small><br><b>${esc(r.title)}</b></span><span>⌄</span></summary><div class="mealbody"><b>Ingredienti</b><ul>${(r.ingredients||[]).map(x=>`<li>${esc(x.name)} — ${esc(x.qty)} ${esc(x.unit)}</li>`).join('')}</ul><b>Preparazione</b><p>${esc(r.steps||'')}</p>${r.sauceTip?`<div class="sauce-note"><b>Occhio ai condimenti, Arun:</b> ${esc(r.sauceTip)}</div>`:''}${miss.length?`<p class="missing">Da verificare nel frigo: ${miss.map(x=>esc(x.name)).join(', ')}</p>`:''}<p class="minicap">${esc(r.season||'')} · ${esc((r.tags||[]).join(' · '))}<br>Indicazioni nutrizionali non verificate.</p></div></details><div style="padding:0 12px 10px">${lock?'<span class="pill">✓ Definitivo · Foto nello Storico della bonanza</span>':`<button class="action" style="margin:3px 0" data-approve-date="${date}" data-approve-slot="${slot}">✓ Approva piatto</button>`}</div></div>`;
}}
document.getElementById('calMeals').innerHTML=html;document.querySelectorAll('[data-approve-date]').forEach(b=>b.onclick=()=>approve(b.dataset.approveDate,Number(b.dataset.approveSlot)));
renderNutrition();const log=latest();if(!document.getElementById('calStatus').textContent) setStatus(log?`Ultimo diario: energia ${log.energy}/10, gonfiore ${log.bloat}/10, stress ${log.stress}/10.`:`${templates.length} combinazioni stagionali · frigo, sintomi, ciclo e preferenze. Daje tutta, Arun!`);}
function renderNutrition(){const days=weekDates(),rs=days.flatMap(d=>(plan[d]||[]).filter(r=>eligibility(d,meals.indexOf(r.slot))||approved(d,meals.indexOf(r.slot))));const el=document.getElementById('nutritionBody');if(!rs.length){el.innerHTML='<p class="muted">Genera un piano per vedere l’indicatore orientativo.</p>';return}
const names=rs.flatMap(r=>(r.ingredients||[]).map(x=>String(x.name||'').toLowerCase()));const has=re=>names.some(x=>re.test(x));const relevantSlots=days.flatMap(d=>meals.map((_,i)=>({d,i})).filter(x=>eligibility(x.d,x.i)||approved(x.d,x.i)));const checks=[['Verdure',has(/zucchin|carot|spinac|verd|zucca|brocc|pomodor|insalat|bietol|cavol/)],['Proteine vegetali',has(/tofu|seitan|ceci|lenticch|fagiol|edamame|soia|pisell/)],['Cereali e tuberi',has(/riso|pasta|pane|avena|patat|cous|farro|quinoa/)],['Varietà',new Set(names).size>=8],['Pasti pianificati',relevantSlots.length>0&&relevantSlots.every(({d,i})=>(plan[d]||[]).some(x=>x.slot===meals[i])||approved(d,i))]];let score=checks.filter(x=>x[1]).length;el.innerHTML=`<div class="scoreRow"><strong class="scoreBig">${score}<small>/5</small></strong><div><b>Indicatore orientativo del piano</b><p class="minicap">Non è una misura clinica né una verifica di calorie, macronutrienti o adeguatezza della dieta.</p></div></div><div class="qualityTrack"><div style="width:${score*20}%"></div></div><ul class="qualityChecks">${checks.map(([t,ok])=>`<li>${ok?'✓':'○'} ${esc(t)}</li>`).join('')}</ul>`}
document.getElementById('calGenerate').onclick=()=>generate(false);
document.getElementById('calDay').onclick=()=>generate(true);
document.getElementById('calView').onchange=renderCal;
document.getElementById('calMissing').onclick=()=>{const list=gatherMissing();if(!list.length)return alert('Non risultano ingredienti mancanti.');for(const x of list){const existing=data.shop.find(y=>y.name.toLowerCase()===x.name&&!y.done);if(!existing)data.shop.push({name:x.name,qty:Math.ceil(x.qty)+' '+x.unit,done:false})}persist();alert('Ingredienti mancanti aggiunti alla spesa. Verifica quantità e scorte.')};
window.addEventListener('bsp:approved',renderCal);window.addEventListener('bsp:cycle',renderCal);
window.BSPplan={get:()=>plan,save:store,getWeek:weekDates,eligible:eligibility,approved};renderCal();
})();

/* Beccate sto' piatto · calendario locale, senza API */
(function(){
const meals=['Colazione','Pranzo','Spuntino','Cena'];
const templates=[
 {slot:0,title:'Toast salato con tofu',ingredients:[['pane integrale',80,'g'],['tofu',150,'g'],['zucchine',150,'g']],steps:'Cuoci le zucchine; sbriciola e scalda il tofu con spezie. Servi sul pane tostato.',tags:['facile','proteico']},
 {slot:0,title:'Toast con crema di ceci',ingredients:[['pane integrale',90,'g'],['ceci',90,'g'],['carote',100,'g']],steps:'Frulla i ceci ben sciacquati con acqua e olio già disponibile. Servi con carote cotte.',tags:['facile']},
 {slot:0,title:'Pane e tofu alla paprika',ingredients:[['pane integrale',80,'g'],['tofu',160,'g'],['spinaci',120,'g']],steps:'Rosola il tofu alla paprika e scalda gli spinaci. Accompagna con pane.',tags:['proteico']},
 {slot:1,title:'Bowl di riso, tofu e zucchine',ingredients:[['riso',90,'g'],['tofu',180,'g'],['zucchine',250,'g'],['carote',100,'g']],steps:'Cuoci il riso; salta le verdure ben cotte e il tofu, poi componi una bowl abbondante.',tags:['proteico','delicato']},
 {slot:1,title:'Pasta al ragù di lenticchie decorticate',ingredients:[['pasta',100,'g'],['lenticchie rosse',75,'g'],['passata',130,'g'],['carote',120,'g']],steps:'Cuoci le lenticchie decorticate in passata diluita; condisci la pasta e servi con carote cotte.',tags:['voluminoso']},
 {slot:1,title:'Patate, tofu e spinaci',ingredients:[['patate',350,'g'],['tofu',200,'g'],['spinaci',240,'g']],steps:'Cuoci patate e spinaci; rosola il tofu. Combina con erbe e un filo di olio.',tags:['delicato','proteico']},
 {slot:1,title:'Cous cous con ceci e verdure',ingredients:[['cous cous',95,'g'],['ceci',100,'g'],['zucchine',220,'g'],['carote',120,'g']],steps:'Reidrata il cous cous; sciacqua bene i ceci e servi con verdure cotte.',tags:['voluminoso']},
 {slot:2,title:'Banana e arachidi',ingredients:[['banana',1,'pz'],['arachidi',20,'g']],steps:'Sbuccia la banana e accompagna con arachidi naturali.',tags:['facile']},
 {slot:2,title:'Latte di soia e avena',ingredients:[['latte di soia',250,'ml'],['avena',35,'g']],steps:'Versa la bevanda di soia sull’avena. Puoi scaldarla se preferisci.',tags:['facile']},
 {slot:2,title:'Pane e burro di arachidi',ingredients:[['pane integrale',50,'g'],['burro di arachidi',20,'g']],steps:'Spalma il burro di arachidi sul pane.',tags:['facile']},
 {slot:3,title:'Vellutata e tofu caldo',ingredients:[['carote',250,'g'],['zucchine',200,'g'],['tofu',180,'g'],['pane integrale',60,'g']],steps:'Cuoci le verdure, frulla con poca acqua, aggiungi tofu scaldato e pane.',tags:['delicato','proteico']},
 {slot:3,title:'Minestra di riso, verdure e tofu',ingredients:[['riso',55,'g'],['carote',200,'g'],['spinaci',180,'g'],['tofu',160,'g']],steps:'Cuoci il riso in brodo leggero; aggiungi verdure ben cotte e tofu a cubetti.',tags:['delicato']},
 {slot:3,title:'Verdure al forno con seitan',ingredients:[['patate',200,'g'],['zucchine',250,'g'],['seitan',150,'g']],steps:'Arrostisci le verdure e scalda il seitan. Condisci a piacere.',tags:['proteico']}
];
// Normalizza gli ingredienti dei modelli in oggetti prima del calcolo.
for (const recipe of templates) {
  recipe.ingredients = recipe.ingredients.map(([name, qty, unit]) => ({name, qty, unit}));
}
const style=document.createElement('style');style.textContent=`.weekbar{display:flex;gap:6px;overflow-x:auto;padding:6px 0 12px}.daytab{flex:1;min-width:65px;border:1px solid #d6e4d9;background:#f2f7f3;border-radius:12px;padding:10px 5px;font-weight:700;color:#193d29}.daytab.on{background:#1d6842;color:white}.mealcard{border:1px solid #d9e4db;border-radius:13px;margin:9px 0;overflow:hidden;background:#fff}.mealcard summary{cursor:pointer;list-style:none;padding:13px;display:flex;justify-content:space-between;gap:8px}.mealcard summary::-webkit-details-marker{display:none}.mealbody{padding:0 13px 13px;font-size:14px}.mealbody ul{list-style:disc;padding-left:20px}.mealbody li{display:list-item;border:0;padding:2px 0}.missing{color:#8a4d22;font-size:12px}.calendar-actions{display:flex;flex-wrap:wrap;gap:7px}.calendar-actions button{margin:3px 0}.minicap{font-size:12px;color:#5a695e}.inline-note{background:#eef5ef;padding:10px;border-radius:10px;font-size:13px}.cal-head{display:flex;justify-content:space-between;align-items:center;gap:8px}.cal-head select{width:auto}.scoreRow{display:flex;gap:18px;align-items:center}.scoreBig{font-size:46px;color:#1d6842;white-space:nowrap}.scoreBig small{font-size:18px}.qualityTrack{height:10px;background:#e7ede8;border-radius:10px;overflow:hidden;margin:14px 0}.qualityTrack>div{height:100%;background:#1d6842}.qualityChecks li{font-size:13px}`;document.head.appendChild(style);
const section=document.getElementById('ricette');
const block=document.createElement('div');
block.innerHTML=`<div class="card"><div class="cal-head"><h3>📅 Il tuo calendario pasti</h3><select id="calView"><option value="week">Settimana</option><option value="day">Giorno</option></select></div><p class="muted">Genera solo i pasti ancora possibili. Approva un piatto per renderlo definitivo.</p><div class="weekbar" id="calDays"></div><div class="calendar-actions"><button class="action" id="calGenerate">Genera la settimana</button><button class="action secondary" id="calDay">Rigenera il giorno</button><button class="action secondary" id="calMissing">Aggiungi mancanti alla spesa</button></div><p class="minicap" id="calStatus" role="status"></p><div id="calMeals"></div></div><div class="card" id="nutritionSummary"><h3>🌿 Qualità nutrizionale della settimana</h3><div id="nutritionBody"></div></div>`;
section.appendChild(block);
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
function choose(slot,seed,used,prevTitle){const options=templates.filter(t=>t.slot===slot);const log=latest(),highBloat=log&&Number(log.bloat)>=7,lowEnergy=log&&Number(log.energy)<=4;
let ranked=options.map((t,i)=>{let s=t.ingredients.reduce((a,x)=>a+((used[x.name.toLowerCase()+'|'+x.unit]||0)>=x.qty?3:0),0);if(highBloat&&t.tags.includes('delicato'))s+=4;if(lowEnergy&&t.tags.includes('facile'))s+=3;return{t,score:s+((seed+i)%options.length)*.2}}).sort((a,b)=>b.score-a.score).map(x=>x.t);
if(prevTitle&&ranked.length>1){ranked=ranked.filter(r=>r.title!==prevTitle).concat(ranked.filter(r=>r.title===prevTitle))}
return JSON.parse(JSON.stringify(ranked[0]));}
function validatePlan(){for(const [date,list]of Object.entries(plan)){if(!Array.isArray(list)){delete plan[date];continue}plan[date]=list.filter(r=>r&&meals.includes(r.slot)).map(r=>({...r,ingredients:(r.ingredients||[]).map(x=>Array.isArray(x)?{name:x[0],qty:x[1],unit:x[2]}:x)}));}}
validatePlan();
function store(){localStorage.setItem(pfx,JSON.stringify(plan));renderCal();window.BSPwellbeing?.render?.()}
function generate(dayOnly){const used=available(),dates=dayOnly?[selected]:weekDates();let changed=0,locked=0;
for(let date of dates){if(!plan[date])plan[date]=[];for(let slot=0;slot<4;slot++){
const ix=plan[date].findIndex(r=>r.slot===meals[slot]);if(approved(date,slot)){locked++;continue}if(!eligibility(date,slot)){locked++;if(ix!==-1)plan[date].splice(ix,1);continue}
const old=ix>=0?plan[date][ix]:null;const r=choose(slot,Number(date.replaceAll('-',''))+slot+Math.floor(Math.random()*100),used,old?.title);r.slot=meals[slot];r.source='Generatore locale';if(ix>=0)plan[date][ix]=r;else plan[date].push(r);changed++;
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
html+=`<div class="mealcard"><details><summary><span><small>${esc(meals[slot])} ${lock?'· ✓ Approvato':''}</small><br><b>${esc(r.title)}</b></span><span>⌄</span></summary><div class="mealbody"><b>Ingredienti</b><ul>${(r.ingredients||[]).map(x=>`<li>${esc(x.name)} — ${esc(x.qty)} ${esc(x.unit)}</li>`).join('')}</ul><b>Preparazione</b><p>${esc(r.steps||'')}</p>${miss.length?`<p class="missing">Da verificare nel frigo: ${miss.map(x=>esc(x.name)).join(', ')}</p>`:''}<p class="minicap">Ricetta indicativa, macro non verificati.</p></div></details><div style="padding:0 12px 10px">${lock?'<span class="pill">✓ Definitivo · Foto nello Storico della bonanza</span>':`<button class="action" style="margin:3px 0" data-approve-date="${date}" data-approve-slot="${slot}">✓ Approva piatto</button>`}</div></div>`;
}}
document.getElementById('calMeals').innerHTML=html;document.querySelectorAll('[data-approve-date]').forEach(b=>b.onclick=()=>approve(b.dataset.approveDate,Number(b.dataset.approveSlot)));
renderNutrition();const log=latest();if(!document.getElementById('calStatus').textContent) setStatus(log?`Ultimo diario: energia ${log.energy}/10, gonfiore ${log.bloat}/10, stress ${log.stress}/10.`:'Piano basato sul frigo e sulle preferenze.');}
function renderNutrition(){const days=weekDates(),rs=days.flatMap(d=>(plan[d]||[]).filter(r=>eligibility(d,meals.indexOf(r.slot))||approved(d,meals.indexOf(r.slot))));const el=document.getElementById('nutritionBody');if(!rs.length){el.innerHTML='<p class="muted">Genera un piano per vedere l’indicatore orientativo.</p>';return}
const names=rs.flatMap(r=>(r.ingredients||[]).map(x=>String(x.name||'').toLowerCase()));const has=re=>names.some(x=>re.test(x));const relevantSlots=days.flatMap(d=>meals.map((_,i)=>({d,i})).filter(x=>eligibility(x.d,x.i)||approved(x.d,x.i)));const checks=[['Verdure',has(/zucchin|carot|spinac|verd|zucca|brocc|pomodor|insalat|bietol|cavol/)],['Proteine vegetali',has(/tofu|seitan|ceci|lenticch|fagiol|edamame|soia|pisell/)],['Cereali e tuberi',has(/riso|pasta|pane|avena|patat|cous|farro|quinoa/)],['Varietà',new Set(names).size>=8],['Pasti pianificati',relevantSlots.length>0&&relevantSlots.every(({d,i})=>(plan[d]||[]).some(x=>x.slot===meals[i])||approved(d,i))]];let score=checks.filter(x=>x[1]).length;el.innerHTML=`<div class="scoreRow"><strong class="scoreBig">${score}<small>/5</small></strong><div><b>Indicatore orientativo del piano</b><p class="minicap">Non è una misura clinica né una verifica di calorie, macronutrienti o adeguatezza della dieta.</p></div></div><div class="qualityTrack"><div style="width:${score*20}%"></div></div><ul class="qualityChecks">${checks.map(([t,ok])=>`<li>${ok?'✓':'○'} ${esc(t)}</li>`).join('')}</ul>`}
document.getElementById('calGenerate').onclick=()=>generate(false);
document.getElementById('calDay').onclick=()=>generate(true);
document.getElementById('calView').onchange=renderCal;
document.getElementById('calMissing').onclick=()=>{const list=gatherMissing();if(!list.length)return alert('Non risultano ingredienti mancanti.');for(const x of list){const existing=data.shop.find(y=>y.name.toLowerCase()===x.name&&!y.done);if(!existing)data.shop.push({name:x.name,qty:Math.ceil(x.qty)+' '+x.unit,done:false})}persist();alert('Ingredienti mancanti aggiunti alla spesa. Verifica quantità e scorte.')};
window.addEventListener('bsp:approved',renderCal);
window.BSPplan={get:()=>plan,save:store,getWeek:weekDates,eligible:eligibility,approved};renderCal();
})();

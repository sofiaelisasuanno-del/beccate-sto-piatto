/* LAPAPPA v2.0 · nucleo dell'app: dati, navigazione, dispensa, dieta, diario, spesa. Tutto resta nel browser. */
const sections=[['home','🌕 Oggi'],['frigo','🐈‍⬛ Frigo'],['ricette','🔮 Pappa buona'],['bonanza','🐦‍⬛ Bonanza'],['ciclo','🌙 Ciclo'],['dieta','🪶 Dieta'],['panoramica','☽◯☾ Panoramica'],['diario','🕯️ Oggi mi sento'],['spesa','🍵 Spesa'],['grimorio','📜 Grimorio']];
const defaults={foods:[],recipes:[],labs:[],logs:[],shop:[],prices:{},diet:{type:'Vegana',goal:'Ricomposizione corporea',budget:40,meals:3,kcal:1800,protKg:1.8,prefs:'Colazioni salate; pranzi abbondanti e voluminosi; cene con verdure cotte; gonfiore serale e sensibilità ai legumi; no tempeh; glutine tollerato.'}};
let data;
try{const saved=JSON.parse(localStorage.getItem('bsp-v1')||'{}');data=Object.assign(structuredClone(defaults),saved);data.diet=Object.assign(structuredClone(defaults.diet),saved.diet||{});if(!data.prices||typeof data.prices!=='object')data.prices={}}catch(e){data=structuredClone(defaults)}
/* Migrazione v2: 3 pasti al giorno come richiesto (una volta sola, poi decide la pagina Dieta). */
if(!data.migr2){if(Number(data.diet.meals)===4)data.diet.meals=3;if(!data.diet.kcal)data.diet.kcal=1800;if(!data.diet.protKg)data.diet.protKg=1.8;data.migr2=true;try{localStorage.setItem('bsp-v1',JSON.stringify(data))}catch(e){}}
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isoDay=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const euro=n=>(Number(n)||0).toLocaleString('it-IT',{style:'currency',currency:'EUR'});
function persist(){localStorage.setItem('bsp-v1',JSON.stringify(data));render();window.BSPwellbeing?.render?.();window.dispatchEvent(new Event('bsp:data'))}
function go(id){if(id==='salute')id='panoramica';document.querySelectorAll('main>section').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('nav button').forEach(x=>{const on=x.dataset.page===id;x.classList.toggle('active',on);if(on)x.scrollIntoView({block:'nearest',inline:'center'})});if(location.hash.slice(1)!==id)history.replaceState(null,'','#'+id);window.dispatchEvent(new CustomEvent('bsp:page',{detail:id}));window.scrollTo(0,0)}

/* ───── Helper condivisi (usati da calendario, bonanza, panoramica e PDF) ───── */
const ALL_SLOTS=['Colazione','Pranzo','Spuntino','Cena'];
const SLOT_SHARE=[.28,.40,.12,.32];
const BSP={
 slots:ALL_SLOTS,
 activeSlots(meals){const n=Number(meals??data.diet?.meals)||3;return n<=1?[1]:n===2?[1,3]:n===3?[0,1,3]:[0,1,2,3]},
 slotShare(i,meals){const act=BSP.activeSlots(meals);const tot=act.reduce((a,s)=>a+SLOT_SHARE[s],0);return act.includes(i)?SLOT_SHARE[i]/tot:0},
 targets(o={}){const d=data.diet||{},kcal=Number(o.kcal??d.kcal)||1800,w=Number(o.weight??d.weight)||0,pk=Number(o.protKg??d.protKg)||1.8;const prot=Math.round(w?w*pk:kcal*.25/4),fat=Math.round(kcal*.28/9),carb=Math.max(0,Math.round((kcal-prot*4-fat*9)/4));return{kcal,prot,carb,fat,fib:30}},
 read(key,fb){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fb}catch(e){return fb}},
 records(){const v=BSP.read('bsp-bonanza-v1',[]);return Array.isArray(v)?v:[]},
 daily(){const v=BSP.read('bsp-daily-v1',{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{}},
 setDaily(date,patch){const all=BSP.daily();all[date]={...(all[date]||{}),...patch};localStorage.setItem('bsp-daily-v1',JSON.stringify(all));window.dispatchEvent(new CustomEvent('bsp:daily',{detail:{date}}))},
 isEaten(e){if(e.outOfPlan)return true;return e.eaten===undefined?!!e.approved:!!e.eaten},
 nutritionOf(e){if(e.nutrition&&Number.isFinite(Number(e.nutrition.kcal)))return e.nutrition;if(e.manual)return e.manual;if(Array.isArray(e.ingredients)&&e.ingredients.length&&window.BSPnutri)return window.BSPnutri.compute(e.ingredients);return null},
 dayTotals(date){const t={kcal:0,prot:0,carb:0,fat:0,fib:0,iron:0,ca:0,meals:[],unknown:0};for(const e of BSP.records()){if(e.date!==date||!BSP.isEaten(e))continue;const n=BSP.nutritionOf(e);t.meals.push({...e,n});if(!n){t.unknown++;continue}for(const k of['kcal','prot','carb','fat','fib','iron'])t[k]+=Number(n[k])||0;t.ca+=n.ca!==undefined?Number(n.ca)||0:(e.ingredients?.length&&window.BSPnutri?window.BSPnutri.compute(e.ingredients).ca:0)}for(const k of['prot','carb','fat','fib','iron'])t[k]=Math.round(t[k]*10)/10;t.kcal=Math.round(t.kcal);t.ca=Math.round(t.ca);return t},
 /* Benessere: ogni registrazione resta un dato a sé (nessun valore derivato salvato). Indice di una registrazione = media delle sue
    componenti; indice del giorno = media delle registrazioni + il sonno come un'osservazione in più. Min e max mostrano gli sbalzi. */
 EMOTIONS:[['Gioia',.9,'p'],['Fiducia',.6,'p'],['Attesa',.3,'p'],['Sorpresa',.1,'p'],['Paura',-.8,'p'],['Tristezza',-.8,'p'],['Disgusto',-.7,'p'],['Rabbia',-.8,'p'],
  ['Serenità',.8,'m'],['Gratitudine',.9,'m'],['Calma',.7,'m'],['Amore',.9,'m'],['Orgoglio',.7,'m'],['Speranza',.6,'m'],['Entusiasmo',.8,'m'],['Curiosità',.5,'m'],['Sollievo',.6,'m'],
  ['Nostalgia',-.2,'m'],['Noia',-.3,'m'],['Apatia',-.5,'m'],['Malinconia',-.5,'m'],['Delusione',-.6,'m'],['Irritazione',-.5,'m'],['Frustrazione',-.6,'m'],['Solitudine',-.7,'m'],['Colpa',-.6,'m'],['Vergogna',-.7,'m'],['Ansia',-.8,'m'],['Sopraffazione',-.8,'m']],
 emotionScore(list){const map=new Map(BSP.EMOTIONS.map(e=>[e[0],e[1]]));const v=(list||[]).map(e=>map.get(e)).filter(x=>x!==undefined);return v.length?Math.round((5.5+4.5*v.reduce((a,b)=>a+b,0)/v.length)*10)/10:null},
 clockOf(l){if(l.clock)return l.clock;return{Mattina:'09:00',Pranzo:'13:00',Pomeriggio:'16:30',Sera:'21:00'}[l.time]||'12:00'},
 entryIndex(l){const avg=a=>{const v=a.filter(x=>x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x))).map(Number);return v.length?Math.round(v.reduce((x,y)=>x+y,0)/v.length*10)/10:null};
  return{mental:avg([l.mood,Number.isFinite(Number(l.stress))?11-Number(l.stress):null,BSP.emotionScore(l.emotions)]),physical:avg([l.energy,Number.isFinite(Number(l.bloat))?11-Number(l.bloat):null]),mood:l.mood??null,energy:l.energy??null}},
 wellEntries(date){return (data.logs||[]).filter(l=>l.date===date).map(l=>({...l,clock:BSP.clockOf(l),idx:BSP.entryIndex(l)})).sort((a,b)=>a.clock.localeCompare(b.clock))},
 wellIndex(date,time){const es=BSP.wellEntries(date).filter(e=>!time||e.time===time);const sleep=BSP.read('bsp-sleep-v1',{})[date];
  const m=es.map(e=>e.idx.mental).filter(v=>v!==null),f=es.map(e=>e.idx.physical).filter(v=>v!==null);
  const sm=sleep&&!time?Number(sleep.quality)*2:null,sf=sleep&&!time?Math.min(10,Number(sleep.hours)/8*10):null;
  const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:null;
  return{mental:avg(sm!==null?[...m,sm]:m),physical:avg(sf!==null?[...f,sf]:f),mMin:m.length?Math.min(...m):null,mMax:m.length?Math.max(...m):null,fMin:f.length?Math.min(...f):null,fMax:f.length?Math.max(...f):null,n:es.length}}
};
window.BSP=BSP;

/* ───── Menù a tendina con ricerca nel database ingredienti ───── */
BSP.combo=function(input,{onPick,prefer=()=>[]}={}){
 const wrap=document.createElement('div');wrap.className='combo';input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
 const list=document.createElement('ul');list.className='combo-list';list.setAttribute('role','listbox');list.hidden=true;wrap.appendChild(list);
 input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('autocomplete','off');
 let items=[],act=-1;
 function show(){const pantry=new Set(prefer());items=window.BSPnutri.search(input.value,14,[...pantry]);
  if(!items.length){list.innerHTML=input.value.trim()?'<li class="combo-empty">Nessun alimento con questo nome. Prova un sinonimo: “ceci”, “tofu”, “spinaci”…</li>':'<li class="combo-empty">Scrivi una parola chiave per cercare tra '+window.BSPnutri.db.length+' alimenti.</li>';list.hidden=false;return}
  list.innerHTML=items.map((d,i)=>`<li role="option" data-i="${i}" class="${i===act?'on':''}"><span class="combo-main"><b>${esc(d.nome)}</b>${pantry.has(d.id)?' <span class="combo-tag">🧺 in dispensa</span>':''}<small>${esc(d.categoria)}</small></span><small class="combo-kcal">${d.kcal} kcal/100${d.unita==='ml'?' ml':' g'}${d.ricco_di_ferro==='si'?' · <b class="fe">Fe</b>':''}</small></li>`).join('');list.hidden=false}
 function pick(i){const d=items[i];if(!d)return;input.value=d.nome;input.dataset.id=d.id;list.hidden=true;onPick&&onPick(d)}
 input.addEventListener('input',()=>{delete input.dataset.id;act=-1;show()});
 input.addEventListener('focus',show);
 input.addEventListener('keydown',e=>{if(list.hidden)return;if(e.key==='ArrowDown'){act=Math.min(items.length-1,act+1);show();e.preventDefault()}else if(e.key==='ArrowUp'){act=Math.max(0,act-1);show();e.preventDefault()}else if(e.key==='Enter'){if(act<0&&items.length)act=0;pick(act);e.preventDefault()}else if(e.key==='Escape')list.hidden=true});
 list.addEventListener('pointerdown',e=>{const li=e.target.closest('[data-i]');if(li){e.preventDefault();pick(+li.dataset.i)}});
 input.addEventListener('blur',()=>setTimeout(()=>{list.hidden=true},180));
 return{set(d){input.value=d?d.nome:'';if(d)input.dataset.id=d.id;else delete input.dataset.id},get(){return input.dataset.id?window.BSPnutri.find(input.dataset.id):null}};
};
BSP.pantryIds=()=>(data.foods||[]).map(f=>f.id).filter(Boolean);
/* Editor di una lista di ingredienti (pasti generati e fuori programma): ogni riga è collegata al database. */
BSP.ingEditor=function(box,ings,{onChange}={}){
 let rows=(ings||[]).map(x=>({...x}));
 function totals(){const n=window.BSPnutri.compute(rows.filter(r=>r.name));box.querySelector('.ing-tot').innerHTML=`<span class="chip kcal">${n.kcal} kcal</span><span class="chip">P ${n.prot} g</span><span class="chip">C ${n.carb} g</span><span class="chip">G ${n.fat} g</span><span class="chip">F ${n.fib} g</span><span class="chip">Fe ${n.iron} mg</span>`;onChange&&onChange(rows,n)}
 function draw(){box.innerHTML=`<div class="ing-rows">${rows.map((r,i)=>`<div class="ing-row" data-i="${i}"><input class="ing-name" value="${esc(r.name)}" placeholder="Cerca alimento…" aria-label="Ingrediente"><input class="ing-qty" type="number" min="0" step="1" inputmode="decimal" value="${esc(r.qty)}" aria-label="Quantità"><select class="ing-unit" aria-label="Unità"><option${r.unit==='g'?' selected':''}>g</option><option${r.unit==='ml'?' selected':''}>ml</option><option${r.unit==='pz'?' selected':''}>pz</option></select><button type="button" class="jar-btn del" aria-label="Togli ingrediente">×</button></div>`).join('')}</div><button type="button" class="action secondary mini add-ing">+ Aggiungi ingrediente</button><div class="ing-tot macro-chips"></div>`;
  box.querySelectorAll('.ing-row').forEach(el=>{const i=+el.dataset.i,name=el.querySelector('.ing-name');if(rows[i].id)name.dataset.id=rows[i].id;
   BSP.combo(name,{prefer:BSP.pantryIds,onPick:d=>{rows[i]={...rows[i],id:d.id,name:d.nome,unit:rows[i].name?rows[i].unit:d.unita};el.querySelector('.ing-unit').value=rows[i].unit;totals()}});
   el.querySelector('.ing-qty').oninput=e=>{rows[i].qty=Number(e.target.value)||0;totals()};
   el.querySelector('.ing-unit').onchange=e=>{rows[i].unit=e.target.value;totals()};
   el.querySelector('.del').onclick=()=>{rows.splice(i,1);draw()}});
  box.querySelector('.add-ing').onclick=()=>{rows.push({id:'',name:'',qty:100,unit:'g'});draw();box.querySelector('.ing-row:last-child .ing-name').focus()};
  totals()}
 draw();return{get:()=>rows.filter(r=>r.name&&r.id&&Number(r.qty)>0).map(r=>({id:r.id,name:r.name,qty:Number(r.qty),unit:r.unit})),invalid:()=>rows.filter(r=>r.name&&!r.id).length};
};

function init(){
 $('nav').innerHTML=sections.map(([id,t])=>`<button type="button" data-page="${id}" onclick="go('${id}')">${t}</button>`).join('');
 fillDiet();
 const today=isoDay(new Date());$('labDate').value=today;$('logDate').value=today;{const n=new Date();$('logClock').value=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')}renderEmotions();
 const h=location.hash.slice(1);go(h==='salute'?'panoramica':sections.some(x=>x[0]===h)?h:'home');
 render();
 const quotes=['Oggi farai meno schifo di ieri!','Il gatto nero approva questa pappa. Forse.','Le streghe vere fanno la scarpetta.','Daje che pure la zucca oggi è dalla tua parte.','Il calderone è pieno, la strega è carica.','Mangia il tofu e nessuno si farà male.'];$('brandQuote').textContent=quotes[new Date().getDate()%quotes.length];
 if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
function fillDiet(){const d=data.diet;$('dietType').value=d.type;$('dietGoal').value=d.goal;$('dietBudget').value=d.budget;$('dietMeals').value=String(Math.min(4,Math.max(2,Number(d.meals)||3)));$('dietPrefs').value=d.prefs;$('kcalRange').value=d.kcal;$('kcalInput').value=d.kcal;$('kcalOut').textContent=d.kcal;$('protKg').value=d.protKg;['Sex','Age','Weight','Height','Activity'].forEach(k=>{const v=d[k.toLowerCase()];if(v!==undefined&&v!=='')$('est'+k).value=v});estimate();renderTargets()}

/* ───── Dispensa ───── */
let foodCombo,editCombo;
function linkFoods(){let changed=false;for(const f of data.foods){if(f.id)continue;const d=window.BSPnutri?.find(f.name);if(d){f.id=d.id;f.name=d.nome;changed=true}}if(changed)localStorage.setItem('bsp-v1',JSON.stringify(data))}
function addFood(){const d=foodCombo.get();if(!d)return alert('Scegli l’alimento dall’elenco: così il gatto nero conosce calorie e nutrienti 🐈‍⬛');data.foods.push({id:d.id,name:d.nome,qty:$('foodQty').value,unit:$('foodUnit').value,date:$('foodDate').value});foodCombo.set(null);$('foodQty').value='';$('foodDate').value='';$('foodInfo').innerHTML='';persist()}
function foodInfo(d){$('foodInfo').innerHTML=d?`<div class="macro-chips"><span class="chip kcal">${d.kcal} kcal</span><span class="chip">P ${d.proteine} g</span><span class="chip">C ${d.carboidrati} g</span><span class="chip">G ${d.grassi} g</span><span class="chip">F ${d.fibre} g</span><span class="chip">Fe ${d.ferro_mg} mg</span><span class="chip">Ca ${d.calcio_mg} mg</span></div><p class="minicap">Valori per 100 ${d.unita==='ml'?'ml':'g'} · ${esc(d.categoria)}${d.ricco_di_ferro==='si'?' · ricco di ferro':''}${d.peso_pezzo_g?` · 1 pezzo ≈ ${d.peso_pezzo_g} g`:''}</p>`:''}
let editing=-1;
function editFood(i){const f=data.foods[i];if(!f)return;editing=i;editCombo.set(f.id?window.BSPnutri.find(f.id):null);if(!f.id)$('editName').value=f.name;$('editQty').value=f.qty??'';$('editUnit').value=f.unit||'g';$('editDate').value=f.date||'';const dlg=$('foodDialog');if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','')}
function closeEdit(){const dlg=$('foodDialog');dlg.close?dlg.close():dlg.removeAttribute('open');editing=-1}
function daysLeft(date){if(!date)return null;const a=new Date(date+'T12:00'),b=new Date();b.setHours(12,0,0,0);return Math.round((a-b)/864e5)}
function renderPantry(){const items=data.foods.map((x,i)=>({x,i}));const box=$('foodList');if(!items.length){box.innerHTML='<p class="shelf-empty">Scaffali vuoti. Il gatto nero ha mangiato tutto 🐈‍⬛ Aggiungi qualcosa qui sopra.</p>';return}
 let html='';for(let r=0;r<items.length;r+=3){html+='<div class="shelf"><div class="shelf-items">'+items.slice(r,r+3).map(({x,i})=>{const d=daysLeft(x.date);const warn=d!==null&&d<=2;const db=x.id&&window.BSPnutri?.find(x.id);return `<article class="jar${warn?' expiring':''}${x.id?'':' unlinked'}"><b class="jar-name">${esc(x.name)}</b>${x.qty?`<span class="jar-qty">${esc(x.qty)} ${esc(x.unit)}</span>`:''}${db&&db.ricco_di_ferro==='si'?'<span class="jar-fe">Fe</span>':''}${x.id?'':'<small class="jar-date">⚠ da collegare: tocca ✎</small>'}${x.date?`<small class="jar-date">${d<0?'Scaduto!':d===0?'Scade oggi':d===1?'Scade domani':'Scade '+esc(new Date(x.date+'T12:00').toLocaleDateString('it-IT',{day:'numeric',month:'short'}))}</small>`:''}<div class="jar-actions"><button type="button" class="jar-btn" onclick="editFood(${i})" aria-label="Modifica ${esc(x.name)}">✎</button><button type="button" class="jar-btn del" onclick="del('foods',${i})" aria-label="Elimina ${esc(x.name)}">×</button></div></article>`}).join('')+'</div><div class="plank" aria-hidden="true"></div></div>'}
 box.innerHTML=html}

/* ───── Salute/esami, diario, dieta ───── */
function addLab(){const name=$('labName').value.trim(),value=$('labValue').value.trim();if(!name||!value)return alert('Inserisci parametro e valore');data.labs.push({name,value,unit:$('labUnit').value,range:$('labRange').value,date:$('labDate').value});$('labName').value='';$('labValue').value='';persist()}
function momentOf(clock){const h=Number(String(clock).slice(0,2));return h<11.5?'Mattina':h<15?'Pranzo':h<19?'Pomeriggio':'Sera'}
let emoSel=new Set();
function renderEmotions(){$('logEmotions').innerHTML=['p','m'].map(g=>`<div class="emo-group"><small>${g==='p'?'Emozioni primarie':'Sfumature'}</small><div class="emo-chips">${BSP.EMOTIONS.filter(e=>e[2]===g).map(e=>`<button type="button" class="emo ${e[1]>0?'pos':e[1]<0?'neg':'neu'}" aria-pressed="${emoSel.has(e[0])}" data-emo="${esc(e[0])}">${esc(e[0])}</button>`).join('')}</div></div>`).join('');$('logEmotions').querySelectorAll('[data-emo]').forEach(b=>b.onclick=()=>{const e=b.dataset.emo;emoSel.has(e)?emoSel.delete(e):emoSel.add(e);b.setAttribute('aria-pressed',emoSel.has(e))})}
function addLog(){const ids=['logHunger','logEnergy','logBloat','logStress','logMood'];const nums=ids.map(id=>Number($(id).value));if(nums.some(n=>!Number.isInteger(n)||n<1||n>10))return alert('Usa voti interi tra 1 e 10');const clock=$('logClock').value||'12:00';data.logs.push({id:'l'+Date.now().toString(36),date:$('logDate').value,time:momentOf(clock),clock,hunger:nums[0],energy:nums[1],bloat:nums[2],stress:nums[3],mood:nums[4],emotions:[...emoSel],glucose:$('logGlucose').value});emoSel=new Set();renderEmotions();persist();const n=new Date();$('logClock').value=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');alert('Registrato. La sfera di cristallo prende nota 🔮')}
function saveDiet(){Object.assign(data.diet,{type:$('dietType').value,goal:$('dietGoal').value,budget:Number($('dietBudget').value)||0,meals:Number($('dietMeals').value)||3,prefs:$('dietPrefs').value});persist();window.dispatchEvent(new Event('bsp:diet'));alert('Impostazioni salvate 🪶')}
function syncKcal(v){v=Math.round(Number(v)||0);if(!v)return;$('kcalRange').value=v;$('kcalInput').value=v;$('kcalOut').textContent=v;renderTargets(v)}
function renderTargets(kcalOverride){const meals=Number($('dietMeals').value)||data.diet.meals;const w=Number($('estWeight')?.value)||Number(data.diet.weight)||0;const t=BSP.targets({kcal:kcalOverride||Number($('kcalInput').value)||undefined,weight:w,protKg:Number($('protKg').value)||undefined});
 const act=BSP.activeSlots(meals);$('macroTargets').innerHTML=`<div class="macro-row"><span><b>${t.prot} g</b> proteine</span><span><b>${t.carb} g</b> carboidrati</span><span><b>${t.fat} g</b> grassi</span><span><b>${t.fib} g</b> fibre</span></div><p class="muted fine">Divisione tra i pasti: ${act.map(s=>`${ALL_SLOTS[s]} ${Math.round(t.kcal*BSP.slotShare(s,meals))} kcal`).join(' · ')}${w?'':' · Inserisci il peso nella stima per calcolare le proteine sul tuo peso.'}</p>`}
function estimate(){const sex=$('estSex').value,a=Number($('estAge').value),w=Number($('estWeight').value),h=Number($('estHeight').value),act=Number($('estActivity').value);if(!a||!w||!h){$('estResult').textContent='Compila età, peso e altezza per vedere la stima.';return null}const bmr=10*w+6.25*h-5*a+(sex==='M'?5:-161);const tdee=bmr*act;const goal=$('dietGoal').value;const target=Math.round((goal==='Ricomposizione corporea'?tdee*.9:tdee)/50)*50;$('estResult').innerHTML=`Metabolismo a riposo ≈ <b>${Math.round(bmr)} kcal</b> · fabbisogno ≈ <b>${Math.round(tdee)} kcal</b> · ${goal==='Ricomposizione corporea'?'per la ricomposizione (−10%)':'obiettivo'}: <b>${target} kcal</b>`;return target}
function bindDiet(){$('kcalRange').oninput=e=>syncKcal(e.target.value);$('kcalInput').oninput=e=>syncKcal(e.target.value);$('protKg').oninput=()=>renderTargets(Number($('kcalInput').value));['estSex','estAge','estWeight','estHeight','estActivity','dietGoal'].forEach(id=>$(id).addEventListener('input',()=>{estimate();renderTargets(Number($('kcalInput').value))}));$('estApply').onclick=()=>{const t=estimate();if(!t)return alert('Compila i campi della stima.');syncKcal(t)};
 $('kcalSave').onclick=()=>{const v=Number($('kcalInput').value);if(!v||v<1000||v>4500)return alert('Scegli un valore tra 1000 e 4500 kcal.');Object.assign(data.diet,{kcal:v,protKg:Number($('protKg').value)||1.8,sex:$('estSex').value,age:$('estAge').value,weight:$('estWeight').value,height:$('estHeight').value,activity:$('estActivity').value});persist();window.dispatchEvent(new Event('bsp:diet'));alert(`Fatto: ${v} kcal al giorno. Le prossime porzioni generate si adattano 🕯️`)};
 $('dietMeals').onchange=()=>renderTargets()}

/* ───── Spesa con calcolatore ───── */
function addShop(){const name=$('shopName').value.trim();if(!name)return alert('Inserisci un prodotto');const p=$('shopPrice').value;const price=p===''?(data.prices[name.toLowerCase()]??''):Number(p);if(p!=='')data.prices[name.toLowerCase()]=Number(p);data.shop.push({name,qty:$('shopQty').value,price,done:false});$('shopName').value='';$('shopQty').value='';$('shopPrice').value='';persist()}
function setPrice(i,v){const it=data.shop[i];if(!it)return;it.price=v===''?'':Math.max(0,Number(v));if(v!=='')data.prices[it.name.toLowerCase()]=it.price;persist()}
function renderShop(){const s=data.shop;$('shopList').innerHTML=s.length?s.map((x,i)=>`<li class="shop-item${x.done?' done':''}"><label class="inline"><input type="checkbox" ${x.done?'checked':''} onchange="data.shop[${i}].done=this.checked;persist()"><span>${esc(x.name)} <small>${esc(x.qty)}</small></span></label><span class="price-box"><input type="number" min="0" step="0.01" inputmode="decimal" value="${x.price===''||x.price===undefined?'':Number(x.price)}" placeholder="€" aria-label="Prezzo ${esc(x.name)}" onchange="setPrice(${i},this.value)"><button class="action danger mini" type="button" onclick="del('shop',${i})" aria-label="Elimina">×</button></span></li>`).join(''):'<li class="muted">Lista vuota. Il calderone ringrazia.</li>';
 const priced=s.filter(x=>x.price!==''&&x.price!==undefined&&Number.isFinite(Number(x.price)));const tot=priced.reduce((a,x)=>a+Number(x.price),0),cart=priced.filter(x=>x.done).reduce((a,x)=>a+Number(x.price),0),missingP=s.length-priced.length,budget=Number(data.diet.budget)||0;const pct=budget?Math.min(100,tot/budget*100):0;
 $('shopTotals').innerHTML=`<div class="grid three"><div class="metric"><strong>${euro(tot)}</strong><small>totale lista</small></div><div class="metric"><strong>${euro(cart)}</strong><small>già nel carrello</small></div><div class="metric"><strong>${euro(tot-cart)}</strong><small>ancora da prendere</small></div></div>${budget?`<div class="budget"><div class="budget-bar"><span style="width:${pct}%" class="${tot>budget?'over':''}"></span></div><p class="fine">${tot>budget?`Sforato di ${euro(tot-budget)} sul budget settimanale di ${euro(budget)}. Il gatto nero ti guarda male 🐈‍⬛`:`Restano ${euro(budget-tot)} del budget settimanale (${euro(budget)}).`}</p></div>`:'<p class="fine muted">Imposta un budget in Dieta per vedere quanto ti resta.</p>'}${missingP?`<p class="fine muted">${missingP} ${missingP===1?'voce senza prezzo':'voci senza prezzo'}: aggiungilo per un totale preciso. I prezzi vengono ricordati.</p>`:''}`;
 $('priceNames').innerHTML=Object.keys(data.prices).map(n=>`<option value="${esc(n)}">`).join('')}

function del(type,i){if(!confirm('Eliminare questa voce?'))return;data[type].splice(i,1);persist()}
function renderLogList(id,type,format){const arr=data[type].map((x,i)=>({x,i})).sort((a,b)=>(b.x.date+(b.x.clock||'')).localeCompare(a.x.date+(a.x.clock||''))).slice(0,30);$(id).innerHTML=arr.length?arr.map(({x,i})=>`<li><span>${format(x)}</span><button class="action danger mini" type="button" onclick="del('${type}',${i})" aria-label="Elimina">×</button></li>`).join(''):'<li class="muted">Nessuna voce</li>'}
function renderList(id,type,format){$(id).innerHTML=data[type].length?data[type].map((x,i)=>`<li><span>${format(x)}</span><button class="action danger mini" type="button" onclick="del('${type}',${i})" aria-label="Elimina">×</button></li>`).join(''):'<li class="muted">Nessuna voce</li>'}
function render(){
 $('numFridge').textContent=data.foods.length;$('numShop').textContent=data.shop.filter(x=>!x.done).length;
 const t=BSP.dayTotals(isoDay(new Date()));$('kcalToday').textContent=t.kcal+' / '+BSP.targets().kcal;
 renderPantry();
 renderList('labList','labs',x=>`<b>${esc(x.name)}</b>: ${esc(x.value)} ${esc(x.unit)} <small>${esc(x.date)} · Rif. ${esc(x.range||'non indicato')}</small>`);
 renderLogList('logList','logs',x=>{const ix=BSP.entryIndex(x);return `<b>${esc(x.date)} · ${esc(x.clock||x.time)}</b> <span class="pill">mente ${ix.mental??'–'}</span> <span class="pill">corpo ${ix.physical??'–'}</span><br><small>Fame ${x.hunger} · Energia ${x.energy} · Gonfiore ${x.bloat} · Stress ${x.stress}${x.mood?' · Umore '+x.mood:''}${x.emotions?.length?' · '+x.emotions.map(esc).join(', '):''}${x.glucose?' · Glicemia '+esc(x.glucose)+' mg/dL':''}</small>`});
 renderShop();
}
function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='LAPAPPA-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
function clearAll(){if(confirm('Cancellare definitivamente tutti i dati locali?')&&confirm('Confermi? Non potrai recuperarli senza backup.')){data=structuredClone(defaults);persist();init()}}

foodCombo=BSP.combo($('foodName'),{onPick:d=>{$('foodUnit').value=d.unita;foodInfo(d)}});
editCombo=BSP.combo($('editName'),{onPick:d=>{$('editUnit').value=d.unita}});
linkFoods();
$('foodEditForm').addEventListener('submit',e=>{e.preventDefault();const f=data.foods[editing];const d=editCombo.get();if(!f)return closeEdit();if(!d)return alert('Scegli l’alimento dall’elenco.');Object.assign(f,{id:d.id,name:d.nome,qty:$('editQty').value,unit:$('editUnit').value,date:$('editDate').value});closeEdit();persist()});
$('editCancel').onclick=closeEdit;
bindDiet();init();
window.addEventListener('load',render);
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h&&document.getElementById(h))go(h)});

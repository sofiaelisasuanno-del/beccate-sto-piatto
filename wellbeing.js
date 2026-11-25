/* Home · Panoramica della situa: stessi indici della pagina Panoramica (nessun calcolo parallelo). */
(function(){
const root=document.getElementById('wellbeingHome');if(!root)return;
function label(v){if(v===null)return'Nessun dato';if(v>=8.5)return'Ottimo';if(v>=6.5)return'Buono';if(v>=4.5)return'Così così';return'Da tenere d’occhio'}
function color(t){const a=[176,190,181],b=[31,93,60];return`rgb(${a.map((x,i)=>Math.round(x+(b[i]-x)*t)).join(',')})`}
function render(){const out=[];for(let i=0;i<14;i++){const d=new Date();d.setDate(d.getDate()-i);const date=isoDay(d);const w=BSP.wellIndex(date),t=BSP.dayTotals(date),cy=window.BSPcycle?.status?.(date)?.bleeding;
 const vals=[w.mental,w.physical].filter(v=>v!==null);const score=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10:null;
 const meta=[];if(w.mental!==null)meta.push(`Mente ${w.mental}/10`);if(w.physical!==null)meta.push(`Corpo ${w.physical}/10`);if(w.n>1)meta.push(`sbalzo ${w.mMin}–${w.mMax}`);if(t.meals.length)meta.push(`${t.kcal} kcal da ${t.meals.length} pasti`);if(cy)meta.push('ciclo');
 out.push(score===null&&!t.meals.length?`<div class="well-item"><b class="well-date">${date.slice(8)}/${date.slice(5,7)}</b><span class="well-dot" style="background:#E1E8E3"></span><div><span class="well-score">Nessun dato registrato</span><small class="well-meta">Compila “Oggi mi sento” o spunta un pasto mangiato.</small></div></div>`:
 `<div class="well-item"><b class="well-date">${date.slice(8)}/${date.slice(5,7)}</b><span class="well-dot" style="background:${score===null?'#E1E8E3':color(score/10)}"></span><div><span class="well-score">${score===null?'Solo pasti registrati':score+'/10 · '+label(score)}</span><small class="well-meta">${meta.join(' · ')}</small><div class="well-meter"><span style="width:${score===null?0:score*10}%"></span></div></div></div>`)}
 root.innerHTML='<p class="muted fine">Media di mente e corpo, calcolata come nella Panoramica. Il ciclo è solo contesto e non pesa sul punteggio.</p><div class="well-list">'+out.join('')+'</div>'}
const st=document.createElement('style');st.textContent='.well-list{display:grid;gap:8px}.well-item{display:grid;grid-template-columns:52px 20px 1fr;gap:10px;align-items:start;padding:11px 12px;border-radius:12px}.well-date{font-weight:700;line-height:1.15}.well-dot{width:18px;height:18px;border-radius:50%;margin-top:3px}.well-meter{height:7px;border-radius:8px;overflow:hidden;margin-top:6px}.well-meter span{display:block;height:100%}.well-score{font-weight:800;display:block;font-size:14.5px}.well-meta{font-size:12.5px;display:block;margin-top:2px}';document.head.appendChild(st);
window.BSPwellbeing={render};['bsp:data','bsp:bonanza','bsp:approved'].forEach(e=>window.addEventListener(e,render));render();
})();

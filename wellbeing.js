(function(){
const $=id=>document.getElementById(id),root=$('wellbeingHome');if(!root)return;
const style=document.createElement('style');style.textContent=`.well-list{display:grid;gap:6px}.well-item{display:grid;grid-template-columns:95px 25px 1fr;gap:10px;align-items:center;background:#f5f8f5;padding:10px;border-radius:12px}.well-dot{width:20px;height:20px;border-radius:50%;border:1px solid #87998c}.well-meter{height:6px;border-radius:8px;background:#dce3dd;overflow:hidden}.well-meter span{display:block;height:100%;background:#28934c}.well-item small{font-size:11px}.well-score{font-weight:700}`;document.head.appendChild(style);
const local=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function read(k,fallback){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fallback))}catch(e){return fallback}}
function evaluate(date){const allLogs=data.logs.filter(l=>l.date===date),last=allLogs[allLogs.length-1],sleep=read('bsp-sleep-v1',{})[date],bonanza=read('bsp-bonanza-v1',[]),approved=bonanza.filter(e=>e.date===date&&e.approved),plan=read('bsp-planner-v2',{})[date]||[];
if(!last&&!sleep&&!approved.length)return null;
const values=[];if(last){values.push((Number(last.energy)-1)/9);values.push(1-(Number(last.stress)-1)/9);values.push(1-(Number(last.bloat)-1)/9)}
if(sleep){values.push(Math.min(1,Math.max(0,Number(sleep.hours)/8)));values.push((Number(sleep.quality)-1)/4)}
if(plan.length){const possible=Math.max(1,plan.filter(x=>['Colazione','Pranzo','Spuntino','Cena'].includes(x.slot)).length);values.push(Math.min(1,approved.length/possible))}
const score=Math.max(0,Math.min(1,values.reduce((a,b)=>a+b,0)/values.length));return{score,last,sleep,approved:approved.length}}
function color(t){const muted=[135,149,140],bright=[50,199,99];const mix=i=>Math.round(muted[i]+(bright[i]-muted[i])*t);return`rgb(${mix(0)},${mix(1)},${mix(2)})`}
function render(){let dates=[];for(let i=0;i<14;i++){const d=new Date();d.setDate(d.getDate()-i);dates.push(local(d))}
root.innerHTML='<p class="muted" style="font-size:12px">Indicatore soggettivo: energia, gonfiore, stress, sonno e, quando disponibili, piatti approvati. Il grigio indica assenza di dati, non un giorno negativo.</p><div class="well-list">'+dates.map(date=>{const value=evaluate(date),score=value?.score;return `<div class="well-item"><b>${date.slice(8)}/${date.slice(5,7)}</b><span class="well-dot" style="background:${score===undefined?'#d6dbd7':color(score)}"></span><div><small>${score===undefined?'Nessun dato':`Benessere indicativo ${(score*5).toFixed(1)}/5`}</small><div class="well-meter"><span style="width:${score===undefined?0:score*100}%"></span></div></div></div>`}).join('')+'</div>'}
window.BSPwellbeing={render};render();
})();

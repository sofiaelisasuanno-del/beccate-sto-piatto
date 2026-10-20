(function(){
const key='bsp-sleep-v1';const $=id=>document.getElementById(id);const descriptions={
1:['Brutti sogni','Paralisi nel sonno','Insonnia','Risvegli continui','Risveglio molto faticoso'],
2:['Difficoltà ad addormentarmi','Sonno leggero','Mi sono svegliata spesso','Mi sento poco riposata'],
3:['Sonno discontinuo','Qualche risveglio','Sogni intensi','Riposo discreto'],
4:['Mi sono addormentata facilmente','Pochi risvegli','Risveglio tranquillo','Mi sento riposata'],
5:['Ho dormito come un sasso','Sogni bellissimi','Risveglio stupendo','Mi sento piena di energie']};
function read(){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch(e){return {}}};function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
$('sleepDate').value=iso(new Date());function tags(){const quality=Number($('sleepQuality').value);$('sleepTags').innerHTML=descriptions[quality].map(t=>`<option value="${t}">${t}</option>`).join('')};$('sleepQuality').onchange=tags;tags();
function render(){const all=read();const keys=Object.keys(all).sort().reverse().slice(0,14);$('sleepHistory').innerHTML=keys.length?'<h3 style="margin-top:18px">Ultime registrazioni</h3>'+keys.map(date=>{let s=all[date];return `<p style="border-bottom:1px solid #e3e9e3;padding:8px 0"><b>${date}</b> · ${s.hours} ore · Qualità ${s.quality}/5<br><small>${(s.tags||[]).map(t=>esc(t)).join(' · ')||'Nessun dettaglio'}</small></p>`}).join(''):'<p class="muted">Nessun sonno registrato.</p>'}
$('sleepSave').onclick=()=>{const date=$('sleepDate').value,hours=Number($('sleepHours').value),quality=Number($('sleepQuality').value);if(!date||!$('sleepHours').value||!Number.isFinite(hours)||hours<0||hours>24)return alert('Inserisci una data e ore di sonno valide (0–24).');const selected=[...$('sleepTags').selectedOptions].map(x=>x.value);const all=read();all[date]={hours,quality,tags:selected,updatedAt:new Date().toISOString()};localStorage.setItem(key,JSON.stringify(all));render();window.BSPwellbeing?.render?.();alert('Riposo registrato.')};render();window.BSPsleep={read};
})();

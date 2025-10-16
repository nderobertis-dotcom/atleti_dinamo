document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('atleta-form');
  const lista = document.getElementById('atleti-list');
  let lastFiltro = 'all';

  function caricaAtleti() {
    try { return JSON.parse(localStorage.getItem('atleti')) || []; }
    catch { return []; }
  }
  function salvaAtleti(arr) {
    localStorage.setItem('atleti', JSON.stringify(arr));
  }
  function generaId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function calcolaEta(d){if(!d)return"";const o=new Date(),n=new Date(d);let e=o.getFullYear()-n.getFullYear();const t=o.getMonth()-n.getMonth();(t<0||(0===t&&o.getDate()<n.getDate()))&&e--;return e}
  function daysBetween(a,b){return Math.floor((new Date(a)-new Date(b))/(1e3*60*60*24))}
  function statoVisita(s){const oggi=new Date().toISOString().slice(0,10);if(!s)return'ok';const diff=daysBetween(s,oggi);return diff<0?'scaduta':diff<=31?'scanza':'ok'}
  function formattaData(d){if(!d)return'';const [a,m,g]=d.split('-');return g+"/"+m+"/"+a}
  function aggiornaDashboard(){const a=caricaAtleti(),o=new Date().toISOString().slice(0,10);document.getElementById('tot-atleti').textContent=a.length;document.getElementById('tot-maschi').textContent=a.filter(e=>e.sesso==='M').length;document.getElementById('tot-femmine').textContent=a.filter(e=>e.sesso==='F').length;document.getElementById('tot-in-scadenza').textContent=a.filter(e=>e.scadenzaVisita&&daysBetween(e.scadenzaVisita,o)>=0&&daysBetween(e.scadenzaVisita,o)<=31).length;document.getElementById('tot-scadute').textContent=a.filter(e=>e.scadenzaVisita&&daysBetween(e.scadenzaVisita,o)<0).length;const t=a.reduce((e,s)=>e+(s.dataNascita?calcolaEta(s.dataNascita):0),0);document.getElementById('eta-media').textContent=a.length?(t/a.length).toFixed(1):0}
  function filtraAtleti(f){let a=caricaAtleti();a.sort((x,y)=>x.cognome.localeCompare(y.cognome)||x.nome.localeCompare(y.nome));const o=new Date().toISOString().slice(0,10);if('maschi'===f)a=a.filter(e=>e.sesso==='M');if('femmine'===f)a=a.filter(e=>e.sesso==='F');if('scadenza'===f)a=a.filter(e=>e.scadenzaVisita&&daysBetween(e.scadenzaVisita,o)>=0&&daysBetween(e.scadenzaVisita,o)<=31);if('scadute'===f)a=a.filter(e=>e.scadenzaVisita&&daysBetween(e.scadenzaVisita,o)<0);return a}
  function mostraAtleti(f='all'){const l=document.getElementById('atleti-list'),a=filtraAtleti(f);aggiornaDashboard();l.innerHTML='';if(a.length==0){const li=document.createElement('li');li.textContent='Nessun atleta';l.appendChild(li);return}
    a.forEach(e=>{const eta=calcolaEta(e.dataNascita),stato=statoVisita(e.scadenzaVisita),cl={ok:'data-ok',scanza:'data-scanza',scaduta:'data-scaduta'}[stato]||'data-ok';const cert=e.certificatoMedico?'(Certificato caricato)':'(Nessun certificato)';
      const li=document.createElement('li');li.innerHTML=`<span><strong>${e.codiceAtleta}</strong> - ${e.nome} ${e.cognome} – ${e.sesso} – ${e.ruolo}<br>nato il ${formattaData(e.dataNascita)} – ETA': ${eta} – CF: ${e.codiceFiscale}<br>Cell: ${e.cellulare}<br><span class="${cl}">SCADENZA VISITA: ${formattaData(e.scadenzaVisita)}</span><br>${cert}</span><div class="btn-group"><button class="btn-small btn-visualizza" data-id="${e.id}">V</button><button class="btn-small btn-modifica" data-id="${e.id}">M</button><button class="btn-small btn-cancella" data-id="${e.id}">C</button></div>`;l.appendChild(li)});
    document.querySelectorAll('.btn-visualizza').forEach(b=>b.onclick=()=>{document.getElementById('modal').style.display='flex';visualizza(b.dataset.id)});
    document.querySelectorAll('.btn-modifica').forEach(b=>b.onclick=()=>{document.getElementById('modal-modifica').style.display='flex';modifica(b.dataset.id)});
    document.querySelectorAll('.btn-cancella').forEach(b=>b.onclick=()=>rimuovi(b.dataset.id))}
  function visualizza(id){const a=caricaAtleti(),e=a.find(x=>x.id===id)||{},st=statoVisita(e.scadenzaVisita),cl={ok:'data-ok',scanza:'data-scanza',scaduta:'data-scaduta'}[st]||'data-ok';const c=e.certificatoMedico?`<p><a href="${e.certificatoMedico}" target="_blank">Visualizza certificato medico</a></p>`:'<p>(Nessun certificato medico caricato)</p>';document.getElementById('dettaglio-atleta').innerHTML=`<h2>${e.codiceAtleta} - ${e.nome} ${e.cognome}</h2><p><strong>Sesso:</strong> ${e.sesso}</p><p><strong>Ruolo:</strong> ${e.ruolo}</p><p><strong>Data di Nascita:</strong> ${formattaData(e.dataNascita)}</p><p><strong>ETA':</strong> ${calcolaEta(e.dataNascita)}</p><p><strong>Codice Fiscale:</strong> ${e.codiceFiscale}</p><p><strong>Cellulare:</strong> ${e.cellulare}</p><p><span class="${cl}">SCADENZA VISITA: ${formattaData(e.scadenzaVisita)}</span></p>${c}`}
  async function leggiPdf(i){return new Promise((r,j)=>{const f=i.files[0];if(!f)return r(null);const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.onerror=()=>j('Errore file');rd.readAsDataURL(f)})}
  function rimuovi(id){let a=caricaAtleti();const i=a.findIndex(x=>x.id===id);if(i>-1&&confirm('Vuoi cancellare questo atleta?')){a.splice(i,1);salvaAtleti(a);mostraAtleti(lastFiltro);aggiornaDashboard()}}
  async function modifica(id){const a=caricaAtleti().find(x=>x.id===id)||{};['codiceAtleta','nome','cognome','sesso','dataNascita','ruolo','codiceFiscale','cellulare','scadenzaVisita'].forEach(f=>{document.getElementById('mod-'+f).value=a[f]||''});document.getElementById('modifica-form').dataset.id=id;document.getElementById('mod-certificatoMedico').value=''}
  document.getElementById('modifica-form').onsubmit=async e=>{e.preventDefault();const id=e.target.dataset.id,a=caricaAtleti(),i=a.findIndex(x=>x.id===id);if(i===-1)return;let pdf=a[i].certificatoMedico||null;if(document.getElementById('mod-certificatoMedico').files.length>0)pdf=await leggiPdf(document.getElementById('mod-certificatoMedico'));['codiceAtleta','nome','cognome','sesso','dataNascita','ruolo','codiceFiscale','cellulare','scadenzaVisita'].forEach(f=>{a[i][f]=document.getElementById('mod-'+f).value.trim().toUpperCase()});a[i].certificatoMedico=pdf;salvaAtleti(a);document.getElementById('modal-modifica').style.display='none';mostraAtleti(lastFiltro);aggiornaDashboard()};
  form.onsubmit=async e=>{e.preventDefault();let a=caricaAtleti();const r={},id=generaId();['codiceAtleta','nome','cognome','sesso','dataNascita','ruolo','codiceFiscale','cellulare','scadenzaVisita'].forEach(f=>{r[f]=form[f].value.trim().toUpperCase()});r.id=id;if(document.getElementById('certificatoMedico').files.length>0)r.certificatoMedico=await leggiPdf(document.getElementById('certificatoMedico'));a.push(r);salvaAtleti(a);mostraAtleti();form.reset()};
  document.getElementById('close-view').onclick=()=>document.getElementById('modal').style.display='none';
  document.getElementById('close-edit').onclick=()=>document.getElementById('modal-modifica').style.display='none';
  mostraAtleti();aggiornaDashboard();
});

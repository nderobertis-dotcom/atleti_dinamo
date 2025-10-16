document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('atleta-form');
  const list = document.getElementById('atleti-list');
  let filtroAttivo = 'all';

  // Funzioni dati
  const caricaAtleti = () => JSON.parse(localStorage.getItem('atleti') || '[]');
  const salvaAtleti = arr => localStorage.setItem('atleti', JSON.stringify(arr));
  const generaId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const calcolaEta = d => { if (!d) return ''; const n=new Date(d), o=new Date(); let e=o.getFullYear()-n.getFullYear(); if(o<n.setFullYear(o.getFullYear())) e--; return e; };
  const daysBetween = (a,b)=>Math.floor((new Date(a)-new Date(b))/86400000);
  const statoVisita = s => { if(!s)return'ok'; const oggi=new Date().toISOString().slice(0,10), diff=daysBetween(s,oggi); return diff<0?'scaduta':diff<=31?'scanza':'ok'; };
  const formattaData = d => d?d.split('-').reverse().join('/'):'';

  function filtraAtleti(filtro) {
    let a=caricaAtleti().sort((a,b)=>a.cognome.localeCompare(b.cognome)||a.nome.localeCompare(b.nome));
    const oggi=new Date().toISOString().slice(0,10);
    if(filtro==='maschi') return a.filter(x=>x.sesso==='M');
    if(filtro==='femmine') return a.filter(x=>x.sesso==='F');
    if(filtro==='scadenza') return a.filter(x=>x.scadenzaVisita && daysBetween(x.scadenzaVisita,oggi)>=0 && daysBetween(x.scadenzaVisita,oggi)<=31);
    if(filtro==='scadute') return a.filter(x=>x.scadenzaVisita && daysBetween(x.scadenzaVisita,oggi)<0);
    return a;
  }

  function aggiornaDashboard() {
    const a = caricaAtleti(), oggi = new Date().toISOString().slice(0,10);
    document.getElementById('tot-atleti').textContent = a.length;
    document.getElementById('tot-maschi').textContent = a.filter(x=>x.sesso==='M').length;
    document.getElementById('tot-femmine').textContent = a.filter(x=>x.sesso==='F').length;
    document.getElementById('tot-in-scadenza').textContent = a.filter(x=>x.scadenzaVisita && daysBetween(x.scadenzaVisita,oggi)>=0 && daysBetween(x.scadenzaVisita,oggi)<=31).length;
    document.getElementById('tot-scadute').textContent = a.filter(x=>x.scadenzaVisita && daysBetween(x.scadenzaVisita,oggi)<0).length;
    const tot=a.reduce((s,v)=>s+(v.dataNascita?calcolaEta(v.dataNascita):0),0);
    document.getElementById('eta-media').textContent=a.length?(tot/a.length).toFixed(1):0;
  }

  function mostraAtleti(filtro=filtroAttivo){
    filtroAttivo=filtro; const a=filtraAtleti(filtro);
    list.innerHTML=''; aggiornaDashboard();
    if(a.length===0){const li=document.createElement('li');li.textContent='Nessun atleta trovato';list.appendChild(li);return;}
    a.forEach(x=>{
      const stato=statoVisita(x.scadenzaVisita);
      const cl={ok:'data-ok',scanza:'data-scanza',scaduta:'data-scaduta'}[stato];
      const li=document.createElement('li');
      li.innerHTML=`<span><strong>${x.codiceAtleta}</strong> - ${x.nome} ${x.cognome} – ${x.sesso} – ${x.ruolo}<br>Nato il ${formattaData(x.dataNascita)} – Età: ${calcolaEta(x.dataNascita)}<br>CF: ${x.codiceFiscale} – Cell: ${x.cellulare}<br><span class="${cl}">SCADENZA VISITA: ${formattaData(x.scadenzaVisita)}</span><br>${x.certificatoMedico ? '(Certificato caricato)' : '(Nessun certificato)'}</span><div class="btn-group"><button class="btn-small btn-visualizza" data-id="${x.id}">V</button><button class="btn-small btn-modifica" data-id="${x.id}">M</button><button class="btn-small btn-cancella" data-id="${x.id}">C</button></div>`;
      list.appendChild(li);
    });
    document.querySelectorAll('.btn-cancella').forEach(b=>b.onclick=()=>cancella(b.dataset.id));
    document.querySelectorAll('.btn-visualizza').forEach(b=>b.onclick=()=>visualizza(b.dataset.id));
    document.querySelectorAll('.btn-modifica').forEach(b=>b.onclick=()=>modifica(b.dataset.id));
  }

  // Eventi Card Dashboard (corretti)
  document.getElementById('dashboard').addEventListener('click', e=>{
    const card=e.target.closest('.dash-card');
    if(!card) return;
    mostraAtleti(card.dataset.filter);
  });

  function cancella(id) {
    let a=caricaAtleti();
    const idx=a.findIndex(x=>x.id===id);
    if(idx>-1 && confirm('Confermi eliminazione atleta?')){a.splice(idx,1);salvaAtleti(a);mostraAtleti();}
  }

  function visualizza(id){const a=caricaAtleti().find(x=>x.id===id);if(!a)return;document.getElementById('modal').style.display='flex';document.getElementById('dettaglio-atleta').innerHTML=`<h2>${a.codiceAtleta} - ${a.nome} ${a.cognome}</h2><p>Sesso: ${a.sesso}</p><p>Ruolo: ${a.ruolo}</p><p>Data nascita: ${formattaData(a.dataNascita)}</p><p>Età: ${calcolaEta(a.dataNascita)}</p><p>CF: ${a.codiceFiscale}</p><p>Cell: ${a.cellulare}</p><p><span>SCADENZA VISITA: ${formattaData(a.scadenzaVisita)}</span></p>${a.certificatoMedico?`<p><a href="${a.certificatoMedico}" target="_blank">Visualizza certificato medico</a></p>`:'<p>(Nessun certificato medico caricato)</p>'}`;}

  function modifica(id){const a=caricaAtleti().find(x=>x.id===id);if(!a)return;['codiceAtleta','nome','cognome','sesso','dataNascita','ruolo','codiceFiscale','cellulare','scadenzaVisita'].forEach(f=>{document.getElementById('mod-'+f).value=a[f]||''});document.getElementById('modifica-form').dataset.id=id;document.getElementById('modal-modifica').style.display='flex';}

  async function leggiPdf(i){return new Promise(r=>{const f=i.files[0];if(!f)return r(null);const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(f);});}

  form.onsubmit=async e=>{e.preventDefault();let a=caricaAtleti();const pdf=await leggiPdf(document.getElementById('certificatoMedico'));a.push({id:generaId(),codiceAtleta:form.codiceAtleta.value.trim(),nome:form.nome.value.trim().toUpperCase(),cognome:form.cognome.value.trim().toUpperCase(),sesso:form.sesso.value,dataNascita:form.dataNascita.value,ruolo:form.ruolo.value.toUpperCase(),codiceFiscale:form.codiceFiscale.value.trim().toUpperCase(),cellulare:form.cellulare.value.trim(),scadenzaVisita:form.scadenzaVisita.value,certificatoMedico:pdf||null});salvaAtleti(a);form.reset();mostraAtleti();};

  document.getElementById('modifica-form').onsubmit=async e=>{e.preventDefault();const id=e.target.dataset.id;let a=caricaAtleti();const i=a.findIndex(x=>x.id===id);if(i===-1)return;const pdf=await leggiPdf(document.getElementById('mod-certificatoMedico'));['codiceAtleta','nome','cognome','sesso','dataNascita','ruolo','codiceFiscale','cellulare','scadenzaVisita'].forEach(f=>a[i][f]=document.getElementById('mod-'+f).value.trim().toUpperCase());if(pdf)a[i].certificatoMedico=pdf;salvaAtleti(a);document.getElementById('modal-modifica').style.display='none';mostraAtleti();};

  document.getElementById('close-view').onclick=()=>document.getElementById('modal').style.display='none';
  document.getElementById('close-edit').onclick=()=>document.getElementById('modal-modifica').style.display='none';

  mostraAtleti(); aggiornaDashboard();
});

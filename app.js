document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('atleta-form');
  const lista = document.getElementById('atleti-list');
  let lastFiltro = 'all';

  function caricaAtleti() {
    try {
      let dati = localStorage.getItem('atleti');
      if (!dati) return [];
      let arr = JSON.parse(dati);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  function salvaAtleti(arr) {
    localStorage.setItem('atleti', JSON.stringify(arr));
  }
  function generaId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }
  function calcolaEta(data) {
    if (!data) return "";
    const oggi = new Date();
    const nascita = new Date(data);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--;
    return eta;
  }
  function daysBetween(d1, d2) {
    try {
      const date1 = new Date(d1 + 'T00:00:00');
      const date2 = new Date(d2 + 'T00:00:00');
      return Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
    } catch {
      return 9999;
    }
  }
  function statoVisita(scadenza) {
    if (!scadenza) return 'ok';
    const oggi = new Date().toISOString().slice(0, 10);
    const diff = daysBetween(scadenza, oggi);
    if (diff < 0) return 'scaduta';
    if (diff <= 31) return 'scanza';
    return 'ok';
  }
  function aggiornaDashboard() {
    const atleti = caricaAtleti();
    const oggi = new Date().toISOString().slice(0, 10);
    document.getElementById('tot-atleti').textContent = atleti.length;
    document.getElementById('tot-maschi').textContent = atleti.filter(a => a.sesso === 'M').length;
    document.getElementById('tot-femmine').textContent = atleti.filter(a => a.sesso === 'F').length;
    document.getElementById('tot-in-scadenza').textContent = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) >= 0 && daysBetween(a.scadenzaVisita, oggi) <= 31).length;
    document.getElementById('tot-scadute').textContent = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) < 0).length;
    const sommaEta = atleti.reduce((acc, a) => acc + (a.dataNascita ? calcolaEta(a.dataNascita) : 0), 0);
    document.getElementById('eta-media').textContent = atleti.length ? (sommaEta / atleti.length).toFixed(1) : 0;
  }
  function formattaData(dataIso) {
    if (!dataIso) return '';
    const [anno, mese, giorno] = dataIso.split('-');
    return `${giorno}/${mese}/${anno}`;
  }
  function mostraAtleti(filtro='all') {
    const atleti = caricaAtleti().sort((a,b)=>((a.nome||"")+(a.cognome||"")).localeCompare(((b.nome||"")+(b.cognome||""))));
    let filtrati = atleti;
    if (filtro==='maschi') filtrati = atleti.filter(a=>a.sesso==='M');
    if (filtro==='femmine') filtrati = atleti.filter(a=>a.sesso==='F');
    if (filtro==='scadenza') filtrati = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, new Date().toISOString().slice(0,10)) >=0 && daysBetween(a.scadenzaVisita, new Date().toISOString().slice(0,10))<=31);
    if (filtro==='scadute') filtrati = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, new Date().toISOString().slice(0,10)) < 0);
    const listaDom = document.getElementById('atleti-list');
    listaDom.innerHTML = '';
    if (filtrati.length===0) {
      const li = document.createElement('li'); li.textContent='Nessun atleta'; listaDom.appendChild(li); return;
    }
    filtrati.forEach(a => {
      const eta = a.dataNascita ? calcolaEta(a.dataNascita) : '';
      const scadenzaFormat = formattaData(a.scadenzaVisita);
      const stato = statoVisita(a.scadenzaVisita);
      const classVisita = {
        ok: 'data-ok',
        scanza: 'data-scanza',
        scaduta: 'data-scaduta'
      }[stato] || 'data-ok';

      const li = document.createElement('li');
      li.innerHTML = `
        <span><strong>${a.codiceAtleta}</strong> - ${a.nome} ${a.cognome} – ${a.sesso} – ${a.ruolo}
        <br>nato il ${formattaData(a.dataNascita)} – ETA': ${eta} – CF: ${a.codiceFiscale}
        <br>Cell: ${a.cellulare}
        <br><span class="${classVisita}">SCADENZA VISITA: ${scadenzaFormat}</span></span>
        <div class="btn-group">
          <button class="btn-small btn-visualizza" data-id="${a.id}">V</button>
          <button class="btn-small btn-modifica" data-id="${a.id}">M</button>
          <button class="btn-small btn-cancella" data-id="${a.id}">C</button>
        </div>
      `;
      listaDom.appendChild(li);
    });
    document.querySelectorAll('.btn-visualizza').forEach(b=>b.onclick=()=>{document.getElementById('modal').style.display='flex';visualizzaAtleta(b.dataset.id);});
    document.querySelectorAll('.btn-modifica').forEach(b=>b.onclick=()=>{document.getElementById('modal-modifica').style.display='flex';avviaModificaAtleta(b.dataset.id);});
    document.querySelectorAll('.btn-cancella').forEach(b=>b.onclick=()=>cancellaAtleta(b.dataset.id));
  }

  function visualizzaAtleta(id) {
    const atleti=caricaAtleti(); const a=atleti.find(x=>x.id===id)||{};
    const dataNascita=formattaData(a.dataNascita);
    const eta=a.dataNascita?calcolaEta(a.dataNascita):'';
    const scadenza=formattaData(a.scadenzaVisita);
    const stato=statoVisita(a.scadenzaVisita);
    const classVisita={'ok':'data-ok','scanza':'data-scanza','scaduta':'data-scaduta'}[stato]||'data-ok';

    document.getElementById('dettaglio-atleta').innerHTML=`
      <h2>${a.codiceAtleta} - ${a.nome} ${a.cognome}</h2>
      <p><strong>Sesso:</strong> ${a.sesso}</p>
      <p><strong>Ruolo:</strong> ${a.ruolo}</p>
      <p><strong>Data di Nascita:</strong> ${dataNascita}</p>
      <p><strong>ETA':</strong> ${eta}</p>
      <p><strong>CF:</strong> ${a.codiceFiscale}</p>
      <p><strong>Cell:</strong> ${a.cellulare}</p>
      <p><span class="${classVisita}">SCADENZA VISITA: ${scadenza}</span></p>
    `;
  }

  function avviaModificaAtleta(id) {
    const atleti=caricaAtleti(); const a=atleti.find(x=>x.id===id)||{};
    document.getElementById('mod-codiceAtleta').value=a.codiceAtleta||'';
    document.getElementById('mod-nome').value=a.nome||'';
    document.getElementById('mod-cognome').value=a.cognome||'';
    document.getElementById('mod-sesso').value=a.sesso||'';
    document.getElementById('mod-dataNascita').value=a.dataNascita||'';
    document.getElementById('mod-ruolo').value=a.ruolo||'';
    document.getElementById('mod-codiceFiscale').value=a.codiceFiscale||'';
    document.getElementById('mod-cellulare').value=a.cellulare||'';
    document.getElementById('mod-scadenzaVisita').value=a.scadenzaVisita||'';
    // Memorizza id
    document.getElementById('modifica-form').dataset.id=id;
  }
  // Gestione update
  document.getElementById('modifica-form').onsubmit=function(e){
    e.preventDefault();
    const id=this.dataset.id;
    const atleti=caricaAtleti(); const a=atleti.find(x=>x.id===id);
    const nuovoCodice=this['mod-codiceAtleta'].value.trim();
    if(!/^\d{7}$/.test(nuovoCodice)){
      alert('Inserisci un codice di 7 cifre numeriche');
      return;
    }
    // Controllo duplicato
    if(atleti.some((a,i)=>a.codiceAtleta===nuovoCodice && a.id!==id)){
      alert('Codice duplicato, inserisci uno diverso');
      return;
    }
    a.codiceAtleta=nuovoCodice;
    a.nome=this['mod-nome'].value.trim().toUpperCase();
    a.cognome=this['mod-cognome'].value.trim().toUpperCase();
    a.sesso=this['mod-sesso'].value.toUpperCase();
    a.dataNascita=this['mod-dataNascita'].value;
    a.ruolo=this['mod-ruolo'].value.toUpperCase();
    a.codiceFiscale=this['mod-codiceFiscale'].value.trim().toUpperCase();
    a.cellulare=this['mod-cellulare'].value.trim();
    a.scadenzaVisita=this['mod-scadenzaVisita'].value;
    salvaAtleti(atleti);
    document.querySelector('.modal').style.display='none';
    mostraAtleti(lastFiltro);
    aggiornaDashboard();
  }

  // Inserimento nuovo atleta
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const cod=this['codiceAtleta'].value.trim();
    if(!/^\d{7}$/.test(cod)){ alert('Codice atleta deve essere di 7 cifre!'); return; }
    if(caricaAtleti().some(a=>a.codiceAtleta===cod)){ alert('Codice doppio!'); return; }
    const n=this['nome'].value.trim().toUpperCase();
    const c=this['cognome'].value.trim().toUpperCase();
    const s=this['sesso'].value.toUpperCase();
    const d=this['dataNascita'].value;
    const r=this['ruolo'].value.toUpperCase();
    const cf=this['codiceFiscale'].value.trim().toUpperCase();
    const ctel=this['cellulare'].value.trim();
    const sc=this['scadenzaVisita'].value;
    const atleti=caricaAtleti();
    atleti.push({ id: generaId(), codiceAtleta:cod, nome:n, cognome:c, sesso:s, dataNascita:d, ruolo:r, codiceFiscale:cf, cellulare:ctel, scadenzaVisita:sc });
    salvaAtleti(atleti);
    mostraAtleti();
    form.reset();
  });

  document.querySelectorAll('.dash-card[data-filter]').forEach(c=>c.onclick=()=>{lastFiltro=c.dataset.filter;mostraAtleti(lastFiltro);});
  document.getElementById('close-view').onclick=()=>{document.getElementById('modal').style.display='none';};
  document.getElementById('close-edit').onclick=()=>{document.getElementById('modal-modifica').style.display='none';};

  document.getElementById('export-btn').onclick=function(){
    const data=JSON.stringify(caricaAtleti(),null,2);
    const blob=new Blob([data], {type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='backup.json';
    document.body.appendChild(a); a.click();
    setTimeout(()=>{document.body.removeChild(a); URL.revokeObjectURL(url);},100);
  };
  document.getElementById('import-btn').onclick=()=>{document.getElementById('import-file').click();};
  document.getElementById('import-file').onchange=function() {
    const f=this.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=function(){try{
      const arr=JSON.parse(r.result);
      if(!Array.isArray(arr)){ alert('Formato invalid'); return; }
      const current=caricaAtleti();
      const all=[...current];
      arr.forEach(nuovo=>{
        const idx=all.findIndex(a=>a.id===nuovo.id);
        if(idx>-1) all[idx]=nuovo;
        else all.push(nuovo);
      });
      salvaAtleti(all);
      mostraAtleti(lastFiltro);
      alert('Dati importati');
    } catch(e){ alert('Errore!'); } }
    r.readAsText(f);
    this.value='';
  };

  // Mostra lista e dashboard
  mostraAtleti();
  aggiornaDashboard();
});

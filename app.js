document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('atleta-form');
  const list = document.getElementById('atleti-list');
  let filtro = 'all';

  const caricaAtleti = () => JSON.parse(localStorage.getItem('atleti') || '[]');
  const salvaAtleti = arr => localStorage.setItem('atleti', JSON.stringify(arr));
  const generaId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const calcolaEta = data => {
    if (!data) return '';
    const oggi = new Date();
    const nascita = new Date(data);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--;
    return eta;
  };

  const daysBetween = (a, b) => Math.floor((new Date(a) - new Date(b)) / 86400000);
  const statoVisita = scad => {
    if (!scad) return 'ok';
    const oggi = new Date().toISOString().slice(0, 10);
    const diff = daysBetween(scad, oggi);
    return diff < 0 ? 'scaduta' : diff <= 31 ? 'scanza' : 'ok';
  };
  const formattaData = d => !d ? '' : d.split('-').reverse().join('/');

  function aggiornaDashboard() {
    const a = caricaAtleti(), oggi = new Date().toISOString().slice(0, 10);
    document.getElementById('tot-atleti').textContent = a.length;
    document.getElementById('tot-maschi').textContent = a.filter(x => x.sesso === 'M').length;
    document.getElementById('tot-femmine').textContent = a.filter(x => x.sesso === 'F').length;
    document.getElementById('tot-in-scadenza').textContent = a.filter(x => daysBetween(x.scadenzaVisita, oggi) >= 0 && daysBetween(x.scadenzaVisita, oggi) <= 31).length;
    document.getElementById('tot-scadute').textContent = a.filter(x => daysBetween(x.scadenzaVisita, oggi) < 0).length;
    const totEta = a.reduce((sum, x) => sum + (x.dataNascita ? calcolaEta(x.dataNascita) : 0), 0);
    document.getElementById('eta-media').textContent = a.length ? (totEta / a.length).toFixed(1) : 0;
  }

  function mostraAtleti() {
    const a = caricaAtleti().sort((a,b)=>a.cognome.localeCompare(b.cognome)||a.nome.localeCompare(b.nome));
    aggiornaDashboard(); list.innerHTML = '';
    if (a.length === 0) {
      const li = document.createElement('li'); li.textContent = 'Nessun atleta trovato'; list.appendChild(li); return;
    }
    a.forEach(x => {
      const li = document.createElement('li');
      const stato = statoVisita(x.scadenzaVisita);
      const cl = {ok:'data-ok',scan:'data-scanza',scaduta:'data-scaduta'}[stato] || 'data-ok';
      li.innerHTML = `<span>
        <strong>${x.codiceAtleta}</strong> - ${x.nome} ${x.cognome} – ${x.sesso} – ${x.ruolo}
        <br>Nato il ${formattaData(x.dataNascita)} – Età: ${calcolaEta(x.dataNascita)}
        <br>CF: ${x.codiceFiscale} – Cell: ${x.cellulare}
        <br><span class="${cl}">SCADENZA VISITA: ${formattaData(x.scadenzaVisita)}</span>
        <br>${x.certificatoMedico ? '(Certificato caricato)' : '(Nessun certificato)'}
      </span>
      <div class="btn-group">
        <button class="btn-small btn-visualizza" data-id="${x.id}">V</button>
        <button class="btn-small btn-modifica" data-id="${x.id}">M</button>
        <button class="btn-small btn-cancella" data-id="${x.id}">C</button>
      </div>`;
      list.appendChild(li);
    });

    document.querySelectorAll('.btn-cancella').forEach(btn => btn.onclick = () => cancella(btn.dataset.id));
    document.querySelectorAll('.btn-visualizza').forEach(btn => btn.onclick = () => visualizza(btn.dataset.id));
    document.querySelectorAll('.btn-modifica').forEach(btn => btn.onclick = () => modifica(btn.dataset.id));
  }

  function cancella(id) {
    let a = caricaAtleti();
    const idx = a.findIndex(x => x.id === id);
    if (idx !== -1 && confirm('Confermi eliminazione atleta?')) {
      a.splice(idx, 1);
      salvaAtleti(a);
      mostraAtleti();
    }
  }

  function visualizza(id) {
    const a = caricaAtleti().find(x => x.id === id);
    if (!a) return;
    const c = a.certificatoMedico ? `<p><a href="${a.certificatoMedico}" target="_blank">Visualizza certificato medico</a></p>` : '<p>(Nessun certificato medico caricato)</p>';
    document.getElementById('modal').style.display='flex';
    document.getElementById('dettaglio-atleta').innerHTML = `
      <h2>${a.codiceAtleta} - ${a.nome} ${a.cognome}</h2>
      <p>Sesso: ${a.sesso}</p><p>Ruolo: ${a.ruolo}</p><p>Data nascita: ${formattaData(a.dataNascita)}</p>
      <p>Età: ${calcolaEta(a.dataNascita)}</p><p>CF: ${a.codiceFiscale}</p><p>Cell: ${a.cellulare}</p>
      <p><span>SCADENZA VISITA: ${formattaData(a.scadenzaVisita)}</span></p>${c}`;
  }

  function modifica(id) {
    const a = caricaAtleti().find(x => x.id === id);
    if (!a) return;
    ['codiceAtleta','nome','cognome','sesso','dataNascita','ruolo','codiceFiscale','cellulare','scadenzaVisita'].forEach(f=>{
      document.getElementById('mod-'+f).value = a[f] || '';
    });
    document.getElementById('modifica-form').dataset.id=id;
    document.getElementById('modal-modifica').style.display='flex';
  }

  async function leggiPdf(input) {
    return new Promise(r=>{
      const f=input.files[0]; if(!f)return r(null);
      const rd=new FileReader();
      rd.onload=e=>r(e.target.result);
      rd.readAsDataURL(f);
    });
  }

  form.onsubmit = async e => {
    e.preventDefault();
    const a = caricaAtleti();
    const pdf = await leggiPdf(document.getElementById('certificatoMedico'));
    const nuovo = {
      id:generaId(),
      codiceAtleta:form.codiceAtleta.value.trim(),
      nome:form.nome.value.trim().toUpperCase(),
      cognome:form.cognome.value.trim().toUpperCase(),
      sesso:form.sesso.value,
      dataNascita:form.dataNascita.value,
      ruolo:form.ruolo.value.toUpperCase(),
      codiceFiscale:form.codiceFiscale.value.trim().toUpperCase(),
      cellulare:form.cellulare.value.trim(),
      scadenzaVisita:form.scadenzaVisita.value,
      certificatoMedico:pdf||null
    };
    a.push(nuovo);
    salvaAtleti(a);
    form.reset();
    mostraAtleti();
  };

  document.getElementById('modifica-form').onsubmit = async e => {
    e.preventDefault();
    const id = e.target.dataset.id;
    let a = caricaAtleti();
    const i = a.findIndex(x => x.id === id);
    if (i === -1) return;
    const pdf = await leggiPdf(document.getElementById('mod-certificatoMedico'));
    ['codiceAtleta','nome','cognome','sesso','dataNascita','ruolo','codiceFiscale','cellulare','scadenzaVisita'].forEach(f=>{
      a[i][f] = document.getElementById('mod-'+f).value.trim().toUpperCase();
    });
    if(pdf) a[i].certificatoMedico = pdf;
    salvaAtleti(a);
    document.getElementById('modal-modifica').style.display='none';
    mostraAtleti();
  };

  document.getElementById('export-btn').onclick = () => {
    const data = JSON.stringify(caricaAtleti(), null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download='atleti-backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  document.getElementById('import-btn').onclick = () => document.getElementById('import-file').click();

  document.getElementById('import-file').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const arr = JSON.parse(e.target.result);
        salvaAtleti(arr);
        mostraAtleti();
      } catch { alert('Errore nel file importato'); }
    };
    reader.readAsText(file);
  });

  document.getElementById('print-btn').onclick = () => {
    const atleti = caricaAtleti();
    let html = '<h1>Lista Atleti</h1><table border="1" cellspacing="0" cellpadding="6"><thead><tr><th>Codice</th><th>Nome</th><th>Cognome</th><th>Ruolo</th><th>Data Nascita</th><th>Scadenza Visita</th></tr></thead><tbody>';
    atleti.forEach(x=> html += `<tr><td>${x.codiceAtleta}</td><td>${x.nome}</td><td>${x.cognome}</td><td>${x.ruolo}</td><td>${formattaData(x.dataNascita)}</td><td>${formattaData(x.scadenzaVisita)}</td></tr>`);
    html+='</tbody></table>';
    const w=window.open('','_blank');
    w.document.write(html);
    w.print();
    w.close();
  };

  document.getElementById('close-view').onclick=()=>document.getElementById('modal').style.display='none';
  document.getElementById('close-edit').onclick=()=>document.getElementById('modal-modifica').style.display='none';

  mostraAtleti(); aggiornaDashboard();
});

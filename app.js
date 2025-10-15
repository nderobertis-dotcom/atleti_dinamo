document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('atleta-form');
  const lista = document.getElementById('atleti-list');
  let lastFiltro = 'all';

  function caricaAtleti() {
    try {
      const dati = localStorage.getItem('atleti');
      const arr = dati ? JSON.parse(dati) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function salvaAtleti(arr) {
    if (!Array.isArray(arr)) return;
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

  function formattaData(dataIso){
    if(!dataIso) return '';
    const [anno,mese,giorno]=dataIso.split('-');
    return `${giorno}/${mese}/${anno}`;
  }

  function filtraAtleti(filtro){
    let atleti = caricaAtleti();

    atleti.sort((a,b)=>{
      const cognA = (a.cognome||'').toUpperCase();
      const cognB = (b.cognome||'').toUpperCase();
      if(cognA<cognB) return -1;
      if(cognA>cognB) return 1;
      const nomeA = (a.nome||'').toUpperCase();
      const nomeB = (b.nome||'').toUpperCase();
      if(nomeA<nomeB) return -1;
      if(nomeA>nomeB) return 1;
      return 0;
    });

    const oggi=new Date().toISOString().slice(0,10);
    if(filtro==='maschi') atleti=atleti.filter(a=>a.sesso==='M');
    if(filtro==='femmine') atleti=atleti.filter(a=>a.sesso==='F');
    if(filtro==='scadenza') atleti=atleti.filter(a=>a.scadenzaVisita&&daysBetween(a.scadenzaVisita,oggi)>=0&&daysBetween(a.scadenzaVisita,oggi)<=31);
    if(filtro==='scadute') atleti=atleti.filter(a=>a.scadenzaVisita&&daysBetween(a.scadenzaVisita,oggi)<0);

    return atleti;
  }

  function mostraAtleti(filtro='all'){
    const atletiList=document.getElementById('atleti-list');
    const atleti=filtraAtleti(filtro);
    aggiornaDashboard();
    atletiList.innerHTML='';

    if(atleti.length===0){
      const li=document.createElement('li');
      li.textContent='Nessun atleta trovato';
      atletiList.appendChild(li);
      return;
    }

    atleti.forEach(a=>{
      const eta = calcolaEta(a.dataNascita);
      const stato = statoVisita(a.scadenzaVisita);
      const classVisita = {ok:'data-ok',scanza:'data-scanza',scaduta:'data-scaduta'}[stato] || 'data-ok';

      const li=document.createElement('li');
      li.innerHTML=`
        <span>
          <strong>${a.codiceAtleta}</strong> - ${a.nome} ${a.cognome} – ${a.sesso} – ${a.ruolo}
          <br>nato il ${formattaData(a.dataNascita)} – ETA': ${eta} – CF: ${a.codiceFiscale}
          <br>Cell: ${a.cellulare}
          <br><span class="${classVisita}">SCADENZA VISITA: ${formattaData(a.scadenzaVisita)}</span>
        </span>
        <div class="btn-group">
          <button class="btn-small btn-visualizza" data-id="${a.id}">V</button>
          <button class="btn-small btn-modifica" data-id="${a.id}">M</button>
          <button class="btn-small btn-cancella" data-id="${a.id}">C</button>
        </div>
      `;
      atletiList.appendChild(li);
    });

    document.querySelectorAll('.btn-visualizza').forEach(btn => {
      btn.onclick = () => {
        document.getElementById('modal').style.display = 'flex';
        visualizzaAtleta(btn.dataset.id);
      };
    });

    document.querySelectorAll('.btn-modifica').forEach(btn => {
      btn.onclick = () => {
        document.getElementById('modal-modifica').style.display = 'flex';
        avviaModificaAtleta(btn.dataset.id);
      };
    });

    document.querySelectorAll('.btn-cancella').forEach(btn => {
      btn.onclick = () => {
        cancellaAtleta(btn.dataset.id);
      };
    });
  }

  function visualizzaAtleta(id) {
    const atleti = caricaAtleti();
    const a = atleti.find(x => x.id === id) || {};
    const eta = a.dataNascita ? calcolaEta(a.dataNascita) : '';
    const stato = statoVisita(a.scadenzaVisita);
    const classVisita = {ok:'data-ok',scanza:'data-scanza',scaduta:'data-scaduta'}[stato] || 'data-ok';
    document.getElementById('dettaglio-atleta').innerHTML = `
      <h2>${a.codiceAtleta} - ${a.nome} ${a.cognome}</h2>
      <p><strong>Sesso:</strong> ${a.sesso}</p>
      <p><strong>Ruolo:</strong> ${a.ruolo}</p>
      <p><strong>Data di Nascita:</strong> ${formattaData(a.dataNascita)}</p>
      <p><strong>ETA':</strong> ${eta}</p>
      <p><strong>Codice Fiscale:</strong> ${a.codiceFiscale}</p>
      <p><strong>Cellulare:</strong> ${a.cellulare}</p>
      <p><span class="${classVisita}">SCADENZA VISITA: ${formattaData(a.scadenzaVisita)}</span></p>
    `;
  }

  function avviaModificaAtleta(id) {
    const atleti = caricaAtleti();
    const a = atleti.find(x => x.id === id) || {};
    document.getElementById('mod-codiceAtleta').value = a.codiceAtleta || '';
    document.getElementById('mod-nome').value = a.nome || '';
    document.getElementById('mod-cognome').value = a.cognome || '';
    document.getElementById('mod-sesso').value = a.sesso || '';
    document.getElementById('mod-dataNascita').value = a.dataNascita || '';
    document.getElementById('mod-ruolo').value = a.ruolo || '';
    document.getElementById('mod-codiceFiscale').value = a.codiceFiscale || '';
    document.getElementById('mod-cellulare').value = a.cellulare || '';
    document.getElementById('mod-scadenzaVisita').value = a.scadenzaVisita || '';
    document.getElementById('modifica-form').dataset.editId = id;
  }

  function cancellaAtleta(id) {
    let atleti = caricaAtleti();
    const idx = atleti.findIndex(a => a.id === id);
    if (idx === -1) return;
    if (confirm('Vuoi cancellare questo atleta?')) {
      atleti.splice(idx, 1);
      salvaAtleti(atleti);
      mostraAtleti(lastFiltro);
      aggiornaDashboard();
    }
  }

  document.getElementById('modifica-form').onsubmit = function (e) {
    e.preventDefault();
    const id = this.dataset.editId;
    if (!id) return alert('ID atleta mancante');
    const codiceAtleta = document.getElementById('mod-codiceAtleta').value.trim();
    if (!/^\d{7}$/.test(codiceAtleta)) {
      alert('Codice Atleta deve essere 7 cifre');
      return;
    }
    const atleti = caricaAtleti();
    if (atleti.some(a => a.codiceAtleta === codiceAtleta && a.id !== id)) {
      alert('Codice Atleta duplicato');
      return;
    }
    const idx = atleti.findIndex(a => a.id === id);
    if (idx === -1) return;
    atleti[idx] = {
      ...atleti[idx],
      codiceAtleta,
      nome: document.getElementById('mod-nome').value.trim().toUpperCase(),
      cognome: document.getElementById('mod-cognome').value.trim().toUpperCase(),
      sesso: document.getElementById('mod-sesso').value.toUpperCase(),
      dataNascita: document.getElementById('mod-dataNascita').value,
      ruolo: document.getElementById('mod-ruolo').value.toUpperCase(),
      codiceFiscale: document.getElementById('mod-codiceFiscale').value.trim().toUpperCase(),
      cellulare: document.getElementById('mod-cellulare').value.trim(),
      scadenzaVisita: document.getElementById('mod-scadenzaVisita').value,
    };
    salvaAtleti(atleti);
    this.closest('.modal').style.display = 'none';
    mostraAtleti(lastFiltro);
    aggiornaDashboard();
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const codiceAtleta = form.codiceAtleta.value.trim();
    if (!/^\d{7}$/.test(codiceAtleta)) {
      alert('Codice Atleta deve essere 7 cifre');
      return;
    }
    let atleti = caricaAtleti();
    if (atleti.some(a => a.codiceAtleta === codiceAtleta)) {
      alert('Codice Atleta duplicato');
      return;
    }
    const nome = form.nome.value.trim().toUpperCase();
    const cognome = form.cognome.value.trim().toUpperCase();
    const sesso = form.sesso.value.toUpperCase();
    const dataNascita = form.dataNascita.value;
    const ruolo = form.ruolo.value.toUpperCase();
    const codiceFiscale = form.codiceFiscale.value.trim().toUpperCase();
    const cellulare = form.cellulare.value.trim();
    const scadenzaVisita = form.scadenzaVisita.value;
    if (!nome || !cognome || !sesso || !dataNascita || !ruolo || !codiceFiscale || !cellulare || !scadenzaVisita) {
      alert('Per favore compila tutti i campi.');
      return;
    }
    atleti.push({
      id: generaId(),
      codiceAtleta,
      nome,
      cognome,
      sesso,
      dataNascita,
      ruolo,
      codiceFiscale,
      cellulare,
      scadenzaVisita,
    });
    salvaAtleti(atleti);
    mostraAtleti(lastFiltro);
    form.reset();
  });

  document.querySelectorAll('.dash-card[data-filter]').forEach(card =>
    card.addEventListener('click', () => {
      lastFiltro = card.dataset.filter;
      mostraAtleti(lastFiltro);
    })
  );

  document.getElementById('close-view').onclick = () => (document.getElementById('modal').style.display = 'none');
  document.getElementById('close-edit').onclick = () => (document.getElementById('modal-modifica').style.display = 'none');

  document.getElementById('export-btn').onclick = () => {
    const data = JSON.stringify(caricaAtleti(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-atleti.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  document.getElementById('import-btn').onclick = () => document.getElementById('import-file').click();

  document.getElementById('import-file').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const arr = JSON.parse(ev.target.result);
        if (!Array.isArray(arr)) throw new Error('Formato JSON non valido');
        const current = caricaAtleti();
        const all = [...current];
        arr.forEach(nuovo => {
          const idx = all.findIndex(a => a.id === nuovo.id);
          if (idx > -1) all[idx] = nuovo;
          else all.push(nuovo);
        });
        salvaAtleti(all);
        mostraAtleti(lastFiltro);
        aggiornaDashboard();
        alert('Dati importati');
      } catch (e) {
        alert('Errore importazione dati');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  document.getElementById('print-btn').onclick = () => {
    const atleti = filtraAtleti(lastFiltro);
    let html = '<h1>Lista Atleti</h1><table border="1" cellspacing="0" cellpadding="6"><thead><tr><th>Codice Atleta</th><th>Nome</th><th>Cognome</th><th>Sesso</th><th>Ruolo</th><th>Data Nascita</th><th>Codice Fiscale</th><th>Cellulare</th><th>Scadenza Visita</th></tr></thead><tbody>';
    atleti.forEach(a => {
      html += `<tr>
      <td>${a.codiceAtleta || ''}</td>
      <td>${a.nome || ''}</td>
      <td>${a.cognome || ''}</td>
      <td>${a.sesso || ''}</td>
      <td>${a.ruolo || ''}</td>
      <td>${formattaData(a.dataNascita)}</td>
      <td>${a.codiceFiscale || ''}</td>
      <td>${a.cellulare || ''}</td>
      <td>${formattaData(a.scadenzaVisita)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(`<html><head><title>Stampa Atleti</title></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  mostraAtleti();
  aggiornaDashboard();
});

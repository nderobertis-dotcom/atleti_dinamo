document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('atleta-form');
  const list = document.getElementById('atleti-list');
  const dashboard = document.getElementById('dashboard');
  let filtroAttivo = 'all';

  // Funzioni per gestione dati
  function caricaAtleti() {
    let dati = localStorage.getItem('atleti');
    if (!dati) return [];
    try {
      return JSON.parse(dati);
    } catch {
      return [];
    }
  }

  function salvaAtleti(lista) {
    localStorage.setItem('atleti', JSON.stringify(lista));
  }

  function generaId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function calcolaEta(data) {
    if (!data) return '';
    const oggi = new Date();
    const nascita = new Date(data);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--;
    return eta;
  }

  function daysBetween(a, b) {
    return Math.floor((new Date(a) - new Date(b)) / (1000 * 60 * 60 * 24));
  }

  function statoVisita(scad) {
    if (!scad) return 'ok';
    const oggi = new Date().toISOString().slice(0, 10);
    const diff = daysBetween(scad, oggi);
    return diff < 0 ? 'scaduta' : diff <= 31 ? 'scanza' : 'ok';
  }

  function formattaData(data) {
    if (!data) return '';
    const [anno, mese, giorno] = data.split('-');
    return `${giorno}/${mese}/${anno}`;
  }

  function filtraAtleti(filtro) {
    let lista = caricaAtleti().sort((a, b) => a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome));
    const oggi = new Date().toISOString().slice(0, 10);
    if (filtro === 'maschi') lista = lista.filter(x => x.sesso === 'M');
    else if (filtro === 'femmine') lista = lista.filter(x => x.sesso === 'F');
    else if (filtro === 'scadenza') lista = lista.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) >= 0 && daysBetween(x.scadenzaVisita, oggi) <= 31);
    else if (filtro === 'scadute') lista = lista.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) < 0);
    return lista;
  }

  function aggiornaDashboard() {
    const lista = caricaAtleti();
    const oggi = new Date().toISOString().slice(0, 10);
    document.getElementById('tot-atleti').textContent = lista.length;
    document.getElementById('tot-maschi').textContent = lista.filter(x => x.sesso === 'M').length;
    document.getElementById('tot-femmine').textContent = lista.filter(x => x.sesso === 'F').length;
    document.getElementById('tot-in-scadenza').textContent = lista.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) >= 0 && daysBetween(x.scadenzaVisita, oggi) <= 31).length;
    document.getElementById('tot-scadute').textContent = lista.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) < 0).length;
    const totEta = lista.reduce((sum, a) => sum + (a.dataNascita ? calcolaEta(a.dataNascita) : 0), 0);
    document.getElementById('eta-media').textContent = lista.length ? (totEta / lista.length).toFixed(1) : 0;
  }

  function mostraAtleti(filtro = filtroAttivo) {
    filtroAttivo = filtro;
    const lista = filtraAtleti(filtro);
    list.innerHTML = '';
    aggiornaDashboard();
    if (lista.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nessun atleta trovato';
      list.appendChild(li);
      return;
    }
    lista.forEach(x => {
      const stato = statoVisita(x.scadenzaVisita);
      const cl = { ok: 'data-ok', scanza: 'data-scanza', scaduta: 'data-scaduta' }[stato] || 'data-ok';
      const li = document.createElement('li');
      li.innerHTML = `<span>
        <strong>${x.codiceAtleta}</strong> - ${x.nome} ${x.cognome} – ${x.sesso} – ${x.ruolo}
        <br>nato il ${formattaData(x.dataNascita)} – Età: ${calcolaEta(x.dataNascita)}
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
    // Aggiunto riassegnamento listenere dopo ricostruzione lista
    document.querySelectorAll('.btn-cancella').forEach(b => b.onclick = () => cancella(b.dataset.id));
    document.querySelectorAll('.btn-visualizza').forEach(b => b.onclick = () => visualizza(b.dataset.id));
    document.querySelectorAll('.btn-modifica').forEach(b => b.onclick = () => modifica(b.dataset.id));
  }

  // Dashboard click listener per filtrare la lista
  const dashboard = document.getElementById('dashboard');
  dashboard.addEventListener('click', e => {
    const card = e.target.closest('.dash-card');
    if (!card) return;
    mostraAtleti(card.dataset.filter || 'all');
  });

  function cancella(id) {
    let lista = caricaAtleti();
    const idx = lista.findIndex(x => x.id === id);
    if (idx !== -1 && confirm('Confermi eliminazione atleta?')) {
      lista.splice(idx, 1);
      salvaAtleti(lista);
      mostraAtleti();
    }
  }

  function visualizza(id) {
    const atleta = caricaAtleti().find(x => x.id === id);
    if (!atleta) return;
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('dettaglio-atleta').innerHTML = `
      <h2>${atleta.codiceAtleta} - ${atleta.nome} ${atleta.cognome}</h2>
      <p>Sesso: ${atleta.sesso}</p>
      <p>Ruolo: ${atleta.ruolo}</p>
      <p>Data nascita: ${formattaData(atleta.dataNascita)}</p>
      <p>Età: ${calcolaEta(atleta.dataNascita)}</p>
      <p>Codice Fiscale: ${atleta.codiceFiscale}</p>
      <p>Cellulare: ${atleta.cellulare}</p>
      <p><span>SCADENZA VISITA: ${formattaData(atleta.scadenzaVisita)}</span></p>
      ${atleta.certificatoMedico ? `<p><a href="${atleta.certificatoMedico}" target="_blank" rel="noopener noreferrer">Visualizza certificato medico</a></p>` : '<p>(Nessun certificato medico caricato)</p>'}
    `;
  }

  function modifica(id) {
    const atleta = caricaAtleti().find(x => x.id === id);
    if (!atleta) return;
    ['codiceAtleta', 'nome', 'cognome', 'sesso', 'dataNascita', 'ruolo', 'codiceFiscale', 'cellulare', 'scadenzaVisita'].forEach(field => {
      document.getElementById('mod-' + field).value = atleta[field] || '';
    });
    document.getElementById('modifica-form').dataset.id = id;
    document.getElementById('modal-modifica').style.display = 'flex';
  }

  async function leggiPdf(input) {
    return new Promise(resolve => {
      const file = input.files[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  // Insert
  form.onsubmit = async e => {
    e.preventDefault();
    const lista = caricaAtleti();
    const pdf = await leggiPdf(document.getElementById('certificatoMedico'));
    lista.push({
      id: generaId(),
      codiceAtleta: form.codiceAtleta.value.trim(),
      nome: form.nome.value.trim().toUpperCase(),
      cognome: form.cognome.value.trim().toUpperCase(),
      sesso: form.sesso.value,
      dataNascita: form.dataNascita.value,
      ruolo: form.ruolo.value.toUpperCase(),
      codiceFiscale: form.codiceFiscale.value.trim().toUpperCase(),
      cellulare: form.cellulare.value.trim(),
      scadenzaVisita: form.scadenzaVisita.value,
      certificatoMedico: pdf || null
    });
    salvaAtleti(lista);
    form.reset();
    mostraAtleti();
  };

  // Modify
  document.getElementById('modifica-form').onsubmit = async e => {
    e.preventDefault();
    const id = e.target.dataset.id;
    let lista = caricaAtleti();
    const idx = lista.findIndex(x => x.id === id);
    if (idx === -1) return;
    const pdf = await leggiPdf(document.getElementById('mod-certificatoMedico'));
    ['codiceAtleta', 'nome', 'cognome', 'sesso', 'dataNascita', 'ruolo', 'codiceFiscale', 'cellulare', 'scadenzaVisita'].forEach(field => {
      lista[idx][field] = document.getElementById('mod-' + field).value.trim();
      if(field !== 'sesso') lista[idx][field] = lista[idx][field].toUpperCase();
    });
    if (pdf) lista[idx].certificatoMedico = pdf;
    salvaAtleti(lista);
    document.getElementById('modal-modifica').style.display = 'none';
    mostraAtleti();
  };

  // Export
  document.getElementById('export-btn').addEventListener('click', () => {
    const data = JSON.stringify(caricaAtleti(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atleti-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Import
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });

  document.getElementById('import-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const arr = JSON.parse(evt.target.result);
        salvaAtleti(arr);
        mostraAtleti();
      } catch {
        alert('Errore nel file importato');
      }
    };
    reader.readAsText(file);
  });

  // Print
  document.getElementById('print-btn').addEventListener('click', () => {
    const lista = filtraAtleti(filtroAttivo);
    let html = '<h1>Lista Atleti</h1><table border="1" cellspacing="0" cellpadding="6"><thead><tr><th>Codice</th><th>Nome</th><th>Cognome</th><th>Ruolo</th><th>Data Nascita</th><th>Scadenza Visita</th></tr></thead><tbody>';
    lista.forEach(x => {
      html += `<tr><td>${x.codiceAtleta}</td><td>${x.nome}</td><td>${x.cognome}</td><td>${x.ruolo}</td><td>${formattaData(x.dataNascita)}</td><td>${formattaData(x.scadenzaVisita)}</td></tr>`;
    });
    html += '</tbody></table>';
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  });

  document.getElementById('close-view').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
  });

  document.getElementById('close-edit').addEventListener('click', () => {
    document.getElementById('modal-modifica').style.display = 'none';
  });

  mostraAtleti();
  aggiornaDashboard();
});

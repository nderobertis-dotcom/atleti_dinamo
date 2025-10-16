document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('atleta-form');
  const list = document.getElementById('atleti-list');
  let filtroAttivo = 'all';

  const caricaAtleti = () => JSON.parse(localStorage.getItem('atleti') || '[]');
  const salvaAtleti = lista => localStorage.setItem('atleti', JSON.stringify(lista));
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

  const formattaData = d => {
    if (!d) return '';
    const [anno, mese, giorno] = d.split('-');
    return `${giorno}/${mese}/${anno}`;
  };

  function filtraAtleti(filtro) {
    let atleti = caricaAtleti();
    const oggi = new Date().toISOString().slice(0, 10);
    if (filtro === 'maschi') atleti = atleti.filter(x => x.sesso === 'M');
    else if (filtro === 'femmine') atleti = atleti.filter(x => x.sesso === 'F');
    else if (filtro === 'scadenza') atleti = atleti.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) >= 0 && daysBetween(x.scadenzaVisita, oggi) <= 31);
    else if (filtro === 'scadute') atleti = atleti.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) < 0);
    atleti.sort((a, b) => (a.cognome || '').localeCompare(b.cognome || '') || (a.nome || '').localeCompare(b.nome || ''));
    return atleti;
  }

  function aggiornaDashboard() {
    const a = caricaAtleti();
    const oggi = new Date().toISOString().slice(0, 10);
    document.getElementById('tot-atleti').textContent = a.length;
    document.getElementById('tot-maschi').textContent = a.filter(x => x.sesso === 'M').length;
    document.getElementById('tot-femmine').textContent = a.filter(x => x.sesso === 'F').length;
    document.getElementById('tot-in-scadenza').textContent = a.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) >= 0 && daysBetween(x.scadenzaVisita, oggi) <= 31).length;
    document.getElementById('tot-scadute').textContent = a.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) < 0).length;
    const totEta = a.reduce((sum, x) => sum + (x.dataNascita ? calcolaEta(x.dataNascita) : 0), 0);
    document.getElementById('eta-media').textContent = a.length ? (totEta / a.length).toFixed(1) : 0;
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
      li.innerHTML = `
        <span>
          <strong>${x.codiceAtleta}</strong> - ${x.nome} ${x.cognome} – ${x.sesso} – ${x.ruolo}<br>
          Nato il ${formattaData(x.dataNascita)} – Età: ${calcolaEta(x.dataNascita)}<br>
          CF: ${x.codiceFiscale} – Cell: ${x.cellulare}<br>
          <span class="${cl}">SCADENZA VISITA: ${formattaData(x.scadenzaVisita)}</span><br>
          ${x.certificatoMedico ? '(Certificato caricato)' : '(Nessun certificato)'}
        </span>
        <div class="btn-group">
          <button class="btn-small btn-visualizza" data-id="${x.id}">V</button>
          <button class="btn-small btn-modifica" data-id="${x.id}">M</button>
          <button class="btn-small btn-cancella" data-id="${x.id}">C</button>
        </div>
      `;
      list.appendChild(li);
    });
    document.querySelectorAll('.btn-cancella').forEach(b => b.onclick = () => cancella(b.dataset.id));
    document.querySelectorAll('.btn-visualizza').forEach(b => b.onclick = () => visualizza(b.dataset.id));
    document.querySelectorAll('.btn-modifica').forEach(b => b.onclick = () => modifica(b.dataset.id));
  }

  // Gestione eventi dashboard (delegation)
  const dashboard = document.getElementById('dashboard');
  dashboard.addEventListener('click', e => {
    const card = e.target.closest('.dash-card');
    if (!card) return;
    mostraAtleti(card.dataset.filter || 'all');
  });

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
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('dettaglio-atleta').innerHTML = `
      <h2>${a.codiceAtleta} - ${a.nome} ${a.cognome}</h2>
      <p>Sesso: ${a.sesso}</p>
      <p>Ruolo: ${a.ruolo}</p>
      <p>Data nascita: ${formattaData(a.dataNascita)}</p>
      <p>Età: ${calcolaEta(a.dataNascita)}</p>
      <p>Codice Fiscale: ${a.codiceFiscale}</p>
      <p>Cellulare: ${a.cellulare}</p>
      <p><span>SCADENZA VISITA: ${formattaData(a.scadenzaVisita)}</span></p>
      ${a.certificatoMedico ? `<p><a href="${a.certificatoMedico}" target="_blank" rel="noopener noreferrer">Visualizza certificato medico</a></p>` : '<p>(Nessun certificato medico caricato)</p>'}
    `;
  }

  function modifica(id) {
    const a = caricaAtleti().find(x => x.id === id);
    if (!a) return;
    ['codiceAtleta', 'nome', 'cognome', 'sesso', 'dataNascita', 'ruolo', 'codiceFiscale', 'cellulare', 'scadenzaVisita'].forEach(f => {
      document.getElementById('mod-' + f).value = a[f] || '';
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

  form.onsubmit = async e => {
    e.preventDefault();
    let a = caricaAtleti();
    const pdf = await leggiPdf(document.getElementById('certificatoMedico'));
    a.push({
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
    salvaAtleti(a);
    form.reset();
    mostraAtleti();
  };

  document.getElementById('modifica-form').onsubmit = async e => {
    e.preventDefault();
    const id = e.target.dataset.id;
    let a = caricaAtleti();
    const idx = a.findIndex(x => x.id === id);
    if (idx === -1) return;
    const pdf = await leggiPdf(document.getElementById('mod-certificatoMedico'));
    ['codiceAtleta', 'nome', 'cognome', 'sesso', 'dataNascita', 'ruolo', 'codiceFiscale', 'cellulare', 'scadenzaVisita'].forEach(f => {
      a[idx][f] = document.getElementById('mod-' + f).value.trim();
      if (f !== 'sesso') a[idx][f] = a[idx][f].toUpperCase();
    });
    if (pdf) a[idx].certificatoMedico = pdf;
    salvaAtleti(a);
    document.getElementById('modal-modifica').style.display = 'none';
    mostraAtleti();
  };

  // Esporta dati
  document.getElementById('export-btn').addEventListener('click', () => {
    const data = JSON.stringify(caricaAtleti(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'atleti-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });

  // Importa dati
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });

  document.getElementById('import-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const arr = JSON.parse(ev.target.result);
        salvaAtleti(arr);
        mostraAtleti();
      } catch (error) {
        alert('Errore nel file importato');
      }
    };
    reader.readAsText(file);
  });

  // Stampa
  document.getElementById('print-btn').addEventListener('click', () => {
    const lista = filtraAtleti(filtroAttivo);
    let html = '<h1>Lista Atleti</h1><table border="1" cellspacing="0" cellpadding="6"><thead><tr><th>Codice</th><th>Nome</th><th>Cognome</th><th>Ruolo</th><th>Data Nascita</th><th>Scadenza Visita</th></tr></thead><tbody>';
    lista.forEach(x => {
      html += `<tr><td>${x.codiceAtleta}</td><td>${x.nome}</td><td>${x.cognome}</td><td>${x.ruolo}</td><td>${formattaData(x.dataNascita)}</td><td>${formattaData(x.scadenzaVisita)}</td></tr>`;
    });
    html += '</tbody></table>';
    const w = window.open('', '_blank');
    w.document.write('<html><head><title>Stampa Atleti</title></head><body>');
    w.document.write(html);
    w.document.write('</body></html>');
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

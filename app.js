document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('atleta-form');
  const list = document.getElementById('atleti-list');
  let filtroAttivo = 'all';

  const caricaAtleti = () => JSON.parse(localStorage.getItem('atleti') || '[]');
  const salvaAtleti = arr => localStorage.setItem('atleti', JSON.stringify(arr));
  const generaId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const calcolaEta = d => {
    if (!d) return '';
    const oggi = new Date();
    const nascita = new Date(d);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--;
    return eta;
  };

  const daysBetween = (a, b) =>
    Math.floor((new Date(a) - new Date(b)) / (1000 * 60 * 60 * 24));

  const statoVisita = s => {
    if (!s) return 'data-ok';
    const oggi = new Date().toISOString().slice(0, 10);
    const diff = daysBetween(s, oggi);
    return diff < 0
      ? 'data-scaduta'
      : diff <= 31
      ? 'data-scanza'
      : 'data-ok';
  };

  const formattaData = d => {
    if (!d) return '';
    const [a, m, g] = d.split('-');
    return `${g}/${m}/${a}`;
  };

  function filtraAtleti(filtro) {
    let a = caricaAtleti();
    const oggi = new Date().toISOString().slice(0, 10);
    if (filtro === 'maschi') a = a.filter(x => x.sesso === 'M');
    if (filtro === 'femmine') a = a.filter(x => x.sesso === 'F');
    if (filtro === 'scadenza')
      a = a.filter(
        x =>
          x.scadenzaVisita &&
          daysBetween(x.scadenzaVisita, oggi) >= 0 &&
          daysBetween(x.scadenzaVisita, oggi) <= 31,
      );
    if (filtro === 'scadute') a = a.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) < 0);
    a.sort(
      (a, b) =>
        (a.cognome || '').localeCompare(b.cognome || '') ||
        (a.nome || '').localeCompare(b.nome || '')
    );
    return a;
  }

  function aggiornaDashboard() {
    const a = caricaAtleti();
    const oggi = new Date().toISOString().slice(0, 10);
    document.getElementById('tot-atleti').textContent = a.length;
    document.getElementById('tot-maschi').textContent = a.filter(x => x.sesso === 'M').length;
    document.getElementById('tot-femmine').textContent = a.filter(x => x.sesso === 'F').length;
    document.getElementById('tot-in-scadenza').textContent = a.filter(
      x =>
        x.scadenzaVisita &&
        daysBetween(x.scadenzaVisita, oggi) >= 0 &&
        daysBetween(x.scadenzaVisita, oggi) <= 31,
    ).length;
    document.getElementById('tot-scadute').textContent = a.filter(
      x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) < 0,
    ).length;
    const totEta = a.reduce((sum, x) => sum + (x.dataNascita ? calcolaEta(x.dataNascita) : 0), 0);
    document.getElementById('eta-media').textContent = a.length ? (totEta / a.length).toFixed(1) : 0;
  }

  function mostraAtleti(filtro = filtroAttivo) {
    filtroAttivo = filtro;
    const a = filtraAtleti(filtro);
    list.innerHTML = '';
    aggiornaDashboard();
    if (a.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nessun atleta trovato';
      list.appendChild(li);
      return;
    }
    a.forEach(x => {
      const statoCls = statoVisita(x.scadenzaVisita);
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="list-info">
          <strong>${x.codiceAtleta}</strong> - ${x.nome} ${x.cognome} – ${x.sesso} – ${x.ruolo}
          <div>
            <span>Nato il ${formattaData(x.dataNascita)}</span>
            <span>Età: ${calcolaEta(x.dataNascita)}</span>
            <span>CF: ${x.codiceFiscale}</span>
            <span>Cell: ${x.cellulare}</span>
          </div>
          <div><span class="${statoCls}">SCADENZA VISITA: ${formattaData(x.scadenzaVisita)}</span></div>
          <div>${x.certificatoMedico ? '(Certificato caricato)' : '(Nessun certificato)'}</div>
        </span>
        <div class="btn-group">
          <button class="btn-small btn-visualizza" data-id="${x.id}">V</button>
          <button class="btn-small btn-modifica" data-id="${x.id}">M</button>
          <button class="btn-small btn-cancella" data-id="${x.id}">C</button>
        </div>
      `;
      list.appendChild(li);
    });
    document.querySelectorAll('.btn-cancella').forEach(b => (b.onclick = () => cancella(b.dataset.id)));
    document.querySelectorAll('.btn-visualizza').forEach(b => (b.onclick = () => visualizza(b.dataset.id)));
    document.querySelectorAll('.btn-modifica').forEach(b => (b.onclick = () => modifica(b.dataset.id)));
  }

  document.getElementById('dashboard').addEventListener('click', e => {
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
    const statoCls = statoVisita(a.scadenzaVisita);
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('dettaglio-atleta').innerHTML = `
      <h2>${a.codiceAtleta} - ${a.nome} ${a.cognome}</h2>
      <p><strong>Sesso:</strong> ${a.sesso}</p>
      <p><strong>Ruolo:</strong> ${a.ruolo}</p>
      <p><strong>Data di Nascita:</strong> ${formattaData(a.dataNascita)}</p>
      <p><strong>Età:</strong> ${calcolaEta(a.dataNascita)}</p>
      <p><strong>Codice Fiscale:</strong> ${a.codiceFiscale}</p>
      <p><strong>Cellulare:</strong> ${a.cellulare}</p>
      <p><span class="${statoCls}">SCADENZA VISITA: ${formattaData(a.scadenzaVisita)}</span></p>
      ${
        a.certificatoMedico
          ? `<p><a href="${a.certificatoMedico}" target="_blank" rel="noopener noreferrer">Visualizza certificato medico</a></p>`
          : '<p>(Nessun certificato medico caricato)</p>'
      }
    `;
  }

  function modifica(id) {
    const atleta = caricaAtleti().find(x => x.id === id);
    if (!atleta) return;
    ['codiceAtleta', 'nome', 'cognome', 'sesso', 'dataNascita', 'ruolo', 'codiceFiscale', 'cellulare', 'scadenzaVisita'].forEach(
      (field) => {
        document.getElementById('mod-' + field).value = atleta[field] || '';
      },
    );
    document.getElementById('modifica-form').dataset.id = id;
    document.getElementById('modal-modifica').style.display = 'flex';
  }

  async function leggiPdf(input) {
    return new Promise((resolve) => {
      const file = input.files[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  form.onsubmit = async (e) => {
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
      certificatoMedico: pdf || null,
    });
    salvaAtleti(lista);
    form.reset();
    mostraAtleti();
  };

  document.getElementById('modifica-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = e.target.dataset.id;
    let lista = caricaAtleti();
    const idx = lista.findIndex((x) => x.id === id);
    if (idx === -1) return;
    const pdf = await leggiPdf(document.getElementById('mod-certificatoMedico'));
    ['codiceAtleta', 'nome', 'cognome', 'sesso', 'dataNascita', 'ruolo', 'codiceFiscale', 'cellulare', 'scadenzaVisita'].forEach(
      (field) => {
        lista[idx][field] = document.getElementById('mod-' + field).value.trim();
        if (field !== 'sesso') lista[idx][field] = lista[idx][field].toUpperCase();
      },
    );
    if (pdf) lista[idx].certificatoMedico = pdf;
    salvaAtleti(lista);
    document.getElementById('modal-modifica').style.display = 'none';
    mostraAtleti();
  };

  // Esporta
  document.getElementById('export-btn').addEventListener('click', () => {
    const dati = caricaAtleti();
    const blob = new Blob([JSON.stringify(dati, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'atleti-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });

  // Importa
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });

  document.getElementById('import-file').addEventListener('change', (evt) => {
    const file = evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arr = JSON.parse(e.target.result);
        salvaAtleti(arr);
        mostraAtleti();
      } catch {
        alert('Errore nel file importato');
      }
    };
    reader.readAsText(file);
  });

  // Stampa
  document.getElementById('print-btn').addEventListener('click', () => {
    const lista = filtraAtleti(filtroAttivo);
    let html =
      '<h1>Lista Atleti</h1><table border="1" cellspacing="0" cellpadding="6"><thead><tr><th>Codice</th><th>Nome</th><th>Cognome</th><th>Ruolo</th><th>Data Nascita</th><th>Scadenza Visita</th></tr></thead><tbody>';
    lista.forEach((x) => {
      html += `<tr><td>${x.codiceAtleta}</td><td>${x.nome}</td><td>${x.cognome}</td><td>${x.ruolo}</td><td>${formattaData(
        x.dataNascita,
      )}</td><td>${formattaData(x.scadenzaVisita)}</td></tr>`;
    });
    html += '</tbody></table>';
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write('<html><head><title>Stampa Atleti</title></head><body>' + html + '</body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
  });

  document.getElementById('close-view').onclick = () => {
    document.getElementById('modal').style.display = 'none';
  };

  document.getElementById('close-edit').onclick = () => {
    document.getElementById('modal-modifica').style.display = 'none';
  };

  mostraAtleti();
  aggiornaDashboard();
});

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('atleta-form');
  const lista = document.getElementById('atleti-list');
  let lastFiltro = 'all';

  // Carica atleti dal localStorage e assicura array valido
  function caricaAtleti() {
    try {
      let dati = localStorage.getItem('atleti');
      let arr = dati ? JSON.parse(dati) : [];
      if (!Array.isArray(arr)) return [];
      return arr;
    } catch {
      return [];
    }
  }
  // Salva atleta array nel localStorage
  function salvaAtleti(arr) {
    if (!Array.isArray(arr)) return;
    localStorage.setItem('atleti', JSON.stringify(arr));
  }
  // Genera ID univoco
  function generaId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }
  // Calcola età da data
  function calcolaEta(data) {
    if (!data) return "";
    const oggi = new Date();
    const nascita = new Date(data);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--;
    return eta;
  }
  // Calcola giorni fra due date ISO
  function daysBetween(date1, date2) {
    try {
      const d1 = new Date(date1 + 'T00:00:00');
      const d2 = new Date(date2 + 'T00:00:00');
      return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
    } catch {
      return 9999;
    }
  }
  // Stato colore visita medica
  function statoVisita(scadenza) {
    if (!scadenza) return 'ok';
    const oggi = new Date().toISOString().slice(0, 10);
    const diff = daysBetween(scadenza, oggi);
    if (diff < 0) return 'scaduta';
    if (diff <= 31) return 'scanza';
    return 'ok';
  }
  // Visualizza lista atleti
  function mostraAtleti(filtro = 'all') {
    const atleti = filtraAtleti(filtro);
    aggiornaDashboard();
    lista.innerHTML = '';
    if (atleti.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nessun atleta trovato';
      lista.appendChild(li);
      return;
    }
    atleti.forEach(atleta => {
      const eta = calcolaEta(atleta.dataNascita);
      const stato = statoVisita(atleta.scadenzaVisita);
      const classVisita = {
        ok: 'data-ok',
        scanza: 'data-scanza',
        scaduta: 'data-scaduta'
      }[stato] || 'data-ok';

      const li = document.createElement('li');
      li.innerHTML = `
      <span>
        <strong>${atleta.codiceAtleta}</strong> - ${atleta.nome} ${atleta.cognome} – ${atleta.sesso} – ${atleta.ruolo}
        <br>nato il ${formattaData(atleta.dataNascita)} – <strong>ETA':</strong> ${eta} – <strong>CF:</strong> ${atleta.codiceFiscale}
        <br><strong>Cell:</strong> ${atleta.cellulare}
        <br><span class="${classVisita}">SCADENZA VISITA: ${formattaData(atleta.scadenzaVisita)}</span>
      </span>
      <div class="btn-group">
        <button class="btn-small btn-visualizza" data-id="${atleta.id}">V</button>
        <button class="btn-small btn-modifica" data-id="${atleta.id}">M</button>
        <button class="btn-small btn-cancella" data-id="${atleta.id}">C</button>
      </div>
      `;
      lista.appendChild(li);
    });
    // Event handlers dei bottoni
    document.querySelectorAll('.btn-visualizza').forEach(b => b.onclick = () => {
      document.getElementById('modal').style.display = 'flex';
      visualizzaAtleta(b.dataset.id);
    });
    document.querySelectorAll('.btn-modifica').forEach(b => b.onclick = () => {
      document.getElementById('modal-modifica').style.display = 'flex';
      avviaModificaAtleta(b.dataset.id);
    });
    document.querySelectorAll('.btn-cancella').forEach(b => b.onclick = () => {
      cancellaAtleta(b.dataset.id);
    });
  }
  // Filtra atleti per sesso o stato visita
  function filtraAtleti(filtro) {
    let atleti = caricaAtleti();
    atleti = [...atleti].sort((a, b) => ((a.nome || "") + (a.cognome || "")).toUpperCase().localeCompare(((b.nome || "") + (b.cognome || "")).toUpperCase()));
    const oggi = new Date().toISOString().slice(0, 10);
    if (filtro === 'maschi') return atleti.filter(a => a.sesso === 'M');
    if (filtro === 'femmine') return atleti.filter(a => a.sesso === 'F');
    if (filtro === 'scadenza') return atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) >= 0 && daysBetween(a.scadenzaVisita, oggi) <= 31);
    if (filtro === 'scadute') return atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) < 0);
    return atleti;
  }
  // Aggiorna numeri dashboard
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
  // Format ISO date to gg/mm/aaaa  
  function formattaData(dataIso) {
    if (!dataIso) return '';
    const [anno, mese, giorno] = dataIso.split('-');
    return `${giorno}/${mese}/${anno}`;
  }
  // Popup visualizza atleta con evidenziazione scadenza colorata
  function visualizzaAtleta(id) {
    const atleti = caricaAtleti();
    const atleta = atleti.find(a => a.id === id) || {};
    const dataFormattata = formattaData(atleta.dataNascita);
    const eta = atleta.dataNascita ? calcolaEta(atleta.dataNascita) : '';
    const scadenzaFormattata = formattaData(atleta.scadenzaVisita);
    const codiceAtleta = atleta.codiceAtleta || '';
    const stato = statoVisita(atleta.scadenzaVisita);
    const classVisita = {ok:'data-ok', scanza:'data-scanza', scaduta:'data-scaduta'}[stato] || 'data-ok';

    document.getElementById('dettaglio-atleta').innerHTML = `
      <h2>${codiceAtleta} - ${atleta.nome || ''} ${atleta.cognome || ''}</h2>
      <p><strong>Sesso:</strong> ${atleta.sesso || ''}</p>
      <p><strong>Ruolo:</strong> ${atleta.ruolo || ''}</p>
      <p><strong>Data di Nascita:</strong> ${dataFormattata}</p>
      <p><strong>Età:</strong> ${eta}</p>
      <p><strong>Codice Fiscale:</strong> ${atleta.codiceFiscale || ''}</p>
      <p><strong>Cellulare:</strong> ${atleta.cellulare || ''}</p>
      <p><span class="${classVisita}">SCADENZA VISITA: ${scadenzaFormattata}</span></p>
    `;
  }
  // Popup modifica atleta con caricamento dati e validazione codice atleta 7 cifre univoco
  function avviaModificaAtleta(id) {
    let atleti = caricaAtleti();
    const idx = atleti.findIndex(a => a.id === id);
    if (idx === -1) return;
    const atleta = atleti[idx];

    document.getElementById('mod-codiceAtleta').value = atleta.codiceAtleta || '';
    document.getElementById('mod-nome').value = atleta.nome || '';
    document.getElementById('mod-cognome').value = atleta.cognome || '';
    document.getElementById('mod-sesso').value = atleta.sesso || '';
    document.getElementById('mod-dataNascita').value = atleta.dataNascita || '';
    document.getElementById('mod-ruolo').value = atleta.ruolo || '';
    document.getElementById('mod-codiceFiscale').value = atleta.codiceFiscale || '';
    document.getElementById('mod-cellulare').value = atleta.cellulare || '';
    document.getElementById('mod-scadenzaVisita').value = atleta.scadenzaVisita || '';

    // Memorizza id per salvataggio
    document.getElementById('modifica-form').dataset.editId = id;
  }

  // Gestione submit modifica
  document.getElementById('modifica-form').onsubmit = function(e) {
    e.preventDefault();
    let atleti = caricaAtleti();
    const id = this.dataset.editId;
    if (!id) {
      alert('Errore: id mancante');
      return;
    }
    const codiceAtleta = document.getElementById('mod-codiceAtleta').value.trim();
    if (!/^\d{7}$/.test(codiceAtleta)) {
      alert('Il Codice Atleta deve essere un numero di 7 cifre');
      return;
    }
    // Controllo univocità codice atleta
    const duplicato = atleti.some((a) => a.codiceAtleta === codiceAtleta && a.id !== id);
    if (duplicato) {
      alert('Codice Atleta duplicato, inserisci un codice univoco');
      return;
    }
    const idx = atleti.findIndex((a) => a.id === id);
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
      scadenzaVisita: document.getElementById('mod-scadenzaVisita').value
    };
    salvaAtleti(atleti);
    this.closest('.modal').style.display = 'none';
    mostraAtleti(lastFiltro);
    aggiornaDashboard();
  };

  // Gestione inserimento nuovo atleta
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const codiceAtleta = form.codiceAtleta.value.trim();
    if (!/^\d{7}$/.test(codiceAtleta)) {
      alert("Il Codice Atleta deve essere un numero di 7 cifre");
      return;
    }
    let atleti = caricaAtleti();
    if (atleti.some(a => a.codiceAtleta === codiceAtleta)) {
      alert("Codice Atleta duplicato, inserisci un codice diverso");
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

  // Filtri dashboard click
  document.querySelectorAll('.dash-card[data-filter]').forEach(card =>
    card.addEventListener('click', () => {
      lastFiltro = card.dataset.filter;
      mostraAtleti(lastFiltro);
    })
  );

  document.getElementById('close-view').onclick = () => document.getElementById('modal').style.display = 'none';
  document.getElementById('close-edit').onclick = () => document.getElementById('modal-modifica').style.display = 'none';

  // Esporta dati
  document.getElementById('export-btn').onclick = () => {
    const data = JSON.stringify(caricaAtleti(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'atleti-backup.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  // Importa dati
  document.getElementById('import-btn').onclick = () => document.getElementById('import-file').click();
  document.getElementById('import-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const arr = JSON.parse(ev.target.result);
        if (!Array.isArray(arr)) throw new Error('Formato JSON non valido');
        const current = caricaAtleti();
        const all = [...current];
        arr.forEach(newA => {
          const idx = all.findIndex(a => a.id === newA.id);
          if (idx > -1) all[idx] = newA;
          else all.push(newA);
        });
        salvaAtleti(all);
        mostraAtleti(lastFiltro);
        aggiornaDashboard();
        alert('Importazione dati avvenuta con successo!');
      } catch (err) {
        alert('Errore importazione dati: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  mostraAtleti();
  aggiornaDashboard();
});

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
    let età = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) età--;
    return età;
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
    const oggiStr = new Date().toISOString().slice(0, 10);
    const diff = daysBetween(scadenza, oggiStr);
    if (diff < 0) return 'scaduta';
    if (diff >= 0 && diff <= 31) return 'scanza';
    return 'ok';
  }

  function aggiornaDashboard() {
    const atleti = caricaAtleti();
    const oggiStr = new Date().toISOString().slice(0, 10);
    document.getElementById('tot-atleti').textContent = atleti.length;
    document.getElementById('tot-maschi').textContent = atleti.filter(a => a.sesso === 'M').length;
    document.getElementById('tot-femmine').textContent = atleti.filter(a => a.sesso === 'F').length;
    document.getElementById('tot-in-scadenza').textContent = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggiStr) >= 0 && daysBetween(a.scadenzaVisita, oggiStr) <= 31).length;
    document.getElementById('tot-scadute').textContent = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggiStr) < 0).length;
    const sommaEta = atleti.reduce((acc, a) => acc + (a.dataNascita ? calcolaEta(a.dataNascita) : 0), 0);
    document.getElementById('eta-media').textContent = atleti.length ? (sommaEta / atleti.length).toFixed(1) : 0;
  }

  function filtraAtleti(filtro) {
    let atleti = caricaAtleti();
    atleti = [...atleti].sort((a, b) => ((a.nome || "") + (a.cognome || "")).toUpperCase().localeCompare(((b.nome || "") + (b.cognome || "")).toUpperCase()));
    const oggi = new Date().toISOString().slice(0, 10);
    if (filtro === 'maschi') atleti = atleti.filter(a => a.sesso === 'M');
    else if (filtro === 'femmine') atleti = atleti.filter(a => a.sesso === 'F');
    else if (filtro === 'scadenza') atleti = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) >= 0 && daysBetween(a.scadenzaVisita, oggi) <= 31);
    else if (filtro === 'scadute') atleti = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) < 0);
    return atleti;
  }

  function mostraAtleti(filtro = 'all') {
    const atletiList = document.getElementById('atleti-list');
    atletiList.innerHTML = '';
    const visualizzati = filtraAtleti(filtro);
    aggiornaDashboard();

    if (!visualizzati.length) {
      const li = document.createElement('li');
      li.textContent = 'Nessun atleta trovato';
      atletiList.appendChild(li);
      return;
    }

    visualizzati.forEach(atleta => {
      if (!atleta.id) return;
      const codiceAtleta = atleta.codiceAtleta || '';
      const nome = atleta.nome || '';
      const cognome = atleta.cognome || '';
      const sesso = atleta.sesso || '';
      const ruolo = atleta.ruolo || '';
      const dataNascita = atleta.dataNascita || '';
      const codiceFiscale = atleta.codiceFiscale || '';
      const cellulare = atleta.cellulare || '';
      const eta = dataNascita ? calcolaEta(dataNascita) : '';
      const dataFormattata = formattaData(dataNascita);
      const scadenzaVisita = atleta.scadenzaVisita || '';
      const scadenzaFormattata = formattaData(scadenzaVisita);

      let classeVisita = 'data-ok';
      const stato = statoVisita(scadenzaVisita);
      if (stato === 'scanza') classeVisita = 'data-scanza';
      if (stato === 'scaduta') classeVisita = 'data-scaduta';

      const li = document.createElement('li');
      li.innerHTML = `
        <span>
          <strong>${codiceAtleta}</strong> - ${nome} ${cognome} – ${sesso} – ${ruolo}
          <br>nato il ${dataFormattata} – <strong>ETA':</strong> ${eta} – <strong>CF:</strong> ${codiceFiscale}
          <br><strong>Cell:</strong> ${cellulare}
          <br><span class="${classeVisita}">SCADENZA VISITA: ${scadenzaFormattata}</span>
        </span>
        <div class="btn-group">
          <button class="btn-small btn-visualizza" title="Visualizza" data-id="${atleta.id}">V</button>
          <button class="btn-small btn-modifica" title="Modifica" data-id="${atleta.id}">M</button>
          <button class="btn-small btn-cancella" title="Cancella" data-id="${atleta.id}">C</button>
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
      btn.onclick = () => cancellaAtleta(btn.dataset.id);
    });
  }

  function visualizzaAtleta(id) {
    let atleti = caricaAtleti();
    let atleta = atleti.find(a => a.id === id) || {};
    const dataFormattata = formattaData(atleta.dataNascita || '');
    const eta = atleta.dataNascita ? calcolaEta(atleta.dataNascita) : '';
    const scadenzaVisita = atleta.scadenzaVisita || '';
    const scadenzaFormattata = formattaData(scadenzaVisita);
    const codiceAtleta = atleta.codiceAtleta || '';

    let classeVisita = 'data-ok';
    const stato = statoVisita(scadenzaVisita);
    if (stato === 'scanza') classeVisita = 'data-scanza';
    if (stato === 'scaduta') classeVisita = 'data-scaduta';

    document.getElementById('dettaglio-atleta').innerHTML = `
      <h2>${codiceAtleta} - ${atleta.nome || ''} ${atleta.cognome || ''}</h2>
      <p><strong>Sesso:</strong> ${atleta.sesso || ''}</p>
      <p><strong>Ruolo:</strong> ${atleta.ruolo || ''}</p>
      <p><strong>Data di Nascita:</strong> ${dataFormattata}</p>
      <p><strong>Età:</strong> ${eta}</p>
      <p><strong>Codice Fiscale:</strong> ${atleta.codiceFiscale || ''}</p>
      <p><strong>Cellulare:</strong> ${atleta.cellulare || ''}</p>
      <p><span class="${classeVisita}">SCADENZA VISITA: ${scadenzaFormattata}</span></p>
    `;
  }

  function avviaModificaAtleta(id) {
    let atleti = caricaAtleti();
    const idx = atleti.findIndex(a => a.id === id);
    if (idx === -1) return;
    const atleta = atleti[idx] || {};
    document.getElementById('mod-codiceAtleta').value = atleta.codiceAtleta || '';
    document.getElementById('mod-nome').value = atleta.nome || '';
    document.getElementById('mod-cognome').value = atleta.cognome || '';
    document.getElementById('mod-sesso').value = atleta.sesso || '';
    document.getElementById('mod-dataNascita').value = atleta.dataNascita || '';
    document.getElementById('mod-ruolo').value = atleta.ruolo || '';
    document.getElementById('mod-codiceFiscale').value = atleta.codiceFiscale || '';
    document.getElementById('mod-cellulare').value = atleta.cellulare || '';
    document.getElementById('mod-scadenzaVisita').value = atleta.scadenzaVisita || '';
  }

  document.getElementById('modifica-form').onsubmit = function(e) {
    e.preventDefault();

    let atleti = caricaAtleti();
    const id = document.querySelector('.btn-modifica-active')?.dataset.id;
    if (!id) { alert("Errore interno: id atleta non trovato."); return; }

    const codiceAtleta = document.getElementById('mod-codiceAtleta').value.trim();
    if (!/^\d{7}$/.test(codiceAtleta)) {
      alert("Il Codice Atleta deve essere un numero di 7 cifre");
      return;
    }
    const duplicate = atleti.some((a, i) => a.codiceAtleta === codiceAtleta && a.id !== id);
    if(duplicate) {
      alert("Codice Atleta duplicato, inserisci un codice univoco");
      return;
    }

    const idx = atleti.findIndex(a => a.id === id);
    if(idx === -1) return;

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

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const codiceAtleta = form.codiceAtleta.value.trim();
    if (!/^\d{7}$/.test(codiceAtleta)) {
      alert("Il Codice Atleta deve essere un numero di 7 cifre");
      return;
    }
    let atleti = caricaAtleti();
    if(atleti.some(a => a.codiceAtleta === codiceAtleta)) {
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

  document.querySelectorAll('.dash-card[data-filter]').forEach(card => {
    card.addEventListener('click', () => {
      lastFiltro = card.dataset.filter;
      mostraAtleti(lastFiltro);
    });
  });

  document.getElementById('close-view').onclick = () => {
    document.getElementById('modal').style.display = 'none';
  };
  document.getElementById('close-edit').onclick = () => {
    document.getElementById('modal-modifica').style.display = 'none';
  };

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

  document.getElementById('import-btn').onclick = () => {
    document.getElementById('import-file').click();
  };

  document.getElementById('import-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const arr =

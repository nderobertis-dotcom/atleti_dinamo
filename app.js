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

  function mostraAtleti(filtro = 'all') {
    let atleti = caricaAtleti();

    atleti.sort((a,b) => ((a.nome||"")+(a.cognome||"")).toUpperCase().localeCompare(((b.nome||"")+(b.cognome||"")).toUpperCase()));

    if (filtro === 'maschi') atleti = atleti.filter(a => a.sesso === 'M');
    else if (filtro === 'femmine') atleti = atleti.filter(a => a.sesso === 'F');

    lista.innerHTML = '';

    if (atleti.length === 0) {
      lista.innerHTML = '<li>Nessun atleta trovato</li>';
      return;
    }

    for (const a of atleti) {
      const eta = calcolaEta(a.dataNascita);
      const li = document.createElement('li');
      li.innerHTML = `
       <span>${a.nome || ''} ${a.cognome || ''} - Sesso: ${a.sesso || ''} - Età: ${eta}</span>
       <div class="btn-group">
         <button class="btn-small btn-visualizza" data-id="${a.id}">V</button>
         <button class="btn-small btn-modifica" data-id="${a.id}">M</button>
         <button class="btn-small btn-cancella" data-id="${a.id}">C</button>
       </div>
      `;
      lista.appendChild(li);
    }

    document.querySelectorAll('.btn-visualizza').forEach(btn => {
      btn.onclick = function() {
        document.getElementById('modal').style.display = 'flex';
        visualizzaAtleta(this.dataset.id);
      };
    });
    document.querySelectorAll('.btn-modifica').forEach(btn => {
      btn.onclick = function() {
        document.getElementById('modal-modifica').style.display = 'flex';
        avviaModificaAtleta(this.dataset.id);
      };
    });
    document.querySelectorAll('.btn-cancella').forEach(btn => {
      btn.onclick = function() {
        cancellaAtleta(this.dataset.id);
      };
    });
  }

  function visualizzaAtleta(id) {
    let atleti = caricaAtleti();
    let atleta = atleti.find(a => a.id === id) || {};
    const dataFormattata = formattaData(atleta.dataNascita || "");
    const eta = atleta.dataNascita ? calcolaEta(atleta.dataNascita) : "";

    document.getElementById('dettaglio-atleta').innerHTML = `
      <h2>${(atleta.nome || '')} ${(atleta.cognome || '')}</h2>
      <p><strong>Sesso:</strong> ${(atleta.sesso || '')}</p>
      <p><strong>Ruolo:</strong> ${(atleta.ruolo || '')}</p>
      <p><strong>Data di Nascita:</strong> ${dataFormattata}</p>
      <p><strong>Età:</strong> ${eta}</p>
      <p><strong>Codice Fiscale:</strong> ${(atleta.codiceFiscale || '')}</p>
      <p><strong>Cellulare:</strong> ${(atleta.cellulare || '')}</p>
      <p><strong>Scadenza Visita Medica:</strong> ${(atleta.scadenzaVisita || '')}</p>
    `;
  }

  function avviaModificaAtleta(id) {
    let atleti = caricaAtleti();
    const idx = atleti.findIndex(a => a.id === id);
    if (idx === -1) return;
    const atleta = atleti[idx] || {};
    document.getElementById('mod-nome').value = (atleta.nome || '');
    document.getElementById('mod-cognome').value = (atleta.cognome || '');
    document.getElementById('mod-sesso').value = (atleta.sesso || '');
    document.getElementById('mod-dataNascita').value = (atleta.dataNascita || '');
    document.getElementById('mod-ruolo').value = (atleta.ruolo || '');
    document.getElementById('mod-codiceFiscale').value = (atleta.codiceFiscale || '');
    document.getElementById('mod-cellulare').value = (atleta.cellulare || '');
    document.getElementById('mod-scadenzaVisita').value = (atleta.scadenzaVisita || '');

    document.getElementById('modifica-form').onsubmit = function(e) {
      e.preventDefault();
      atleti[idx] = {
        ...atleti[idx],
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
      document.getElementById('modal-modifica').style.display = 'none';
      mostraAtleti(lastFiltro);
    };
  }

  function cancellaAtleta(id) {
    let atleti = caricaAtleti();
    const idx = atleti.findIndex(a => a.id === id);
    if (idx === -1) return;
    if (confirm('Vuoi cancellare questo atleta?')) {
      atleti.splice(idx, 1);
      salvaAtleti(atleti);
      mostraAtleti(lastFiltro);
    }
  }

  function formattaData(dataIso) {
    if (!dataIso) return "";
    const [anno, mese, giorno] = dataIso.split('-');
    return `${giorno}/${mese}/${anno}`;
  }

  function aggiornaDashboard() {
    const atleti = caricaAtleti();
    const oggiStr = new Date().toISOString().slice(0,10);
    document.getElementById("tot-atleti").textContent = atleti.length;
    document.getElementById("tot-maschi").textContent = atleti.filter(a => a.sesso === "M").length;
    document.getElementById("tot-femmine").textContent = atleti.filter(a => a.sesso === "F").length;
    document.getElementById("tot-in-scadenza").textContent = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggiStr) >= 0 && daysBetween(a.scadenzaVisita, oggiStr) <= 31).length;
    document.getElementById("tot-scadute").textContent = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggiStr) < 0).length;
    const sommaEta = atleti.reduce((acc, a) => acc + (a.dataNascita ? calcolaEta(a.dataNascita) : 0), 0);
    document.getElementById("eta-media").textContent = atleti.length? (sommaEta / atleti.length).toFixed(1) : 0;
  }

  function daysBetween(d1, d2) {
    try {
      const date1 = new Date(d1 + 'T00:00:00');
      const date2 = new Date(d2 + 'T00:00:00');
      return Math.floor((date1 - date2) / (1000*60*60*24));
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

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const nome = form.nome.value.trim().toUpperCase();
    const cognome = form.cognome.value.trim().toUpperCase();
    const sesso = form.sesso.value.toUpperCase();
    const dataNascita = form.dataNascita.value;
    const ruolo = form.ruolo.value.toUpperCase();
    const codiceFiscale = form.codiceFiscale.value.trim().toUpperCase();
    const cellulare = form.cellulare.value.trim();
    const scadenzaVisita = form.scadenzaVisita.value;

    if (!nome || !cognome || !sesso || !dataNascita || !ruolo || !codiceFiscale || !cellulare || !scadenzaVisita) {
      alert('Compila tutti i campi.');
      return;
    }
    let atleti = caricaAtleti();
    atleti.push({ id: generaId(), nome, cognome, sesso, dataNascita, ruolo, codiceFiscale, cellulare, scadenzaVisita });
    salvaAtleti(atleti);
    mostraAtleti();
  });

  document.querySelectorAll('.dash-card[data-filter]').forEach(card => {
    card.addEventListener('click', () => {
      lastFiltro = card.dataset.filter;
      mostraAtleti(lastFiltro);
    });
  });

  document.getElementById('close-view').onclick = () => { document.getElementById('modal').style.display = 'none'; };
  document.getElementById('close-edit').onclick = () => { document.getElementById('modal-modifica').style.display = 'none'; };

  // Eventuali import/export, o altre funzionalità aggiuntive...

  mostraAtleti();
  aggiornaDashboard();
});

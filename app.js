function caricaAtleti() {
  let atleti = [];
  try {
    const dati = localStorage.getItem('atleti');
    if (dati) {
      atleti = JSON.parse(dati);
      if (!Array.isArray(atleti)) atleti = [];
    }
  } catch {
    atleti = [];
  }
  return atleti;
}
function salvaAtleti(atleti) {
  try {
    localStorage.setItem('atleti', JSON.stringify(atleti));
  } catch {}
}

// Crea un identificatore unico (UUID-like) breve per ogni atleta
function generaIdAtleta() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 6)
  );
}

function aggiornaDashboard() {
  let atleti = caricaAtleti();
  const totale = atleti.length;
  const maschi = atleti.filter(a => a.sesso === "M").length;
  const femmine = atleti.filter(a => a.sesso === "F").length;
  const sommaEta = atleti.reduce((acc, a) => acc + (a.dataNascita ? calcolaEta(a.dataNascita) : 0), 0);
  const etaMedia = totale > 0 ? (sommaEta / totale).toFixed(1) : 0;
  document.getElementById("tot-atleti").textContent = totale;
  document.getElementById("tot-maschi").textContent = maschi;
  document.getElementById("tot-femmine").textContent = femmine;
  document.getElementById("eta-media").textContent = etaMedia;
}

function mostraAtleti() {
  const atletiList = document.getElementById('atleti-list');
  atletiList.innerHTML = '';
  let atleti = caricaAtleti();

  // Array ordinato alfabeticamente con ID univoco!
  let atletiOrdinati = [...atleti].sort((a, b) => {
    const ana = ((a.nome || "") + " " + (a.cognome || "")).toUpperCase();
    const anb = ((b.nome || "") + " " + (b.cognome || "")).toUpperCase();
    return ana.localeCompare(anb);
  });

  atletiOrdinati.forEach((atleta) => {
    if (!atleta.id) return; // sicurezza
    const nome = atleta.nome || "";
    const cognome = atleta.cognome || "";
    const sesso = atleta.sesso || "";
    const ruolo = atleta.ruolo || "";
    const dataNascita = atleta.dataNascita || "";
    const codiceFiscale = atleta.codiceFiscale || "";
    const cellulare = atleta.cellulare || "";
    const eta = dataNascita ? calcolaEta(dataNascita) : "";
    const dataFormattata = formattaData(dataNascita);

    const li = document.createElement('li');
    li.innerHTML = `
      <span>
        ${nome} ${cognome} – ${sesso} – ${ruolo}
        <br>nato il ${dataFormattata} – <strong>ETA':</strong> ${eta} – <strong>CF:</strong> ${codiceFiscale}
        <br><strong>Cell:</strong> ${cellulare}
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
    btn.onclick = function() { visualizzaAtleta(this.dataset.id); };
  });
  document.querySelectorAll('.btn-cancella').forEach(btn => {
    btn.onclick = function() { cancellaAtleta(this.dataset.id); };
  });
  document.querySelectorAll('.btn-modifica').forEach(btn => {
    btn.onclick = function() { avviaModificaAtleta(this.dataset.id); };
  });
}

function calcolaEta(dataNascita) {
  if (!dataNascita) return "";
  const oggi = new Date();
  const nascita = new Date(dataNascita);
  let eta = oggi.getFullYear() - nascita.getFullYear();
  const m = oggi.getMonth() - nascita.getMonth();
  if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) {
    eta--;
  }
  return eta;
}

function formattaData(dataIso) {
  if (!dataIso) return "";
  const [anno, mese, giorno] = dataIso.split("-");
  return `${giorno}/${mese}/${anno}`;
}

function visualizzaAtleta(id) {
  let atleti = caricaAtleti();
  let atleta = atleti.find(a => a.id === id) || {};
  const dataFormattata = formattaData(atleta.dataNascita || "");
  const eta = atleta.dataNascita ? calcolaEta(atleta.dataNascita) : "";

  document.getElementById('dettaglio-atleta').innerHTML = `
    <h2>${(atleta.nome || "")} ${(atleta.cognome || "")}</h2>
    <p><strong>Sesso:</strong> ${(atleta.sesso || "")}</p>
    <p><strong>Ruolo:</strong> ${(atleta.ruolo || "")}</p>
    <p><strong>Data di Nascita:</strong> ${dataFormattata}</p>
    <p><strong>Età:</strong> ${eta}</p>
    <p><strong>Codice Fiscale:</strong> ${(atleta.codiceFiscale || "")}</p>
    <p><strong>Cellulare:</strong> ${(atleta.cellulare || "")}</p>
  `;
  document.getElementById('modal').style.display = 'flex';
  document.querySelector('.close-btn').onclick = function() {
    document.getElementById('modal').style.display = 'none';
  };
}

// ------- OPERAZIONI CRUD -------
function cancellaAtleta(id) {
  let atleti = caricaAtleti();
  const idx = atleti.findIndex(a => a.id === id);
  if(idx === -1) return;
  if(confirm("Vuoi cancellare questo atleta?")) {
    atleti.splice(idx, 1);
    salvaAtleti(atleti);
    mostraAtleti();
    aggiornaDashboard();
  }
}
function avviaModificaAtleta(id) {
  let atleti = caricaAtleti();
  const idx = atleti.findIndex(a => a.id === id);
  if(idx === -1) return;
  const atleta = atleti[idx] || {};
  document.getElementById('mod-nome').value = (atleta.nome || "");
  document.getElementById('mod-cognome').value = (atleta.cognome || "");
  document.getElementById('mod-sesso').value = (atleta.sesso || "");
  document.getElementById('mod-dataNascita').value = (atleta.dataNascita || "");
  document.getElementById('mod-ruolo').value = (atleta.ruolo || "");
  document.getElementById('mod-codiceFiscale').value = (atleta.codiceFiscale || "");
  document.getElementById('mod-cellulare').value = (atleta.cellulare || "");

  document.getElementById('modal-modifica').style.display = 'flex';

  document.querySelector('.close-btn-modifica').onclick = function() {
    document.getElementById('modal-modifica').style.display = 'none';
  };

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
      cellulare: document.getElementById('mod-cellulare').value.trim()
    };
    salvaAtleti(atleti);
    document.getElementById('modal-modifica').style.display = 'none';
    mostraAtleti();
    aggiornaDashboard();
  };
}

// ------ INSERIMENTO --------
document.addEventListener('DOMContentLoaded', function() {
  mostraAtleti();
  aggiornaDashboard();

  document.getElementById('atleta-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value.trim().toUpperCase();
    const cognome = document.getElementById('cognome').value.trim().toUpperCase();
    const sesso = document.getElementById('sesso').value.toUpperCase();
    const dataNascita = document.getElementById('dataNascita').value;
    const ruolo = document.getElementById('ruolo').value.toUpperCase();
    const codiceFiscale = document.getElementById('codiceFiscale').value.trim().toUpperCase();
    const cellulare = document.getElementById('cellulare').value.trim();

    if (!nome || !cognome || !sesso || !dataNascita || !ruolo || !codiceFiscale || !cellulare) {
      alert('Per favore compila tutti i campi.');
      return;
    }

    let atleti = caricaAtleti();
    const nuovoAtleta = {
      id: generaIdAtleta(),
      nome, cognome, sesso, dataNascita, ruolo, codiceFiscale, cellulare
    };
    atleti.push(nuovoAtleta);
    salvaAtleti(atleti);
    mostraAtleti();
    aggiornaDashboard();
    this.reset();
  });
});

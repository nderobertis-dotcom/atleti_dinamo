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

function generaIdAtleta() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 6)
  );
}
function daysBetween(date1, date2) {
  try {
    const d1 = new Date(date1 + 'T00:00:00');
    const d2 = new Date(date2 + 'T00:00:00');
    return Math.floor((d1 - d2)/(1000*60*60*24));
  } catch {
    return 9999;
  }
}
function statoVisita(scadenza) {
  if (!scadenza) return 'ok';
  const oggi = new Date();
  const oggiStr = oggi.toISOString().slice(0, 10);
  const diff = daysBetween(scadenza, oggiStr);
  if (diff < 0) return 'ok';
  if (diff === 0) return 'scadenza';
  if (diff <= 31) return 'scadenza';
  return 'scaduta';
}
function aggiornaDashboard() {
  let atleti = caricaAtleti();
  const totale = atleti.length;
  const maschi = atleti.filter(a => a.sesso === "M").length;
  const femmine = atleti.filter(a => a.sesso === "F").length;
  const oggi = new Date().toISOString().slice(0,10);
  const scadute = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) > 31).length;
  const inScadenza = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) >=0 && daysBetween(a.scadenzaVisita, oggi) <=31).length;
  const sommaEta = atleti.reduce((acc, a) => acc + (a.dataNascita ? calcolaEta(a.dataNascita) : 0), 0);
  const etaMedia = totale > 0 ? (sommaEta / totale).toFixed(1) : 0;

  document.getElementById("tot-atleti").textContent = totale;
  document.getElementById("tot-maschi").textContent = maschi;
  document.getElementById("tot-femmine").textContent = femmine;
  document.getElementById("tot-in-scadenza").textContent = inScadenza;
  document.getElementById("tot-scadute").textContent = scadute;
  document.getElementById("eta-media").textContent = etaMedia;
}

function mostraAtleti(filtroList='all') {
  const atletiList = document.getElementById('atleti-list');
  atletiList.innerHTML = '';
  let atleti = caricaAtleti();
  let atletiOrdinati = [...atleti].sort((a, b) => {
    const ana = ((a.nome || "") + " " + (a.cognome || "")).toUpperCase();
    const anb = ((b.nome || "") + " " + (b.cognome || "")).toUpperCase();
    return ana.localeCompare(anb);
  });

  const oggi = new Date().toISOString().slice(0,10);
  let visualizzati = [];
  if(filtroList==='maschi') visualizzati = atletiOrdinati.filter(a=>a.sesso==="M");
  else if(filtroList==='femmine') visualizzati = atletiOrdinati.filter(a=>a.sesso==="F");
  else if(filtroList==='scadenza') visualizzati = atletiOrdinati.filter(a=>a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) >=0 && daysBetween(a.scadenzaVisita, oggi)<=31);
  else if(filtroList==='scadute') visualizzati = atletiOrdinati.filter(a=>a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) > 31);
  else visualizzati = atletiOrdinati; // default: all

  if (visualizzati.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = `<span>Nessun atleta trovato</span>`;
    atletiList.appendChild(li);
    return;
  }

  visualizzati.forEach((atleta) => {
    if (!atleta.id) return;
    const nome = atleta.nome || "";
    const cognome = atleta.cognome || "";
    const sesso = atleta.sesso || "";
    const ruolo = atleta.ruolo || "";
    const dataNascita = atleta.dataNascita || "";
    const codiceFiscale = atleta.codiceFiscale || "";
    const cellulare = atleta.cellulare || "";
    const eta = dataNascita ? calcolaEta(dataNascita) : "";
    const dataFormattata = formattaData(dataNascita);
    const scadenzaVisita = atleta.scadenzaVisita || "";
    const scadenzaFormattata = formattaData(scadenzaVisita);

    let classeVisita = "data-ok";
    const stato = statoVisita(scadenzaVisita);
    if (stato === 'scadenza') classeVisita = "data-scanza";
    if (stato === 'scaduta') classeVisita = "data-scaduta";

    const li = document.createElement('li');
    li.innerHTML = `
      <span>
        ${nome} ${cognome} – ${sesso} – ${ruolo}
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
  if (m < 0 || (m===0 && oggi.getDate() < nascita.getDate())) eta--;
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
  const scadenzaVisita = atleta.scadenzaVisita || "";
  const scadenzaFormattata = formattaData(scadenzaVisita);

  let classeVisita = "data-ok";
  const stato = statoVisita(scadenzaVisita);
  if (stato === 'scadenza') classeVisita = "data-scanza";
  if (stato === 'scaduta') classeVisita = "data-scaduta";

  document.getElementById('dettaglio-atleta').innerHTML = `
    <h2>${(atleta.nome || "")} ${(atleta.cognome || "")}</h2>
    <p><strong>Sesso:</strong> ${(atleta.sesso || "")}</p>
    <p><strong>Ruolo:</strong> ${(atleta.ruolo || "")}</p>
    <p><strong>Data di Nascita:</strong> ${dataFormattata}</p>
    <p><strong>Età:</strong> ${eta}</p>
    <p><strong>Codice Fiscale:</strong> ${(atleta.codiceFiscale || "")}</p>
    <p><strong>Cellulare:</strong> ${(atleta.cellulare || "")}</p>
    <p><span class="${classeVisita}">SCADENZA VISITA: ${scadenzaFormattata}</span></p>
  `;
  document.getElementById('modal').style.display = 'flex';
  document.querySelector('.close-btn').onclick = function() {
    document.getElementById('modal').style.display = 'none';
  };
}
function cancellaAtleta(id) {
  let atleti = caricaAtleti();
  const idx = atleti.findIndex(a => a.id === id);
  if(idx === -1) return;
  if(confirm("Vuoi cancellare questo atleta?")) {
    atleti.splice(idx, 1);
    salvaAtleti(atleti);
    mostraAtleti(lastFiltro);
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
  document.getElementById('mod-scadenzaVisita').value = (atleta.scadenzaVisita || "");

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
      cellulare: document.getElementById('mod-cellulare').value.trim(),
      scadenzaVisita: document.getElementById('mod-scadenzaVisita').value
    };
    salvaAtleti(atleti);
    document.getElementById('modal-modifica').style.display = 'none';
    mostraAtleti(lastFiltro);
    aggiornaDashboard();
  };
}
let lastFiltro = "all";
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
    const scadenzaVisita = document.getElementById('scadenzaVisita').value;

    if (!nome || !cognome || !sesso || !dataNascita || !ruolo || !codiceFiscale || !cellulare || !scadenzaVisita) {
      alert('Per favore compila tutti i campi.');
      return;
    }

    let atleti = caricaAtleti();
    const nuovoAtleta = {
      id: generaIdAtleta(),
      nome, cognome, sesso, dataNascita, ruolo, codiceFiscale, cellulare, scadenzaVisita
    };
    atleti.push(nuovoAtleta);
    salvaAtleti(atleti);
    mostraAtleti(lastFiltro);
    aggiornaDashboard();
    this.reset();
  });

  document.querySelectorAll('.dash-card[data-filter]').forEach(card => {
    card.addEventListener('click', function() {
      lastFiltro = card.dataset.filter;
      mostraAtleti(lastFiltro);
    });
  });
});

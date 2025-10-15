function caricaAtleti() {
  let atleti;
  try {
    atleti = JSON.parse(localStorage.getItem('atleti'));
  } catch { atleti = []; }
  if (!Array.isArray(atleti)) atleti = [];
  return atleti;
}

function salvaAtleti(atleti) {
  if (!Array.isArray(atleti)) atleti = [];
  localStorage.setItem('atleti', JSON.stringify(atleti));
}

function generaIdAtleta() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2,8);
}
function daysBetween(date1, date2) {
  try {
    const d1 = new Date(date1 + 'T00:00:00');
    const d2 = new Date(date2 + 'T00:00:00');
    return Math.floor((d1 - d2)/(1000*60*60*24));
  } catch { return 9999; }
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
  const oggi = new Date().toISOString().slice(0,10);
  document.getElementById("tot-atleti").textContent = atleti.length;
  document.getElementById("tot-maschi").textContent = atleti.filter(a => a.sesso === "M").length;
  document.getElementById("tot-femmine").textContent = atleti.filter(a => a.sesso === "F").length;
  document.getElementById("tot-in-scadenza").textContent = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) >=0 && daysBetween(a.scadenzaVisita, oggi)<=31).length;
  document.getElementById("tot-scadute").textContent = atleti.filter(a => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) < 0).length;
  const sommaEta = atleti.reduce((acc, a) => acc + (a.dataNascita ? calcolaEta(a.dataNascita) : 0), 0);
  document.getElementById("eta-media").textContent = atleti.length > 0 ? (sommaEta / atleti.length).toFixed(1) : 0;
}
function filtraAtleti(filtro) {
  let atleti = caricaAtleti();
  atleti = [...atleti].sort((a, b) => ((a.nome||"")+(a.cognome||"")).localeCompare((b.nome||"")+(b.cognome||"")));
  const oggi = new Date().toISOString().slice(0,10);
  if(filtro==='maschi') return atleti.filter(a=>a.sesso==="M");
  if(filtro==='femmine') return atleti.filter(a=>a.sesso==="F");
  if(filtro==='scadenza') return atleti.filter(a=>a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) >=0 && daysBetween(a.scadenzaVisita, oggi)<=31);
  if(filtro==='scadute') return atleti.filter(a=>a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) < 0);
  return atleti;
}
function mostraAtleti(filtroList='all') {
  const atletiList = document.getElementById('atleti-list');
  atletiList.innerHTML = '';
  const visualizzati = filtraAtleti(filtroList);
  aggiornaDashboard();

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
    if (stato === 'scanza') classeVisita = "data-scanza";
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
    btn.onclick = function() { document.getElementById('modal').style.display = 'flex'; visualizzaAtleta(this.dataset.id); };
  });
  document.querySelectorAll('.btn-cancella').forEach(btn => {
    btn.onclick = function() { cancellaAtleta(this.dataset.id); };
  });
  document.querySelectorAll('.btn-modifica').forEach(btn => {
    btn.onclick = function() { document.getElementById('modal-modifica').style.display = 'flex'; avviaModificaAtleta(this.dataset.id); };
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
  if (stato === 'scanza') classeVisita = "data-scanza";
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
}
function cancellaAtleta(id) {
  let atleti = caricaAtleti();
  const idx = atleti.findIndex(a => a.id === id);
  if(idx === -1) return;
  if(confirm("Vuoi cancellare questo atleta?")) {
    atleti.splice(idx, 1);
    salvaAtleti(atleti);
    mostraAtleti(lastFiltro);
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
function esportaAtleti() {
  const data = JSON.stringify(caricaAtleti(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'atleti-backup.json';
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}
function importaAtleti(json) {
  let arr;
  try {
    arr = JSON.parse(json);
  } catch { arr = []; }
  if (!Array.isArray(arr)) arr = [];
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
  alert("Importazione dati avvenuta!");
}
let lastFiltro = "all";
document.addEventListener('DOMContentLoaded', function() {
  mostraAtleti();
  aggiornaDashboard();

  document.getElementById('close-view').onclick = function() { document.getElementById('modal').style.display = 'none'; };
  document.getElementById('close-edit').onclick = function() { document.getElementById('modal-modifica').style.display = 'none'; };

  document.getElementById('atleta-form').addEventListener('submit', function(event) {
    event.preventDefault();

    let atleti = caricaAtleti();
    if (!Array.isArray(atleti)) atleti = [];
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
    atleti.push({
      id: generaIdAtleta(),
      nome, cognome, sesso, dataNascita, ruolo, codiceFiscale, cellulare, scadenzaVisita
    });
    salvaAtleti(atleti);
    mostraAtleti(lastFiltro);
  });

  document.querySelectorAll('.dash-card[data-filter]').forEach(card => {
    card.addEventListener('click', function() {
      lastFiltro = card.dataset.filter;
      mostraAtleti(lastFiltro);
    });
  });

  document.getElementById('export-btn').onclick = esportaAtleti;
  document.getElementById('import-btn').onclick = function() {
    document.getElementById('import-file').click();
  };
  document.getElementById('import-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      importaAtleti(ev.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  });
});

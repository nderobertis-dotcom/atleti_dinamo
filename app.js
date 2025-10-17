const tableBody = document.querySelector("#atleti-list tbody");
let filtroAttivo = "all";

function splitName(cognome, nome) {
  return `<b>${cognome}</b>${nome ? "<br>" + nome.trim().replace(/\s+/g, " ") : ""}`;
}

function formattaData(data) {
  if (!data) return "";
  const [a, m, g] = data.split("-");
  return `${g}/${m}/${a}`;
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

function statoVisita(data) {
  if (!data) return "data-ok";
  const oggi = new Date().toISOString().slice(0, 10);
  const diff = (new Date(data) - new Date(oggi)) / (1000 * 3600 * 24);
  if (diff < 0) return "data-scaduta";
  if (diff <= 30) return "data-scanza";
  return "data-ok";
}

function filtraAtleti(filtro) {
  let lista = caricaAtleti();
  if (filtro === "maschi") lista = lista.filter(a => a.sesso === "M");
  else if (filtro === "femmine") lista = lista.filter(a => a.sesso === "F");
  else if (filtro === "scadenza") {
    const oggi = new Date().toISOString().slice(0, 10);
    lista = lista.filter(a => a.scadenzaVisita && new Date(a.scadenzaVisita) >= new Date(oggi) && new Date(a.scadenzaVisita) <= new Date(new Date(oggi).getTime() + 30 * 24 * 3600 * 1000));
  }
  else if (filtro === "scadute") {
    const oggi = new Date().toISOString().slice(0, 10);
    lista = lista.filter(a => a.scadenzaVisita && new Date(a.scadenzaVisita) < new Date(oggi));
  }
  return lista;
}

function caricaAtleti() {
  try {
    return JSON.parse(localStorage.getItem("atleti")) || [];
  } catch {
    return [];
  }
}

function salvaAtleti(lista) {
  localStorage.setItem("atleti", JSON.stringify(lista));
}

function aggiornaDashboard() {
  const lista = caricaAtleti();
  const oggi = new Date().toISOString().slice(0, 10);
  document.getElementById("tot-atleti").textContent = lista.length;
  document.getElementById("tot-maschi").textContent = lista.filter(a => a.sesso === "M").length;
  document.getElementById("tot-femmine").textContent = lista.filter(a => a.sesso === "F").length;
  document.getElementById("tot-in-scadenza").textContent = lista.filter(a =>
    a.scadenzaVisita && new Date(a.scadenzaVisita) >= new Date(oggi) && new Date(a.scadenzaVisita) <= new Date(new Date(oggi).getTime() + 30 * 24 * 3600 * 1000)
  ).length;
  document.getElementById("tot-scadute").textContent = lista.filter(a => a.scadenzaVisita && new Date(a.scadenzaVisita) < new Date(oggi)).length;
  const totEta = lista.reduce((sum, a) => sum + (a.dataNascita ? calcolaEta(a.dataNascita) : 0), 0);
  document.getElementById("eta-media").textContent = lista.length ? (totEta / lista.length).toFixed(1) : 0;
}

function mostraAtleti(filtro = filtroAttivo) {
  filtroAttivo = filtro;
  const lista = filtraAtleti(filtro);
  tableBody.innerHTML = "";
  aggiornaDashboard();
  if (!lista.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="9">Nessun atleta trovato</td>`;
    tableBody.appendChild(tr);
    return;
  }
  lista.forEach(x => {
    const statoCls = statoVisita(x.scadenzaVisita);
    const tr1 = document.createElement("tr");
    tr1.innerHTML = `
      <td class="cognome-nome"><strong>${splitName(x.cognome, x.nome)}</strong></td>
      <td>${x.sesso}</td>
      <td>${x.ruolo}</td>
      <td>${formattaData(x.dataNascita)}</td>
      <td>${calcolaEta(x.dataNascita)}</td>
      <td class="td-cf">${x.codiceFiscale}</td>
      <td class="td-code">${x.codiceAtleta}</td>
      <td class="td-cell">${x.cellulare}</td>
      <td>
        <div class="btn-group">
          <button class="btn-round btn-visualizza" data-id="${x.id}" title="Visualizza">V</button>
          <button class="btn-round btn-modifica" data-id="${x.id}" title="Modifica">M</button>
          <button class="btn-round btn-cancella" data-id="${x.id}" title="Cancella">C</button>
        </div>
      </td>
    `;
    const tr2 = document.createElement("tr");
    tr2.className = "info-extra";
    tr2.innerHTML = `
      <td colspan="9">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="label-scadenza">Scadenza Visita:</span>
          <span class="${statoCls}">${formattaData(x.scadenzaVisita)}</span>
          <span class="label-certificato">Certificato:</span>
          ${x.certificatoMedico ? '<span style="color:#45d345; font-weight:bold;">CARICATO</span>' : '<span style="color:#e63946;font-weight:bold;">NON PRESENTE</span>'}
        </div>
        <div class="iban-row">
          <span class="label-iban">IBAN:</span>
          <span>${x.iban ? x.iban : '<span style="color:#e63946;">NON PRESENTE</span>'}</span>
        </div>
      </td>
    `;
    tableBody.appendChild(tr1);
    tableBody.appendChild(tr2);
  });
  document.querySelectorAll(".btn-cancella").forEach(b => b.onclick = () => cancella(b.dataset.id));
  document.querySelectorAll(".btn-visualizza").forEach(b => b.onclick = () => visualizza(b.dataset.id));
  document.querySelectorAll(".btn-modifica").forEach(b => b.onclick = () => modifica(b.dataset.id));
}

function cancella(id) {
  let lista = caricaAtleti();
  lista = lista.filter(a => a.id !== id);
  salvaAtleti(lista);
  mostraAtleti();
}

function visualizza(id) {
  const atleta = caricaAtleti().find(a => a.id === id);
  if (!atleta) return;
  const statoCls = statoVisita(atleta.scadenzaVisita);
  const modVis = document.getElementById("modal");
  document.getElementById("dettaglio-atleta").innerHTML = `
    <h2><span style='color:#0080ff'>${atleta.cognome} ${atleta.nome}</span></h2>
    <p><strong>Codice Atleta:</strong> ${atleta.codiceAtleta}</p>
    <p><strong>Sesso:</strong> ${atleta.sesso}</p>
    <p><strong>Ruolo:</strong> ${atleta.ruolo}</p>
    <p><strong>Data di Nascita:</strong> ${formattaData(atleta.dataNascita)}</p>
    <p><strong>Età:</strong> ${calcolaEta(atleta.dataNascita)}</p>
    <p><strong>Codice Fiscale:</strong> ${atleta.codiceFiscale}</p>
    <p><strong>Cellulare:</strong> ${atleta.cellulare}</p>
    <p><span class="label-scadenza">Scadenza Visita:</span><span class="${statoCls}">${formattaData(atleta.scadenzaVisita)}</span></p>
    <p><span class="label-certificato">Certificato:</span> ${
      atleta.certificatoMedico
        ? `<span style="color:#45d345;font-weight:bold;">CARICATO</span>`
        : `<span style="color:#e63946;font-weight:bold;">NON PRESENTE</span>`
    }</p>
    <p><span class="label-iban">IBAN:</span> <span>${atleta.iban ? atleta.iban : "<span style='color:#e63946;'>NON PRESENTE</span>"}</span></p>
  `;
  modVis.style.display = "flex";
}

function modifica(id) {
  const atleta = caricaAtleti().find(a => a.id === id);
  if (!atleta) return;
  const modFrm = document.getElementById("modifica-form");
  modFrm.dataset.id = id;
  modFrm["mod-codiceAtleta"].value = atleta.codiceAtleta || "";
  modFrm["mod-nome"].value = atleta.nome || "";
  modFrm["mod-cognome"].value = atleta.cognome || "";
  modFrm["mod-sesso"].value = atleta.sesso || "";
  modFrm["mod-dataNascita"].value = atleta.dataNascita || "";
  modFrm["mod-ruolo"].value = atleta.ruolo || "";
  modFrm["mod-codiceFiscale"].value = atleta.codiceFiscale || "";
  modFrm["mod-cellulare"].value = atleta.cellulare || "";
  modFrm["mod-scadenzaVisita"].value = atleta.scadenzaVisita || "";
  modFrm["mod-iban"].value = atleta.iban || "";
  modFrm["mod-certificatoMedico"].value = "";
  document.getElementById("modal-modifica").style.display = "flex";
}

document
  .getElementById("modifica-form")
  .addEventListener("submit", e => {
    e.preventDefault();
    const modFrm = e.target;
    const id = modFrm.dataset.id;
    let lista = caricaAtleti();
    const idx = lista.findIndex(a => a.id === id);
    if (idx === -1) return;

    lista[idx].codiceAtleta = modFrm["mod-codiceAtleta"].value.trim();
    lista[idx].nome = modFrm["mod-nome"].value.trim();
    lista[idx].cognome = modFrm["mod-cognome"].value.trim();
    lista[idx].sesso = modFrm["mod-sesso"].value;
    lista[idx].dataNascita = modFrm["mod-dataNascita"].value;
    lista[idx].ruolo = modFrm["mod-ruolo"].value.trim();
    lista[idx].codiceFiscale = modFrm["mod-codiceFiscale"].value.trim();
    lista[idx].cellulare = modFrm["mod-cellulare"].value.trim();
    lista[idx].scadenzaVisita = modFrm["mod-scadenzaVisita"].value;
    lista[idx].iban = modFrm["mod-iban"].value.trim();
    // Per ora non gestiamo il PDF qui
    salvaAtleti(lista);
    mostraAtleti();
    document.getElementById("modal-modifica").style.display = "none";
  });

document.getElementById("close-view").onclick = () => {
  document.getElementById("modal").style.display = "none";
};
document.getElementById("close-edit").onclick = () => {
  document.getElementById("modal-modifica").style.display = "none";
};
document.getElementById("export-btn").onclick = () => {
  const lista = caricaAtleti();
  if (!lista.length) return alert("Nessun atleta da esportare!");
  const json = JSON.stringify(lista, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "atleti-backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
document.getElementById("import-btn").onclick = () => {
  document.getElementById("import-file").click();
};
document.getElementById("import-file").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const arr = JSON.parse(ev.target.result);
      salvaAtleti(arr);
      mostraAtleti();
      alert("Import eseguito!");
    } catch {
      alert("Errore nel file JSON");
    }
  };
  reader.readAsText(file);
};
document.getElementById("print-btn").onclick = () => {
  const lista = filtraAtleti(filtroAttivo);
  if (!lista.length) return alert("Nessun atleta da stampare!");
  let html = "<h1>Lista Atleti</h1><table border='1'><thead><tr><th>Cognome Nome</th><th>Sesso</th><th>Ruolo</th><th>Data Nascita</th><th>Età</th><th>CF</th><th>Codice</th><th>Cell</th></tr></thead><tbody>";
  lista.forEach(a => {
    html += `<tr><td>${a.cognome} ${a.nome}</td><td>${a.sesso}</td><td>${a.ruolo}</td><td>${formattaData(a.dataNascita)}</td><td>${calcolaEta(a.dataNascita)}</td><td>${a.codiceFiscale}</td><td>${a.codiceAtleta}</td><td>${a.cellulare}</td></tr>`;
  });
  html += "</tbody></table>";
  const w = window.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
  w.close();
};
window.addEventListener("DOMContentLoaded", () => mostraAtleti());

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("atleta-form");
  const tableBody = document.querySelector("#atleti-list tbody");
  let filtroAttivo = "all";

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

  function generaId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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

  function daysBetween(a, b) {
    return Math.floor((new Date(a) - new Date(b)) / (1000 * 60 * 60 * 24));
  }

  function statoVisita(data) {
    if (!data) return "data-ok";
    const oggi = new Date().toISOString().slice(0, 10);
    const diff = daysBetween(data, oggi);
    if (diff < 0) return "data-scaduta";
    if (diff <= 31) return "data-scanza";
    return "data-ok";
  }

  function formattaData(data) {
    if (!data) return "";
    const [a, m, g] = data.split("-");
    return `${g}/${m}/${a}`;
  }

  function filtraAtleti(filtro) {
    let lista = caricaAtleti();
    lista.sort((a, b) =>
      (a.cognome || "").localeCompare(b.cognome || "") ||
      (a.nome || "").localeCompare(b.nome || "")
    );
    const oggi = new Date().toISOString().slice(0, 10);
    if (filtro === "maschi") lista = lista.filter((a) => a.sesso === "M");
    else if (filtro === "femmine") lista = lista.filter((a) => a.sesso === "F");
    else if (filtro === "scadenza")
      lista = lista.filter(
        (a) =>
          a.scadenzaVisita &&
          daysBetween(a.scadenzaVisita, oggi) >= 0 &&
          daysBetween(a.scadenzaVisita, oggi) <= 31
      );
    else if (filtro === "scadute")
      lista = lista.filter((a) => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) < 0);
    return lista;
  }

  function aggiornaDashboard() {
    const lista = caricaAtleti();
    const oggi = new Date().toISOString().slice(0, 10);
    document.getElementById("tot-atleti").textContent = lista.length;
    document.getElementById("tot-maschi").textContent = lista.filter((a) => a.sesso === "M").length;
    document.getElementById("tot-femmine").textContent = lista.filter((a) => a.sesso === "F").length;
    document.getElementById("tot-in-scadenza").textContent = lista.filter(
      (a) =>
        a.scadenzaVisita &&
        daysBetween(a.scadenzaVisita, oggi) >= 0 &&
        daysBetween(a.scadenzaVisita, oggi) <= 31
    ).length;
    document.getElementById("tot-scadute").textContent = lista.filter(
      (a) => a.scadenzaVisita && daysBetween(a.scadenzaVisita, oggi) < 0
    ).length;
    const totEta = lista.reduce((sum, a) => sum + (a.dataNascita ? calcolaEta(a.dataNascita) : 0), 0);
    document.getElementById("eta-media").textContent = lista.length ? (totEta / lista.length).toFixed(1) : 0;
  }

  function splitName(cognome, nome) {
    // cognome maiuscolo prima riga, nomi seconda riga
    return `<b>${cognome}</b>${nome ? "<br>" + nome.trim().replace(/\s+/g, " ") : ""}`;
  }

  function mostraAtleti(filtro = filtroAttivo) {
    filtroAttivo = filtro;
    const lista = filtraAtleti(filtro);
    tableBody.innerHTML = "";
    aggiornaDashboard();
    if (!lista.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="8">Nessun atleta trovato</td>`;
      tableBody.appendChild(tr);
      return;
    }
    lista.forEach((x) => {
      const statoCls = statoVisita(x.scadenzaVisita);
      const tr1 = document.createElement("tr");
      tr1.innerHTML = `
        <td class="cognome-nome"><strong>${splitName(x.cognome, x.nome)}</strong></td>
        <td>${x.sesso}</td>
        <td>${x.ruolo}</td>
        <td>${formattaData(x.dataNascita)}</td>
        <td>${calcolaEta(x.dataNascita)}</td>
        <td>${x.codiceFiscale}</td>
        <td>${x.codiceAtleta}</td>
        <td>${x.cellulare}</td>
      `;
      const tr2 = document.createElement("tr");
      tr2.className = "info-extra";
      tr2.innerHTML = `
        <td colspan="7">
          <span class="label-scadenza">Scadenza Visita:</span>
          <span class="${statoCls}">${formattaData(x.scadenzaVisita)}</span>
          <span class="label-certificato">Certificato:</span>
          ${x.certificatoMedico ? '<span style="color:#45d345; font-weight:bold;">CARICATO</span>' : '<span style="color:#e63946;font-weight:bold;">NON PRESENTE</span>'}
          <span class="label-iban">IBAN:</span>
          <span>${x.iban ? x.iban : '<span style="color:#e63946;">NON PRESENTE</span>'}</span>
        </td>
        <td class="actions-cell">
          <div class="btn-group">
            <button class="btn-big btn-visualizza" data-id="${x.id}">VISUALIZZA</button>
            <button class="btn-big btn-modifica" data-id="${x.id}">MODIFICA</button>
            <button class="btn-big btn-cancella" data-id="${x.id}">CANCELLA</button>
          </div>
        </td>`;
      tableBody.appendChild(tr1);
      tableBody.appendChild(tr2);
    });
    document.querySelectorAll(".btn-cancella").forEach((b) => (b.onclick = () => cancella(b.dataset.id)));
    document.querySelectorAll(".btn-visualizza").forEach((b) => (b.onclick = () => visualizza(b.dataset.id)));
    document.querySelectorAll(".btn-modifica").forEach((b) => (b.onclick = () => modifica(b.dataset.id)));
  }

  document.getElementById("dashboard").addEventListener("click", (e) => {
    const card = e.target.closest(".dash-card");
    if (!card) return;
    mostraAtleti(card.dataset.filter || "all");
  });

  const cancella = (id) => {
    let lista = caricaAtleti();
    if (confirm("Confermi eliminazione atleta?")) {
      lista = lista.filter((a) => a.id !== id);
      salvaAtleti(lista);
      mostraAtleti();
    }
  };

  const visualizza = (id) => {
    const atleta = caricaAtleti().find((a) => a.id === id);
    if (!atleta) return;
    const statoCls = statoVisita(atleta.scadenzaVisita);
    document.getElementById("modal").style.display = "flex";
    document.getElementById("dettaglio-atleta").innerHTML = `
      <h2><span style='color:#0080ff'>${atleta.cognome} ${atleta.nome}</span></h2>
      <p><strong>Codice:</strong> ${atleta.codiceAtleta}</p>
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
  };

  const modifica = (id) => {
    const atleta = caricaAtleti().find((a) => a.id === id);
    if (!atleta) return;
    [
      "codiceAtleta", "nome", "cognome", "sesso", "dataNascita", "ruolo",
      "codiceFiscale", "cellulare", "scadenzaVisita", "iban"
    ].forEach((field) => {
      document.getElementById("mod-" + field).value = atleta[field] || "";
    });
    document.getElementById("modifica-form").dataset.id = id;
    document.getElementById("modal-modifica").style.display = "flex";
  };

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
    const pdf = await leggiPdf(document.getElementById("certificatoMedico"));
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
      iban: form.iban.value.trim().toUpperCase(),
    });
    salvaAtleti(lista);
    form.reset();
    mostraAtleti();
  };

  document.getElementById("modifica-form").onsubmit = async (e) => {
    e.preventDefault();
    const id = e.target.dataset.id;
    let lista = caricaAtleti();
    const idx = lista.findIndex((a) => a.id === id);
    if (idx === -1) return;
    const pdf = await leggiPdf(document.getElementById("mod-certificatoMedico"));
    [
      "codiceAtleta", "nome", "cognome", "sesso", "dataNascita", "ruolo",
      "codiceFiscale", "cellulare", "scadenzaVisita", "iban"
    ].forEach((field) => {
      lista[idx][field] = document.getElementById("mod-" + field).value.trim();
      if (field !== "sesso") lista[idx][field] = lista[idx][field].toUpperCase();
    });
    if (pdf) lista[idx].certificatoMedico = pdf;
    salvaAtleti(lista);
    document.getElementById("modal-modifica").style.display = "none";
    mostraAtleti();
  };

  document.getElementById("export-btn").addEventListener("click", () => {
    const lista = caricaAtleti();
    if (!lista.length) return alert("Nessun atleta da esportare!");
    const blob = new Blob([JSON.stringify(lista, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "atleti-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });

  document.getElementById("import-btn").addEventListener("click", () => {
    document.getElementById("import-file").click();
  });
  document.getElementById("import-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const arr = JSON.parse(ev.target.result);
        salvaAtleti(arr);
        mostraAtleti();
        alert("Import eseguito con successo");
      } catch {
        alert("Errore nel file importato");
      }
    };
    reader.readAsText(file);
  });
  document.getElementById("print-btn").addEventListener("click", () => {
    const lista = filtraAtleti(filtroAttivo);
    if (!lista.length) return alert("Nessun atleta da stampare!");
    let html =
      "<h1>Lista Atleti</h1><table border='1' cellspacing='0' cellpadding='6'><thead><tr><th>Cognome Nome</th><th>Sesso</th><th>Ruolo</th><th>Data Nascita</th><th>Età</th><th>CF</th><th>Codice</th><th>Cell</th></tr></thead><tbody>";
    lista.forEach((x) => {
      html += `<tr>
        <td>${x.cognome} ${x.nome}</td>
        <td>${x.sesso}</td>
        <td>${x.ruolo}</td>
        <td>${formattaData(x.dataNascita)}</td>
        <td>${calcolaEta(x.dataNascita)}</td>
        <td>${x.codiceFiscale}</td>
        <td>${x.codiceAtleta}</td>
        <td>${x.cellulare}</td>
      </tr>`;
    });
    html += "</tbody></table>";
    const w = window.open("", "_blank", "width=900,height=700");
    w.document.write("<html><head><title>Stampa Atleti</title></head><body>" + html + "</body></html>");
    w.document.close();
    w.focus();
    w.print();
    w.close();
  });

  document.getElementById("close-view").onclick = () => {
    document.getElementById("modal").style.display = "none";
  };

  document.getElementById("close-edit").onclick = () => {
    document.getElementById("modal-modifica").style.display = "none";
  };

  mostraAtleti();
  aggiornaDashboard();
});
function splitName(cognome, nome) {
  // cognome maiuscolo prima riga, nomi seconda riga
  return `<b>${cognome}</b>${nome ? "<br>" + nome.trim().replace(/\s+/g, " ") : ""}`;
}
function mostraAtleti(filtro = filtroAttivo) {
  filtroAttivo = filtro;
  const lista = filtraAtleti(filtro);
  tableBody.innerHTML = "";
  aggiornaDashboard();
  if (!lista.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="8">Nessun atleta trovato</td>`;
    tableBody.appendChild(tr);
    return;
  }
  lista.forEach((x) => {
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
    `;
    const tr2 = document.createElement("tr");
    tr2.className = "info-extra";
    tr2.innerHTML = `
      <td colspan="7">
        <span class="label-scadenza">Scadenza Visita:</span>
        <span class="${statoCls}">${formattaData(x.scadenzaVisita)}</span>
        <span class="label-certificato">Certificato:</span>
        ${x.certificatoMedico ? '<span style="color:#45d345; font-weight:bold;">CARICATO</span>' : '<span style="color:#e63946;font-weight:bold;">NON PRESENTE</span>'}
        <span class="label-iban">IBAN:</span> <span>${x.iban ? x.iban : '<span style="color:#e63946;">NON PRESENTE</span>'}</span>
      </td>
      <td class="actions-cell">
        <div class="btn-group">
          <button class="btn-round btn-visualizza" data-id="${x.id}" title="Visualizza">V</button>
          <button class="btn-round btn-modifica" data-id="${x.id}" title="Modifica">M</button>
          <button class="btn-round btn-cancella" data-id="${x.id}" title="Cancella">C</button>
        </div>
      </td>`;
    tableBody.appendChild(tr1);
    tableBody.appendChild(tr2);
  });
  document.querySelectorAll(".btn-cancella").forEach((b) => (b.onclick = () => cancella(b.dataset.id)));
  document.querySelectorAll(".btn-visualizza").forEach((b) => (b.onclick = () => visualizza(b.dataset.id)));
  document.querySelectorAll(".btn-modifica").forEach((b) => (b.onclick = () => modifica(b.dataset.id)));
}
// ...resto invariato come fornito sopra...
function splitName(cognome, nome) {
  return `<b>${cognome}</b>${nome ? "<br>" + nome.trim().replace(/\s+/g, " ") : ""}`;
}
function mostraAtleti(filtro = filtroAttivo) {
  filtroAttivo = filtro;
  const lista = filtraAtleti(filtro);
  tableBody.innerHTML = "";
  aggiornaDashboard();
  if (!lista.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="8">Nessun atleta trovato</td>`;
    tableBody.appendChild(tr);
    return;
  }
  lista.forEach((x) => {
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
    `;
    const tr2 = document.createElement("tr");
    tr2.className = "info-extra";
    tr2.innerHTML = `
      <td colspan="8">
        <span class="label-scadenza">Scadenza Visita:</span>
        <span class="${statoCls}">${formattaData(x.scadenzaVisita)}</span>
        <span class="label-certificato">Certificato:</span>
        ${x.certificatoMedico ? '<span style="color:#45d345; font-weight:bold;">CARICATO</span>' : '<span style="color:#e63946;font-weight:bold;">NON PRESENTE</span>'}
        <br>
        <span class="label-iban">IBAN:</span> <span>${x.iban ? x.iban : '<span style="color:#e63946;">NON PRESENTE</span>'}</span>
        <div class="btn-group" style="margin-top:10px; float:right;">
          <button class="btn-round btn-visualizza" data-id="${x.id}" title="Visualizza">V</button>
          <button class="btn-round btn-modifica" data-id="${x.id}" title="Modifica">M</button>
          <button class="btn-round btn-cancella" data-id="${x.id}" title="Cancella">C</button>
        </div>
      </td>`;
    tableBody.appendChild(tr1);
    tableBody.appendChild(tr2);
  });
  document.querySelectorAll(".btn-cancella").forEach((b) => (b.onclick = () => cancella(b.dataset.id)));
  document.querySelectorAll(".btn-visualizza").forEach((b) => (b.onclick = () => visualizza(b.dataset.id)));
  document.querySelectorAll(".btn-modifica").forEach((b) => (b.onclick = () => modifica(b.dataset.id)));
}
function splitName(cognome, nome) {
  return `<b>${cognome}</b>${nome ? "<br>" + nome.trim().replace(/\s+/g, " ") : ""}`;
}
function mostraAtleti(filtro = filtroAttivo) {
  filtroAttivo = filtro;
  const lista = filtraAtleti(filtro);
  tableBody.innerHTML = "";
  aggiornaDashboard();
  if (!lista.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="8">Nessun atleta trovato</td>`;
    tableBody.appendChild(tr);
    return;
  }
  lista.forEach((x) => {
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
    `;
    const tr2 = document.createElement("tr");
    tr2.className = "info-extra";
    tr2.innerHTML = `
      <td colspan="8">
        <span class="label-scadenza">Scadenza Visita:</span>
        <span class="${statoCls}">${formattaData(x.scadenzaVisita)}</span>
        <span class="label-certificato">Certificato:</span>
        ${x.certificatoMedico ? '<span style="color:#45d345; font-weight:bold;">CARICATO</span>' : '<span style="color:#e63946;font-weight:bold;">NON PRESENTE</span>'}
        <br>
        <span class="label-iban">IBAN:</span> <span>${x.iban ? x.iban : '<span style="color:#e63946;">NON PRESENTE</span>'}</span>
        <div class="btn-group" style="margin-top:15px;">
          <button class="btn-round btn-visualizza" data-id="${x.id}" title="Visualizza">V</button>
          <button class="btn-round btn-modifica" data-id="${x.id}" title="Modifica">M</button>
          <button class="btn-round btn-cancella" data-id="${x.id}" title="Cancella">C</button>
        </div>
      </td>`;
    tableBody.appendChild(tr1);
    tableBody.appendChild(tr2);
  });
  document.querySelectorAll(".btn-cancella").forEach((b) => (b.onclick = () => cancella(b.dataset.id)));
  document.querySelectorAll(".btn-visualizza").forEach((b) => (b.onclick = () => visualizza(b.dataset.id)));
  document.querySelectorAll(".btn-modifica").forEach((b) => (b.onclick = () => modifica(b.dataset.id)));
}

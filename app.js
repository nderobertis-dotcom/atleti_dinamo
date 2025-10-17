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
    tr.innerHTML = `<td colspan="9">Nessun atleta trovato</td>`;
    tableBody.appendChild(tr);
    return;
  }
  lista.forEach((x) => {
    const statoCls = statoVisita(x.scadenzaVisita);
    // Riga principale
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
    // Riga info-extra
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
  document.querySelectorAll(".btn-cancella").forEach((b) => (b.onclick = () => cancella(b.dataset.id)));
  document.querySelectorAll(".btn-visualizza").forEach((b) => (b.onclick = () => visualizza(b.dataset.id)));
  document.querySelectorAll(".btn-modifica").forEach((b) => (b.onclick = () => modifica(b.dataset.id)));
}

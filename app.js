let atleti = JSON.parse(localStorage.getItem('atleti-dinamo')) || [];
let editIndex = null;
let atletaSelezionato = null;
let filtroAttivo = null;

function upperAll(obj) {
  let o = {};
  for (let k in obj) {
    if (
      k === "foto" || k === "pdfVisita" ||
      k === "svm" || k === "dataNascita" || k === "dataCreazione"
      || k === "peso" || k === "altezza"
      || k === "email" || k === "codiceTesseramento"
    ) { o[k] = obj[k]; }
    else o[k] = (typeof obj[k] === "string") ? obj[k].toUpperCase() : obj[k];
  }
  return o;
}

function applicaUpperCaseInput() {
  document.querySelectorAll('.input-card, .select-card').forEach(input => {
    if(input.type !== 'date' && input.type !== 'email' && input.type !== 'number' && input.type !== 'file') {
      input.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
      });
    }
  });
}

function percentualeCompletamento() {
  if (!atleti.length) return 0;
  const campi = [
    'foto','pdfVisita','codiceTesseramento','nome','cognome','sesso','numeroMaglia','ruolo',
    'campionato','dataNascita','luogoNascita','provNascita','codiceFiscale',
    'altezza','peso','email','cellulare','viaResidenza','cittaResidenza',
    'provResidenza','svm'
  ];
  let completati = 0, totali = campi.length * atleti.length;
  atleti.forEach(atleta => {
    campi.forEach(campo => {
      if (campo === 'foto' && atleta[campo] && atleta[campo].length > 10) completati++;
      else if (campo === 'pdfVisita' && atleta[campo] && atleta[campo].startsWith("data:application/pdf")) completati++;
      else if (atleta[campo] && atleta[campo].toString().trim()) completati++;
    });
  });
  return Math.round((completati / totali) * 100);
}

function filtraAtleti(filtro) {
  filtroAttivo = filtro;
  Array.from(document.querySelectorAll('.stat-card')).forEach(card => card.classList.remove('filtro-attivo'));
  if (!filtro) {
    document.querySelector('.logo-card').classList.add('filtro-attivo');
    document.querySelector('.atleti-card').classList.add('filtro-attivo');
  }
  if (filtro === 'M') document.querySelector('.sesso-m-card').classList.add('filtro-attivo');
  if (filtro === 'F') document.querySelector('.sesso-f-card').classList.add('filtro-attivo');
  if (filtro === 'SERIE D MASCHILE') document.querySelector('.camp-seriedm-card').classList.add('filtro-attivo');
  if (filtro === '1° DIV. FEMMINILE') document.querySelector('.camp-1divf-card').classList.add('filtro-attivo');
  if (filtro === '1° DIVISIONE MASCHILE') document.querySelector('.camp-1divm-card').classList.add('filtro-attivo');
  mostraLista();
}

function calcolaSvmStatus(dataSvm) {
  if (!dataSvm) return null;
  const oggi = new Date();
  const svm = new Date(dataSvm);
  const diffTime = svm.getTime() - oggi.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'scaduta';
  if (diffDays <= 30) return 'in_scadenza';
  return 'valida';
}

function formatSvmDisplay(dataSvm) {
  if (!dataSvm) return '';
  const status = calcolaSvmStatus(dataSvm);
  const dataFormatted = new Date(dataSvm).toLocaleDateString('it-IT');
  switch(status) {
    case 'scaduta': return `<span class="svm-scaduta">SVM: ${dataFormatted} (SCADUTA)</span>`;
    case 'in_scadenza': return `<span class="svm-in-scadenza">SVM: ${dataFormatted} (scade presto)</span>`;
    default: return `SVM: ${dataFormatted}`;
  }
}

function countVM(status) {
  return atleti.filter(a => calcolaSvmStatus(a.svm) === status).length;
}

function mostraLista() {
  const div = document.getElementById('lista-atleti');
  const listaVuota = document.getElementById('lista-vuota');
  let listaFiltrata = [...atleti];
  
  if (filtroAttivo === 'M' || filtroAttivo === 'F') {
    listaFiltrata = atleti.filter(a => a.sesso === filtroAttivo);
  } else if (['SERIE D MASCHILE', "1° DIV. FEMMINILE", "1° DIVISIONE MASCHILE"].includes(filtroAttivo)) {
    listaFiltrata = atleti.filter(a => a.campionato === filtroAttivo);
  }
  
  if (listaFiltrata.length === 0) {
    div.style.display = 'none';
    listaVuota.style.display = 'block';
  } else {
    div.style.display = 'block';
    listaVuota.style.display = 'none';
    const atletiOrdinati = [...listaFiltrata].sort((a, b) =>
      (a.cognome || '').localeCompare(b.cognome || '')
    );
    div.innerHTML = atletiOrdinati.map((a, i) => `
      <div class="atleta-list-item">
        <div class="atleta-info">
          ${a.foto ? `<img src="${a.foto}" class="foto-atleta-mini" alt="foto">` : ''}
          <div>
            <div style="font-size: 1.1em; font-weight: 600;">${a.nome} ${a.cognome}</div>
            <div class="atleta-dettagli-lista">
              CT: ${a.codiceTesseramento || 'N/D'} • ${a.numeroMaglia ? `#${a.numeroMaglia}` : ''} 
              ${a.ruolo ? `• ${a.ruolo}` : ''}<br>
              ${a.svm ? formatSvmDisplay(a.svm) : ''}
            </div>
          </div>
        </div>
        <button class="btn-entra" onclick="entraAtleta(${atleti.indexOf(a)})">ENTRA</button>
      </div>
    `).join('');
  }
  clearCardAtleta();
  aggiornaStatistiche();
}

function aggiornaStatistiche() {
  document.getElementById('total-atleti').textContent = atleti.length;
  document.getElementById('percent-complete').textContent = percentualeCompletamento() + '%';
  document.getElementById('vm-scadute').textContent = countVM('scaduta');
  document.getElementById('vm-scadenza').textContent = countVM('in_scadenza');
  
  if (atleti.length === 0) {
    document.getElementById('eta-media').textContent = '-';
    document.getElementById('altezza-media').textContent = '-';
    document.getElementById('num-maschi').textContent = '0';
    document.getElementById('num-femmine').textContent = '0';
    document.getElementById('num-seriedm').textContent = '0';
    document.getElementById('num-1divf').textContent = '0';
    document.getElementById('num-1divm').textContent = '0';
    return;
  }
  
  const atletiConEta = atleti.filter(a => a.dataNascita);
  if (atletiConEta.length > 0) {
    const sommaEta = atletiConEta.reduce((sum, a) => {
      const eta = calcolaEta(a.dataNascita);
      return sum + (eta || 0);
    }, 0);
    const mediaEta = Math.round(sommaEta / atletiConEta.length);
    document.getElementById('eta-media').textContent = mediaEta + ' anni';
  } else {
    document.getElementById('eta-media').textContent = '-';
  }
  
  const atletiConAltezza = atleti.filter(a => a.altezza && !isNaN(a.altezza));
  if (atletiConAltezza.length > 0) {
    const sommaAltezza = atletiConAltezza.reduce((sum, a) => sum + parseInt(a.altezza), 0);
    const mediaAltezza = Math.round(sommaAltezza / atletiConAltezza.length);
    document.getElementById('altezza-media').textContent = mediaAltezza + ' cm';
  } else {
    document.getElementById('altezza-media').textContent = '-';
  }
  
  const numMaschi = atleti.filter(a => a.sesso === 'M').length;
  const numFemmine = atleti.filter(a => a.sesso === 'F').length;
  document.getElementById('num-maschi').textContent = numMaschi;
  document.getElementById('num-femmine').textContent = numFemmine;
  
  document.getElementById('num-seriedm').textContent = 
    atleti.filter(a => a.campionato === 'SERIE D MASCHILE').length;
  document.getElementById('num-1divf').textContent = 
    atleti.filter(a => a.campionato === '1° DIV. FEMMINILE').length;
  document.getElementById('num-1divm').textContent = 
    atleti.filter(a => a.campionato === '1° DIVISIONE MASCHILE').length;
}

function calcolaEta(dataNascita) {
  if (!dataNascita) return null;
  const oggi = new Date();
  const nascita = new Date(dataNascita);
  let eta = oggi.getFullYear() - nascita.getFullYear();
  const mesiDiff = oggi.getMonth() - nascita.getMonth();
  if (mesiDiff < 0 || (mesiDiff === 0 && oggi.getDate() < nascita.getDate())) eta--;
  return eta > 0 ? eta : null;
}

function entraAtleta(i) {
  atletaSelezionato = i;
  mostraCardAtleta(i);
}

function mostraCardAtleta(i) {
  const a = atleti[i];
  const eta = calcolaEta(a.dataNascita);
  const div = document.getElementById('card-atleta');
  div.innerHTML = `
    <div class="atleta">
      ${a.foto ? `<img src="${a.foto}" class="foto-atleta-big" alt="Foto atleta">` : ''}
      <div class="atleta-header">
        <div class="atleta-nome">${a.nome} ${a.cognome}</div>
        ${a.numeroMaglia ? `<div class="numero-maglia">${a.numeroMaglia}</div>` : ''}
      </div>
      <div class="atleta-ruolo">${a.ruolo || '-'}</div>
      <div class="atleta-dettagli">
        <div><strong>Codice Tesseramento:</strong> ${a.codiceTesseramento}</div>
        ${a.sesso ? `<div><strong>Sesso:</strong> ${a.sesso === 'M' ? 'Maschile' : 'Femminile'}</div>` : ''}
        ${a.campionato ? `<div><strong>Campionato:</strong> ${a.campionato}</div>` : ''}
        ${eta ? `<div><strong>Età:</strong> ${eta} anni</div>` : ''}
        ${a.dataNascita ? `<div><strong>Data nascita:</strong> ${new Date(a.dataNascita).toLocaleDateString('it-IT')}</div>` : ''}
        ${a.luogoNascita ? `<div><strong>Luogo nascita:</strong> ${a.luogoNascita}</div>` : ''}
        ${a.provNascita ? `<div><strong>Provincia nascita:</strong> ${a.provNascita}</div>` : ''}
        ${a.codiceFiscale ? `<div><strong>Codice fiscale:</strong> ${a.codiceFiscale}</div>` : ''}
        ${a.altezza ? `<div><strong>Altezza:</strong> ${a.altezza} cm</div>` : ''}
        ${a.peso ? `<div><strong>Peso:</strong> ${a.peso} kg</div>` : ''}
        ${a.email ? `<div><strong>Email:</strong> ${a.email}</div>` : ''}
        ${a.cellulare ? `<div><strong>Cellulare:</strong> ${a.cellulare}</div>` : ''}
        ${(a.viaResidenza || a.cittaResidenza || a.provResidenza) ? `<div><strong>Residenza:</strong> 
          ${a.viaResidenza || ''} ${a.cittaResidenza ? '(' + a.cittaResidenza + ')' : ''} ${a.provResidenza || ''}</div>` : ''}
        ${a.svm ? `<div><strong>Scad. Visita Medica:</strong> ${formatSvmDisplay(a.svm)}</div>` : ''}
        ${a.pdfVisita ? `<div><a href="${a.pdfVisita}" target="_blank">Scarica PDF visita medica</a></div>` : ''}
        ${a.note ? `<div><strong>Note:</strong> ${a.note}</div>` : ''}
      </div>
      <div class="atleta-azioni">
        <button class="btn-modifica" onclick="modificaAtleta(${i})">MODIFICA</button>
        <button class="btn-elimina" onclick="eliminaAtleta(${i})">ELIMINA</button>
      </div>
    </div>
  `;
}

function clearCardAtleta() {
  document.getElementById('card-atleta').innerHTML = '';
  atletaSelezionato = null;
}

function modificaAtleta(i) {
  const a = atleti[i];
  const div = document.getElementById('card-atleta');
  div.innerHTML = `
    <div class="atleta" style="background: #f9f9f9; border-color: #4CAF50;">
      <div style="background: #e0e0e0; padding: 8px; border-radius: 4px; margin-bottom: 10px;">
        <strong>Codice Tesseramento: ${a.codiceTesseramento}</strong> (non modificabile)
      </div>
      ${a.foto ? `<img src="${a.foto}" class="foto-atleta-big" id="foto-preview-edit">` : `<img src="" class="foto-atleta-big" id="foto-preview-edit" style="display:none;">`}
      <label class="input-file-label">Foto:<input type="file" id="foto-edit-input" accept="image/*"></label>
      <input type="text" class="input-card" id="nome" value="${a.nome || ''}" placeholder="Nome *">
      <input type="text" class="input-card" id="cognome" value="${a.cognome || ''}" placeholder="Cognome *">
      <select class="select-card" id="sesso">
        <option value="">Sesso</option>
        <option value="M" ${a.sesso === 'M' ? 'selected' : ''}>Maschile</option>
        <option value="F" ${a.sesso === 'F' ? 'selected' : ''}>Femminile</option>
      </select>
      <input type="number" class="input-card" id="numeroMaglia" value="${a.numeroMaglia || ''}" placeholder="Numero maglia (1-99)" min="1" max="99">
      <select class="select-card" id="ruolo">
        <option value="">Ruolo</option>
        <option value="Palleggiatore" ${a.ruolo === 'Palleggiatore' ? 'selected' : ''}>Palleggiatore</option>
        <option value="Libero" ${a.ruolo === 'Libero' ? 'selected' : ''}>Libero</option>
        <option value="Schiacciatore" ${a.ruolo === 'Schiacciatore' ? 'selected' : ''}>Schiacciatore</option>
        <option value="Centrale" ${a.ruolo === 'Centrale' ? 'selected' : ''}>Centrale</option>
        <option value="Opposto" ${a.ruolo === 'Opposto' ? 'selected' : ''}>Opposto</option>
      </select>
      <select class="select-card" id="campionato">
        <option value="">Campionato</option>
        <option value="SERIE D MASCHILE" ${a.campionato === 'SERIE D MASCHILE' ? 'selected' : ''}>SERIE D MASCHILE</option>
        <option value="1° DIV. FEMMINILE" ${a.campionato === '1° DIV. FEMMINILE' ? 'selected' : ''}>1° DIV. FEMMINILE</option>
        <option value="1° DIVISIONE MASCHILE" ${a.campionato === '1° DIVISIONE MASCHILE' ? 'selected' : ''}>1° DIVISIONE MASCHILE</option>
      </select>
      <input type="date" class="input-card" id="dataNascita" value="${a.dataNascita || ''}">
      <input type="text" class="input-card" id="luogoNascita" value="${a.luogoNascita || ''}" placeholder="Luogo di nascita">
      <input type="text" class="input-card" id="provNascita" value="${a.provNascita || ''}" placeholder="Provincia di nascita">
      <input type="text" class="input-card" id="codiceFiscale" value="${a.codiceFiscale || ''}" placeholder="Codice fiscale">
      <input type="number" class="input-card" id="altezza" value="${a.altezza || ''}" placeholder="Altezza (cm)" min="150" max="220">
      <input type="number" class="input-card" id="peso" value="${a.peso || ''}" placeholder="Peso (kg)" min="40" max="150">
      <input type="email" class="input-card" id="email" value="${a.email || ''}" placeholder="Email">
      <input type="text" class="input-card" id="cellulare" value="${a.cellulare || ''}" placeholder="Cellulare">
      <input type="text" class="input-card" id="viaResidenza" value="${a.viaResidenza || ''}" placeholder="Via/Piazza">
      <input type="text" class="input-card" id="cittaResidenza" value="${a.cittaResidenza || ''}" placeholder="Città">
      <input type="text" class="input-card" id="provResidenza" value="${a.provResidenza || ''}" placeholder="Provincia">
      <input type="date" class="input-card" id="svm" value="${a.svm || ''}" placeholder="Scadenza Visita Medica">
      <label for="svm" style="font-size: 0.9em; color: #666; margin: -5px 0 10px 8px;">Scadenza Visita Medica (SVM)</label>
      <label class="input-file-label">
        Allegato PDF visita medica:
        <input type="file" id="pdf-visita-edit" accept="application/pdf">
      </label>
      <div id="pdf-visita-info-edit" style="font-size:0.96em; color:#888; margin-bottom:7px;">${a.pdfVisita ? `<a href="${a.pdfVisita}" target="_blank">PDF attuale</a>` : ""}</div>
      <input type="text" class="input-card" id="note" value="${a.note || ''}" placeholder="Note">
      <div style="margin-top: 16px;">
        <button onclick="salvaModifica(${i})">SALVA</button>
        <button onclick="annullaEdit()">ANNULLA</button>
      </div>
    </div>
  `;
  
  document.getElementById('foto-edit-input').addEventListener('change', function(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    if (file.size > 150000) {
      alert("L'immagine è troppo grande! Usa una foto inferiore a 150KB.");
      evt.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
      document.getElementById('foto-preview-edit').src = ev.target.result;
      document.getElementById('foto-preview-edit').style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
  
  document.getElementById('pdf-visita-edit').addEventListener('change', function(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    if (file.size > 300000) {
      alert("Il PDF è troppo grande! Usa un file sotto i 300KB.");
      evt.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('pdf-visita-info-edit').textContent = "PDF allegato: " + file.name;
      document.getElementById('pdf-visita-info-edit').dataset.pdf = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  
  applicaUpperCaseInput();
}

function isCodiceTesseramentoValid(code, excludeIndex = null) {
  if (!/^\d{7}$/.test(code)) return false;
  return !atleti.some((a, i) => a.codiceTesseramento === code && i !== excludeIndex);
}

function salvaNuovoAtleta() {
  let code = document.getElementById('codiceTesseramento').value;
  if (!isCodiceTesseramentoValid(code)) {
    alert("Codice tesseramento obbligatorio, numerico di 7 cifre e UNIVOCO.");
    return;
  }
  let atleta = {
    foto: (document.getElementById('foto-preview-add').src && document.getElementById('foto-preview-add').src.startsWith("data:")) ? document.getElementById('foto-preview-add').src : "",
    pdfVisita: (document.getElementById('pdf-visita-info') && document.getElementById('pdf-visita-info').dataset.pdf) ? document.getElementById('pdf-visita-info').dataset.pdf : "",
    codiceTesseramento: code,
    nome: document.getElementById('nome').value,
    cognome: document.getElementById('cognome').value,
    sesso: document.getElementById('sesso').value,
    numeroMaglia: document.getElementById('numeroMaglia').value,
    ruolo: document.getElementById('ruolo').value,
    campionato: document.getElementById('campionato').value,
    dataNascita: document.getElementById('dataNascita').value,
    luogoNascita: document.getElementById('luogoNascita').value,
    provNascita: document.getElementById('provNascita').value,
    codiceFiscale: document.getElementById('codiceFiscale').value,
    altezza: document.getElementById('altezza').value,
    peso: document.getElementById('peso').value,
    email: document.getElementById('email').value,
    cellulare: document.getElementById('cellulare').value,
    viaResidenza: document.getElementById('viaResidenza').value,
    cittaResidenza: document.getElementById('cittaResidenza').value,
    provResidenza: document.getElementById('provResidenza').value,
    svm: document.getElementById('svm').value,
    note: document.getElementById('note').value,
    dataCreazione: new Date().toISOString()
  };
  atleta = upperAll(atleta);
  if (!atleta.nome || !atleta.cognome) {
    alert('Nome e Cognome sono obbligatori');
    return;
  }
  atleti.push(atleta);
  salvaAtleti();
  mostraLista();
  clearCardAtleta();
}

function salvaModifica(i) {
  let atleta = {
    foto: (document.getElementById('foto-preview-edit').src && document.getElementById('foto-preview-edit').src.startsWith("data:")) ? document.getElementById('foto-preview-edit').src : atleti[i].foto || "",
    pdfVisita: (document.getElementById('pdf-visita-info-edit') && document.getElementById('pdf-visita-info-edit').dataset.pdf) ? document.getElementById('pdf-visita-info-edit').dataset.pdf : atleti[i].pdfVisita || "",
    codiceTesseramento: atleti[i].codiceTesseramento,
    nome: document.getElementById('nome').value,
    cognome: document.getElementById('cognome').value,
    sesso: document.getElementById('sesso').value,
    numeroMaglia: document.getElementById('numeroMaglia').value,
    ruolo: document.getElementById('ruolo').value,
    campionato: document.getElementById('campionato').value,
    dataNascita: document.getElementById('dataNascita').value,
    luogoNascita: document.getElementById('luogoNascita').value,
    provNascita: document.getElementById('provNascita').value,
    codiceFiscale: document.getElementById('codiceFiscale').value,
    altezza: document.getElementById('altezza').value,
    peso: document.getElementById('peso').value,
    email: document.getElementById('email').value,
    cellulare: document.getElementById('cellulare').value,
    viaResidenza: document.getElementById('viaResidenza').value,
    cittaResidenza: document.getElementById('cittaResidenza').value,
    provResidenza: document.getElementById('provResidenza').value,
    svm: document.getElementById('svm').value,
    note: document.getElementById('note').value,
    dataCreazione: atleti[i].dataCreazione || new Date().toISOString()
  };
  atleta = upperAll(atleta);
  if (!atleta.nome || !atleta.cognome) {
    alert('Nome e Cognome sono obbligatori');
    return;
  }
  atleti[i] = atleta;
  salvaAtleti();
  mostraLista();
  mostraCardAtleta(i);
}

function annullaEdit() {
  mostraLista();
  if (atletaSelezionato !== null) mostraCardAtleta(atletaSelezionato);
  else clearCardAtleta();
}

function eliminaAtleta(i) {
  const atleta = atleti[i];
  if (confirm(`Eliminare ${atleta.nome} ${atleta.cognome}?`)) {
    atleti.splice(i, 1);
    salvaAtleti();
    mostraLista();
    clearCardAtleta();
  }
}

function salvaAtleti() {
  try {
    localStorage.setItem('atleti-dinamo', JSON.stringify(atleti));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      alert('Spazio di archiviazione esaurito! Riduci la dimensione delle foto/pdf o esporta i dati.');
    } else {
      alert('Errore nel salvataggio: ' + e.message);
    }
  }
}

function mostraCardAggiungi() {
  const div = document.getElementById('card-atleta');
  div.innerHTML = `
    <div class="atleta" style="background: #f9f9f9; border-color: #4CAF50;">
      <input type="number" class="input-card" id="codiceTesseramento" placeholder="CODICE TESSERAMENTO (8 cifre)" min="10000000" max="99999999">
      <img class="foto-atleta-big" id="foto-preview-add" style="display:none;">
      <label class="input-file-label">Foto:<input type="file" id="foto-input" accept="image/*"></label>
      <input type="text" class="input-card" id="nome" placeholder="Nome *">
      <input type="text" class="input-card" id="cognome" placeholder="Cognome *">
      <select class="select-card" id="sesso">
        <option value="">Sesso</option>
        <option value="M">Maschile</option>
        <option value="F">Femminile</option>
      </select>
      <input type="number" class="input-card" id="numeroMaglia" placeholder="Numero maglia (1-99)" min="1" max="99">
      <select class="select-card" id="ruolo">
        <option value="">Ruolo</option>
        <option value="Palleggiatore">Palleggiatore</option>
        <option value="Libero">Libero</option>
        <option value="Schiacciatore">Schiacciatore</option>
        <option value="Centrale">Centrale</option>
        <option value="Opposto">Opposto</option>
      </select>
      <select class="select-card" id="campionato">
        <option value="">Campionato</option>
        <option value="SERIE D MASCHILE">SERIE D MASCHILE</option>
        <option value="1° DIV. FEMMINILE">1° DIV. FEMMINILE</option>
        <option value="1° DIVISIONE MASCHILE">1° DIVISIONE MASCHILE</option>
      </select>
      <input type="date" class="input-card" id="dataNascita">
      <input type="text" class="input-card" id="luogoNascita" placeholder="Luogo di nascita">
      <input type="text" class="input-card" id="provNascita" placeholder="Provincia di nascita">
      <input type="text" class="input-card" id="codiceFiscale" placeholder="Codice fiscale">
      <input type="number" class="input-card" id="altezza" placeholder="Altezza (cm)" min="150" max="220">
      <input type="number" class="input-card" id="peso" placeholder="Peso (kg)" min="40" max="150">
      <input type="email" class="input-card" id="email" placeholder="Email">
      <input type="text" class="input-card" id="cellulare" placeholder="Cellulare">
      <input type="text" class="input-card" id="viaResidenza" placeholder="Via/Piazza">
      <input type="text" class="input-card" id="cittaResidenza" placeholder="Città">
      <input type="text" class="input-card" id="provResidenza" placeholder="Provincia">
      <input type="date" class="input-card" id="svm" placeholder="Scadenza Visita Medica">
      <label for="svm" style="font-size: 0.9em; color: #666; margin: -5px 0 10px 8px;">Scadenza Visita Medica (SVM)</label>
      <label class="input-file-label">
        Allegato PDF visita medica:
        <input type="file" id="pdf-visita" accept="application/pdf">
      </label>
      <div id="pdf-visita-info" style="font-size:0.96em; color:#888; margin-bottom:7px;"></div>
      <input type="text" class="input-card" id="note" placeholder="Note">
      <div style="margin-top: 16px;">
        <button onclick="salvaNuovoAtleta()">SALVA</button>
        <button onclick="annullaEdit()">ANNULLA</button>
      </div>
    </div>
  `;
  
  document.getElementById('foto-input').addEventListener('change', function(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    if (file.size > 150000) {
      alert("L'immagine è troppo grande! Usa una foto inferiore a 150KB.");
      evt.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
      document.getElementById('foto-preview-add').src = ev.target.result;
      document.getElementById('foto-preview-add').style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
  
  document.getElementById('pdf-visita').addEventListener('change', function(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    if (file.size > 300000) {
      alert("Il PDF è troppo grande! Usa un file sotto i 300KB.");
      evt.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('pdf-visita-info').textContent = "PDF allegato: " + file.name;
      document.getElementById('pdf-visita-info').dataset.pdf = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  
  applicaUpperCaseInput();
}

function esportaAtleti() {
  try {
    const data = JSON.stringify(atleti, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'atleti_dinamo_molfetta_backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    alert('Errore durante l\'esportazione: ' + e.message);
  }
}

window.addEventListener('DOMContentLoaded', function() {
  mostraLista();
  
  document.getElementById('btn-aggiungi-bottom').onclick = function() {
    mostraCardAggiungi();
  };
  
  document.getElementById('file-import').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        let importedData = JSON.parse(evt.target.result);
        if (Array.isArray(importedData)) {
          importedData = importedData.map(upperAll);
          atleti = importedData;
          salvaAtleti();
          mostraLista();
          alert('Elenco atleti importato con successo!');
        } else {
          alert('File non valido: formato non riconosciuto.');
        }
      } catch (err) {
        alert('Errore nel file: ' + err.message);
      }
    };
    reader.readAsText(file);
  });
});

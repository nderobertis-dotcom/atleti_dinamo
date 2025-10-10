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

// VM dashboard
function countVM(status) {
  return atleti.filter(a => calcolaSvmStatus(a.svm) === status).length;
}

// Funzioni dashboard
function aggiornaStatistiche() {
  document.getElementById('total-atleti').textContent = atleti.length;
  document.getElementById('percent-complete').textContent = percentualeCompletamento() + '%';
  document.getElementById('vm-scadute').textContent = countVM('scaduta');
  document.getElementById('vm-scadenza').textContent = countVM('in_scadenza');
  // ...le altre statistiche invariati come versione precedente...
}

// Campi obbligatori e univocità codice
function isCodiceTesseramentoValid(code, excludeIndex = null) {
  if (!/^\d{8}$/.test(code)) return false;
  return !atleti.some((a, i) => a.codiceTesseramento === code && i !== excludeIndex);
}

// Aggiunta atleta
function salvaNuovoAtleta() {
  let code = document.getElementById('codiceTesseramento').value;
  if (!isCodiceTesseramentoValid(code)) {
    alert("Codice tesseramento obbligatorio, numerico di 8 cifre e UNIVOCO.");
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

// Modifica atleta (include codice tesseramento, NON modificabile dopo la creazione)
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

// Modale aggiungi (codice tesseramento in cima)
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

// ...resto invariato come versione avanzata: mostraCardAtleta, filtri, esporta/importa ecc...

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
          // Check codici duplicati qui se vuoi ancora più protezione!
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

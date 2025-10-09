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
      || k === "email"
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

// ALTRI CODICI DEL JS INVARIATI 
// (usa il JS completo che hai già, sostituisci solo la funzione salvaNuovoAtleta e salvaModifica come di seguito)

function salvaNuovoAtleta() {
  let atleta = {
    foto: (document.getElementById('foto-preview-add').src && document.getElementById('foto-preview-add').src.startsWith("data:")) ? document.getElementById('foto-preview-add').src : "",
    pdfVisita: (document.getElementById('pdf-visita-info') && document.getElementById('pdf-visita-info').dataset.pdf) ? document.getElementById('pdf-visita-info').dataset.pdf : "",
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

/* DOPO ogni mostraCardAggiungi() o funzione che crea una modale input, chiama SEMPRE:
applicaUpperCaseInput();
*/

/* All'avvio esegui forzatura maiuscole su tutti i dati già presenti (solo una volta) */
window.addEventListener('DOMContentLoaded', function() {
  mostraLista();
  if(atleti && Array.isArray(atleti)) {
    let unaVolta = localStorage.getItem('dinamo-uppercased') === '1';
    if (!unaVolta) {
      atleti = atleti.map(upperAll);
      salvaAtleti();
      localStorage.setItem('dinamo-uppercased', '1');
    }
  }
  document.getElementById('btn-aggiungi-bottom').onclick = function() {
    mostraCardAggiungi();
    applicaUpperCaseInput();
  };
  // ... resto invariato (import, export, filtri ...)
});

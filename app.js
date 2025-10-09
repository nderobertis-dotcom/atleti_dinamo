let atleti = JSON.parse(localStorage.getItem('atleti-dinamo')) || [];
let editIndex = null;
let atletaSelezionato = null;
let filtroAttivo = null;

// ... (resto funzioni invariato, dashboard, percentuali ecc.)

function salvaNuovoAtleta() {
  const nuovoAtleta = {
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
  if (!nuovoAtleta.nome || !nuovoAtleta.cognome) {
    alert('Nome e Cognome sono obbligatori');
    return;
  }
  atleti.push(nuovoAtleta);
  salvaAtleti();
  mostraLista();
  clearCardAtleta();
}

function salvaModifica(i) {
  const atleta = {
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
  if (!atleta.nome || !atleta.cognome) {
    alert('Nome e Cognome sono obbligatori');
    return;
  }
  atleti[i] = atleta;
  salvaAtleti();
  mostraLista();
  mostraCardAtleta(i);
}

window.addEventListener('DOMContentLoaded', function() {
  mostraLista();
  document.getElementById('btn-aggiungi-bottom').onclick = function() {
    mostraCardAggiungi();
    // nessun uppercase in input
  };
  document.getElementById('file-import').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        let importedData = JSON.parse(evt.target.result);
        if (Array.isArray(importedData)) {
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

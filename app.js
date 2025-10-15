document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('atleta-form');
  const lista = document.getElementById('atleti-list');
  let lastFiltro = 'all';

  // Carica la lista atleti da localStorage
  function caricaAtleti() {
    try {
      let dati = localStorage.getItem('atleti');
      if (!dati) return [];
      let arr = JSON.parse(dati);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  // Salva lista atleti in localStorage
  function salvaAtleti(arr) {
    localStorage.setItem('atleti', JSON.stringify(arr));
  }

  // Genera ID unico per atleta nuovo
  function generaId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  // Calcola età da data di nascita ISO
  function calcolaEta(data) {
    if (!data) return "";
    const oggi = new Date();
    const nascita = new Date(data);
    let età = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) età--;
    return età;
  }

  // Visualizza lista filtrata
  function mostraAtleti(filtro = 'all') {
    let atleti = caricaAtleti();

    // Ordina alfabeticamente per Nome+Cognome
    atleti.sort((a,b) => ((a.nome||"")+(a.cognome||"")).toUpperCase().localeCompare(((b.nome||"")+(b.cognome||"")).toUpperCase()));

    // Se filtro applica
    const oggiStr = new Date().toISOString().slice(0,10);
    if (filtro === 'maschi') {
      atleti = atleti.filter(a => a.sesso === 'M');
    } else if (filtro === 'femmine') {
      atleti = atleti.filter(a => a.sesso === 'F');
    }

    // Popola lista
    lista.innerHTML = '';
    if (atleti.length === 0) {
      lista.innerHTML = '<li>Nessun atleta trovato</li>';
      return;
    }

    for (const a of atleti) {
      const eta = calcolaEta(a.dataNascita);
      const li = document.createElement('li');
      li.textContent = `${a.nome || ''} ${a.cognome || ''} - Sesso: ${a.sesso || ''} - Età: ${eta}`;
      lista.appendChild(li);
    }
  }

  // Gestione submit form
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = form.nome.value.trim().toUpperCase();
    const cognome = form.cognome.value.trim().toUpperCase();
    const sesso = form.sesso.value.toUpperCase();
    const dataNascita = form.dataNascita.value;
    const ruolo = form.ruolo.value.toUpperCase();
    const codiceFiscale = form.codiceFiscale.value.trim().toUpperCase();
    const cellulare = form.cellulare.value.trim();
    const scadenzaVisita = form.scadenzaVisita.value;

    if (!nome || !cognome || !sesso || !dataNascita || !ruolo || !codiceFiscale || !cellulare || !scadenzaVisita) {
      alert('Compila tutti i campi.');
      return;
    }

    let atleti = caricaAtleti();
    atleti.push({
      id: generaId(),
      nome, cognome, sesso, dataNascita, ruolo, codiceFiscale, cellulare, scadenzaVisita
    });
    salvaAtleti(atleti);
    mostraAtleti();

    form.reset();
  });

  // Visualizza lista iniziale
  mostraAtleti();
});

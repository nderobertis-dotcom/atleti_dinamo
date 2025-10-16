document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('atleta-form');
  const list = document.getElementById('atleti-list');
  const dashboard = document.getElementById('dashboard');
  let filtroAttivo = 'all';

  // Funzioni per gestione dati
  function caricaAtleti() {
    let dati = localStorage.getItem('atleti');
    if (!dati) return [];
    try {
      return JSON.parse(dati);
    } catch {
      return [];
    }
  }

  function salvaAtleti(lista) {
    localStorage.setItem('atleti', JSON.stringify(lista));
  }

  function generaId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function calcolaEta(data) {
    if (!data) return '';
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

  function statoVisita(scad) {
    if (!scad) return 'ok';
    const oggi = new Date().toISOString().slice(0, 10);
    const diff = daysBetween(scad, oggi);
    return diff < 0 ? 'scaduta' : diff <= 31 ? 'scanza' : 'ok';
  }

  function formattaData(data) {
    if (!data) return '';
    const [anno, mese, giorno] = data.split('-');
    return `${giorno}/${mese}/${anno}`;
  }

  function filtraAtleti(filtro) {
    let lista = caricaAtleti().sort((a, b) => a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome));
    const oggi = new Date().toISOString().slice(0, 10);
    if (filtro === 'maschi') lista = lista.filter(x => x.sesso === 'M');
    else if (filtro === 'femmine') lista = lista.filter(x => x.sesso === 'F');
    else if (filtro === 'scadenza') lista = lista.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) >= 0 && daysBetween(x.scadenzaVisita, oggi) <= 31);
    else if (filtro === 'scadute') lista = lista.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) < 0);
    return lista;
  }

  function aggiornaDashboard() {
    const lista = caricaAtleti();
    const oggi = new Date().toISOString().slice(0, 10);
    document.getElementById('tot-atleti').textContent =

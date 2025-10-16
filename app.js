document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('atleta-form');
  const list = document.getElementById('atleti-list');
  let filtroAttivo = 'all';

  function caricaAtleti() {
    return JSON.parse(localStorage.getItem('atleti') || '[]');
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

  function formattaData(d) {
    if (!d) return '';
    const [anno, mese, giorno] = d.split('-');
    return `${giorno}/${mese}/${anno}`;
  }

  function filtraAtleti(filtro) {
    let a = caricaAtleti().sort((a, b) => a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome));
    const oggi = new Date().toISOString().slice(0, 10);
    if (filtro === 'maschi') {
      a = a.filter(x => x.sesso === 'M');
    } else if (filtro === 'femmine') {
      a = a.filter(x => x.sesso === 'F');
    } else if (filtro === 'scadenza') {
      a = a.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) >= 0 && daysBetween(x.scadenzaVisita, oggi) <= 31);
    } else if (filtro === 'scadute') {
      a = a.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) < 0);
    }
    return a;
  }

  function aggiornaDashboard() {
    const a = caricaAtleti();
    const oggi = new Date().toISOString().slice(0, 10);
    document.getElementById('tot-atleti').textContent = a.length;
    document.getElementById('tot-maschi').textContent = a.filter(x => x.sesso === 'M').length;
    document.getElementById('tot-femmine').textContent = a.filter(x => x.sesso === 'F').length;
    document.getElementById('tot-in-scadenza').textContent = a.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) >= 0 && daysBetween(x.scadenzaVisita, oggi) <= 31).length;
    document.getElementById('tot-scadute').textContent = a.filter(x => x.scadenzaVisita && daysBetween(x.scadenzaVisita, oggi) < 0).length;
    const totEta = a.reduce((sum, x) => sum + (x.dataNascita ? calcolaEta(x.dataNascita) : 0), 0);
    document.getElementById('eta-media').textContent = a.length ? (totEta / a.length).toFixed(1) : 0;
  }

  function mostraAtleti(filtro = filtroAttivo) {
    filtroAttivo = filtro;
    const atleti = filtraAtleti(filtro);
    list.innerHTML = '';
    aggiornaDashboard();

    if (atleti.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nessun atleta trovato';
      list.appendChild(li);
      return;
    }

    atleti.forEach(x => {
      const stato = statoVisita(x.scadenzaVisita);
      const cl = { ok: 'data-ok', scanza: 'data-scanza', scaduta: 'data-scaduta' }[stato] || 'data-ok';
      const li = document.createElement('li');
      li.innerHTML = `<span>
        <strong>${x.codiceAtleta}</strong> - ${x.nome} ${x.cognome} – ${x.sesso} – ${x.ruolo}
        <br>nato il ${formattaData(x.dataNascita)} – Età: ${calcolaEta(x.dataNascita)}
        <br>CF: ${x.codiceFiscale} – Cell: ${x.cellulare}
        <br><span class="${cl}">SCADENZA VISITA: ${formattaData(x.scadenzaVisita)}</span>
        <br>${x.certificatoMedico ? '(Certificato caricato)' : '(Nessun certificato)'}
      </span>
      <div class="btn-group">
        <button class="btn-small btn-visualizza" data-id="${x.id}">V</button>
        <button class="btn-small btn-modifica" data-id="${x.id}">M</button>
        <button class="btn-small btn-cancella" data-id="${x.id}">C</button>
      </div>`;
      list.appendChild(li);
    });

    document.querySelectorAll('.btn-cancella').forEach(b => b.onclick = () => cancella(b.dataset.id));
    document.querySelectorAll('.btn-visualizza').forEach(b => b.onclick = () => visualizza(b.dataset.id));
    document.querySelectorAll('.btn-modifica').forEach(b => b.onclick = () => modifica(b.dataset.id));
  }

  // Event delegation su container dashboard per filtro efficiente e funzionante
  document.getElementById('dashboard').addEventListener('click', e => {
    const card = e.target.closest('.dash-card');
    if (!card) return;
    mostraAtleti(card.dataset.filter || 'all');
  });

  function cancella(id) {
    let a = caricaAtleti();
    const idx = a.findIndex(x => x.id === id);
    if (idx !== -1 && confirm('Confermi eliminazione atleta?')) {
      a.splice(idx, 1);
      salvaAtleti(a);
      mostraAtleti();
    }
  }

  function visualizza(id) {
    const a = caricaAtleti().find(x => x.id === id);
    if (!a) return;
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('dettaglio-atleta').innerHTML = `
      <h2>${a.codiceAtleta} - ${a.nome} ${a.cognome}</h2>
      <p>Sesso: ${a.sesso}</p>
      <p>Ruolo: ${a.ruolo}</p>
      <p>Data nascita: ${a.dataNascita ? formattaData(a.dataNascita) : ''}</p>
      <p>Età: ${calcolaEta(a.dataNascita)}</p>
      <p>CF: ${a.codiceFiscale}</p>
      <p>Cell: ${a.cellulare}</p>
      <p><span>SCADENZA VISITA: ${a.scadenzaVisita ? formattaData(a.scadenzaVisita) : ''}</span></p>
      ${a.certificatoMedico ? `<p><a href="${a.certificatoMedico}" target="_blank">Visualizza certificato medico</a></p>` : '<p>(Nessun certificato medico caricato)</p>'}
      `;
  }

  function modifica(id) {
    const a = caricaAtleti().find(x => x.id === id);
    if (!a) return;
    ['codiceAtleta', 'nome', 'cognome', 'sesso', 'dataNascita', 'ruolo', 'codiceFiscale', 'cellulare', 'scadenzaVisita'].forEach(f => {
      document.getElementById('mod-' + f).value = a[f] || '';
    });
    document.getElementById('modifica-form').dataset.id = id;
    document.getElementById('modal-modifica').style

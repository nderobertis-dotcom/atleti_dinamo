document.addEventListener('DOMContentLoaded', function() {
  mostraAtleti();

  document.getElementById('atleta-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value.trim().toUpperCase();
    const cognome = document.getElementById('cognome').value.trim().toUpperCase();
    const sesso = document.getElementById('sesso').value.toUpperCase();
    const dataNascita = document.getElementById('dataNascita').value;
    const ruolo = document.getElementById('ruolo').value.toUpperCase();
    const codiceFiscale = document.getElementById('codiceFiscale').value.trim().toUpperCase();
    const cellulare = document.getElementById('cellulare').value.trim();

    if (!nome || !cognome || !sesso || !dataNascita || !ruolo || !codiceFiscale || !cellulare) {
      alert('Per favore compila tutti i campi.');
      return;
    }

    const atleta = { nome, cognome, sesso, dataNascita, ruolo, codiceFiscale, cellulare };
    let atleti = [];
    try {
      atleti = JSON.parse(localStorage.getItem('atleti')) || [];
    } catch {
      atleti = [];
    }
    atleti.push(atleta);
    localStorage.setItem('atleti', JSON.stringify(atleti));

    mostraAtleti();
    this.reset();
  });
});

function formattaData(dataIso) {
  if (!dataIso) return "";
  const [anno, mese, giorno] = dataIso.split("-");
  return `${giorno}/${mese}/${anno}`;
}

function mostraAtleti() {
  const atletiList = document.getElementById('atleti-list');
  atletiList.innerHTML = '';
  let atleti = [];
  try {
    atleti = JSON.parse(localStorage.getItem('atleti')) || [];
  } catch {
    atleti = [];
  }
  atleti.forEach((atleta, idx) => {
    const dataFormattata = formattaData(atleta.dataNascita);

    const li = document.createElement('li');
    li.innerHTML = `
      <span>
        ${atleta.nome} ${atleta.cognome} – ${atleta.sesso} – ${atleta.ruolo}
        <br>nato il ${dataFormattata} – <strong>CF:</strong> ${atleta.codiceFiscale}
        <br><strong>Cell:</strong> ${atleta.cellulare}
      </span>
      <div class="btn-group">
        <button class="btn-small btn-visualizza" title="Visualizza" data-idx="${idx}">V</button>
        <button class="btn-small btn-modifica" title="Modifica" data-idx="${idx}">M</button>
        <button class="btn-small btn-cancella" title="Cancella" data-idx="${idx}">C</button>
      </div>
    `;
    atletiList.appendChild(li);
  });

  document.querySelectorAll('.btn-visualizza').forEach(btn => {
    btn.onclick = function() { visualizzaAtleta(parseInt(this.dataset.idx)); };
  });
  document.querySelectorAll('.btn-cancella').forEach(btn => {
    btn.onclick = function() { cancellaAtleta(parseInt(this.dataset.idx)); };
  });
  document.querySelectorAll('.btn-modifica').forEach(btn => {
    btn.onclick = function() { avviaModificaAtleta(parseInt(this.dataset.idx)); };
  });
}

// Modal visualizza atleta
function visualizzaAtleta(idx) {
  let atleti = JSON.parse(localStorage.getItem('atleti')) || [];
  let atleta = atleti[idx];
  const dataFormattata = formattaData(atleta.dataNascita);

  document.getElementById('dettaglio-atleta').innerHTML = `
    <h2>${atleta.nome} ${atleta.cognome}</h2>
    <p><strong>Sesso:</strong> ${atleta.sesso}</p>
    <p><strong>Ruolo:</strong> ${atleta.ruolo}</p>
    <p><strong>Data di Nascita:</strong> ${dataFormattata}</p>
    <p><strong>Codice Fiscale:</strong> ${atleta.codiceFiscale}</p>
    <p><strong>Cellulare:</strong> ${atleta.cellulare}</p>
  `;
  document.getElementById('modal').style.display = 'flex';
  document.querySelector('.close-btn').onclick = function() {
    document.getElementById('modal').style.display = 'none';
  };
}

// Cancella atleta
function cancellaAtleta(idx) {
  let atleti = JSON.parse(localStorage.getItem('atleti')) || [];
  if(confirm("Vuoi cancellare questo atleta?")) {
    atleti.splice(idx, 1);
    localStorage.setItem('atleti', JSON.stringify(atleti));
    mostraAtleti();
  }
}

// Modifica atleta (modale)
function avviaModificaAtleta(idx) {
  let atleti = JSON.parse(localStorage.getItem('atleti')) || [];
  let atleta = atleti[idx];
  document.getElementById('mod-nome').value = atleta.nome;
  document.getElementById('mod-cognome').value = atleta.cognome;
  document.getElementById('mod-sesso').value = atleta.sesso;
  document.getElementById('mod-dataNascita').value = atleta.dataNascita;
  document.getElementById('mod-ruolo').value = atleta.ruolo;
  document.getElementById('mod-codiceFiscale').value = atleta.codiceFiscale;
  document.getElementById('mod-cellulare').value = atleta.cellulare;

  document.getElementById('modal-modifica').style.display = 'flex';

  document.querySelector('.close-btn-modifica').onclick = function() {
    document.getElementById('modal-modifica').style.display = 'none';
  };

  document.getElementById('modifica-form').onsubmit = function(e) {
    e.preventDefault();
    atleti[idx] = {
      nome: document.getElementById('mod-nome').value.trim().toUpperCase(),
      cognome: document.getElementById('mod-cognome').value.trim().toUpperCase(),
      sesso: document.getElementById('mod-sesso').value.toUpperCase(),
      dataNascita: document.getElementById('mod-dataNascita').value,
      ruolo: document.getElementById('mod-ruolo').value.toUpperCase(),
      codiceFiscale: document.getElementById('mod-codiceFiscale').value.trim().toUpperCase(),
      cellulare: document.getElementById('mod-cellulare').value.trim()
    };
    localStorage.setItem('atleti', JSON.stringify(atleti));
    document.getElementById('modal-modifica').style.display = 'none';
    mostraAtleti();
  };
}

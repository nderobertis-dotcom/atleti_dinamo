document.addEventListener('DOMContentLoaded', function() {
  mostraAtleti();

  document.getElementById('atleta-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const cognome = document.getElementById('cognome').value.trim();
    const dataNascita = document.getElementById('dataNascita').value;
    const ruolo = document.getElementById('ruolo').value;

    if (!nome || !cognome || !dataNascita || !ruolo) {
      alert('Per favore compila tutti i campi.');
      return;
    }

    const atleta = { nome, cognome, dataNascita, ruolo };
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
  // dataIso: formato "YYYY-MM-DD"
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
      <span>${atleta.nome} ${atleta.cognome} –
        ${atleta.ruolo} (nato il ${dataFormattata})</span>
      <div class="btn-group">
        <button class="btn-small btn-visualizza" title="Visualizza" data-idx="${idx}">V</button>
        <button class="btn-small btn-modifica" title="Modifica" data-idx="${idx}">M</button>
        <button class="btn-small btn-cancella" title="Cancella" data-idx="${idx}">C</button>
      </div>
    `;
    atletiList.appendChild(li);
  });

  document.querySelectorAll('.btn-visualizza').forEach(btn => {
    btn.onclick = function() {
      visualizzaAtleta(parseInt(this.dataset.idx));
    };
  });
  document.querySelectorAll('.btn-cancella').forEach(btn => {
    btn.onclick = function() {
      cancellaAtleta(parseInt(this.dataset.idx));
    };
  });
  document.querySelectorAll('.btn-modifica').forEach(btn => {
    btn.onclick = function() {
      modificaAtleta(parseInt(this.dataset.idx));
    };
  });
}

function visualizzaAtleta(idx) {
  let atleti = JSON.parse(localStorage.getItem('atleti')) || [];
  let atleta = atleti[idx];
  const dataFormattata = formattaData(atleta.dataNascita);

  document.getElementById('dettaglio-atleta').innerHTML = `
    <h2>${atleta.nome} ${atleta.cognome}</h2>
    <p><strong>Ruolo:</strong> ${atleta.ruolo}</p>
    <p><strong>Data di Nascita:</strong> ${dataFormattata}</p>
    <!-- Qui puoi aggiungere altri dati -->
  `;
  document.getElementById('modal').style.display = 'flex';

  document.querySelector('.close-btn').onclick = function() {
    document.getElementById('modal').style.display = 'none';
  };
}

function cancellaAtleta(idx) {
  let atleti = JSON.parse(localStorage.getItem('atleti')) || [];
  if(confirm("Vuoi cancellare questo atleta?")) {
    atleti.splice(idx, 1);
    localStorage.setItem('atleti', JSON.stringify(atleti));
    mostraAtleti();
  }
}

function modificaAtleta(idx) {
  alert("Funzionalità di modifica in sviluppo!");
}

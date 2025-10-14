// Attendi che il DOM sia pronto
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

// Funzione per mostrare la lista atleti salvati
function mostraAtleti() {
  const atletiList = document.getElementById('atleti-list');
  atletiList.innerHTML = '';
  let atleti = [];
  try {
    atleti = JSON.parse(localStorage.getItem('atleti')) || [];
  } catch {
    atleti = [];
  }
  atleti.forEach(atleta => {
    const li = document.createElement('li');
    li.textContent = `${atleta.nome} ${atleta.cognome} – ${atleta.ruolo} (nato il ${atleta.dataNascita})`;
    atletiList.appendChild(li);
  });
}

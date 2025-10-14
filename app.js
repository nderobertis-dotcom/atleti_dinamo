document.addEventListener('DOMContentLoaded', () => {
  showAtleti();

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
    let atleti = JSON.parse(localStorage.getItem('atleti')) || [];
    atleti.push(atleta);
    localStorage.setItem('atleti', JSON.stringify(atleti));

    showAtleti();
    this.reset();
  });
});

function showAtleti() {
  const atletiList = document.getElementById('atleti-list');
  atletiList.innerHTML = '';
  const atleti = JSON.parse(localStorage.getItem('atleti')) || [];
  atleti.forEach(atleta => {
    const li = document.createElement('li');
    li.textContent = `${atleta.nome} ${atleta.cognome} – ${atleta.ruolo} (nato il ${atleta.dataNascita})`;
    atletiList.appendChild(li);
  });
}

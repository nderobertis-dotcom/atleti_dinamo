let atleti = [];
function aggiungiAtleta() {
  const nome = document.getElementById('nome').value;
  const cognome = document.getElementById('cognome').value;
  const dataNascita = document.getElementById('dataNascita').value;
  const altezza = document.getElementById('altezza').value;
  const peso = document.getElementById('peso').value;
  const ruolo = document.getElementById('ruolo').value;
  if (nome === "" || cognome === "") return;
  const atleta = { nome, cognome, dataNascita, altezza, peso, ruolo };
  atleti.push(atleta);
  mostraLista();
}
function mostraLista() {
  const div = document.getElementById('lista-atleti');
  div.innerHTML = '';
  atleti.forEach((a, i) => {
    div.innerHTML += `<div class='atleta'>
      <b>${a.nome} ${a.cognome}</b><br>
      Nascita: ${a.dataNascita} <br>
      Altezza: ${a.altezza} cm, Peso: ${a.peso} kg<br>
      Ruolo: ${a.ruolo}
    </div>`;
  });
}

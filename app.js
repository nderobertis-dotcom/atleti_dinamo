llet atleti = [];
let indexInModifica = null;

function aggiungiAtleta() {
  const nome = document.getElementById('nome').value;
  const cognome = document.getElementById('cognome').value;
  const dataNascita = document.getElementById('dataNascita').value;
  const altezza = document.getElementById('altezza').value;
  const peso = document.getElementById('peso').value;
  const ruolo = document.getElementById('ruolo').value;
  const email = document.getElementById('email') ? document.getElementById('email').value : '';
  const note = document.getElementById('note') ? document.getElementById('note').value : '';

  if (nome === "" || cognome === "") return;

  const atleta = { nome, cognome, dataNascita, altezza, peso, ruolo, email, note };

  if (indexInModifica === null) {
    atleti.push(atleta); // aggiunta normale
  } else {
    atleti[indexInModifica] = atleta; // modifica esistente
    indexInModifica = null;
    document.getElementById('aggiungi-btn').innerText = "Aggiungi Atleta";
  }

  document.getElementById('form').reset();
  mostraLista();
}

function mostraLista() {
  const div = document.getElementById('lista-atleti');
  div.innerHTML = '';
  atleti.forEach((a, i) => {
    div.innerHTML += `<div class='atleta'>
      <b>${a.nome} ${a.cognome}</b><br>
      Nascita: ${a.dataNascita}<br>
      Altezza: ${a.altezza} cm, Peso: ${a.peso} kg<br>
      Ruolo: ${a.ruolo}<br>
      Email: ${a.email || '-'}<br>
      Note: ${a.note || '-'}<br>
      <button onclick="modificaAtleta(${i})">Modifica</button>
      <button onclick="eliminaAtleta(${i})" style="color:red">Elimina</button>
    </div>`;
  });
}

function modificaAtleta(i) {
  let a = atleti[i];
  document.getElementById('nome').value = a.nome;
  document.getElementById('cognome').value = a.cognome;
  document.getElementById('dataNascita').value = a.dataNascita;
  document.getElementById('altezza').value = a.altezza;
  document.getElementById('peso').value = a.peso;
  document.getElementById('ruolo').value = a.ruolo;
  if (document.getElementById('email')) document.getElementById('email').value = a.email;
  if (document.getElementById('note')) document.getElementById('note').value = a.note;
  indexInModifica = i;
  document.getElementById('aggiungi-btn').innerText = "Salva Modifica";
  window.scrollTo(0, 0);
}

function eliminaAtleta(i) {
  if (confirm("Sei sicuro di voler eliminare questo atleta?")) {
    atleti.splice(i, 1);
    mostraLista();
  }
}

// Dopo il caricamento della pagina, collega il bottone corretto
window.onload = function(){
  document.getElementById('aggiungi-btn').onclick = aggiungiAtleta;
  mostraLista();
};

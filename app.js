let atleti = [];

function aggiungiAtleta() {
  console.log("Funzione chiamata!"); // Per debug
  
  const nome = document.getElementById('nome').value;
  const cognome = document.getElementById('cognome').value;
  const ruolo = document.getElementById('ruolo').value;
  
  if (!nome || !cognome || !ruolo) {
    alert('Compila almeno Nome, Cognome e Ruolo');
    return;
  }
  
  const atleta = {
    nome: nome,
    cognome: cognome,
    ruolo: ruolo,
    dataNascita: document.getElementById('dataNascita').value,
    altezza: document.getElementById('altezza').value,
    peso: document.getElementById('peso').value,
    email: document.getElementById('email').value,
    note: document.getElementById('note').value
  };
  
  atleti.push(atleta);
  mostraLista();
  document.getElementById('form').reset();
  alert('Atleta aggiunto!');
}

function mostraLista() {
  const div = document.getElementById('lista-atleti');
  div.innerHTML = '';
  
  atleti.forEach((a, i) => {
    div.innerHTML += `
      <div class='atleta'>
        <div class="atleta-nome"><strong>${a.nome} ${a.cognome}</strong></div>
        <div>Ruolo: ${a.ruolo}</div>
        <div>Altezza: ${a.altezza || '-'} cm</div>
        <div>Peso: ${a.peso || '-'} kg</div>
        <button onclick="eliminaAtleta(${i})">Elimina</button>
      </div>
    `;
  });
}

function eliminaAtleta(i) {
  if (confirm('Sicuro di eliminare questo atleta?')) {
    atleti.splice(i, 1);
    mostraLista();
  }
}

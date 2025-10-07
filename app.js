let atleti = JSON.parse(localStorage.getItem('atleti-dinamo')) || [];
let indexInModifica = null;

function aggiungiAtleta() {
  const nome = document.getElementById('nome').value.trim();
  const cognome = document.getElementById('cognome').value.trim();
  const dataNascita = document.getElementById('dataNascita').value;
  const email = document.getElementById('email').value.trim();
  const altezza = document.getElementById('altezza').value;
  const peso = document.getElementById('peso').value;
  const ruolo = document.getElementById('ruolo').value;
  const numeroMaglia = document.getElementById('numeroMaglia').value;
  const note = document.getElementById('note').value.trim();

  if (!nome || !cognome || !ruolo) {
    alert('Per favore compila almeno Nome, Cognome e Ruolo');
    return;
  }

  // Controlla numero maglia duplicato (solo se specificato)
  if (numeroMaglia) {
    const magliaDuplicata = atleti.some((a, i) => 
      a.numeroMaglia === numeroMaglia && i !== indexInModifica
    );
    if (magliaDuplicata) {
      alert('Numero maglia già assegnato a un altro atleta!');
      return;
    }
  }

  const atleta = {
    nome,
    cognome,
    dataNascita,
    email,
    altezza: altezza ? parseInt(altezza) : null,
    peso: peso ? parseInt(peso) : null,
    ruolo,
    numeroMaglia: numeroMaglia ? parseInt(numeroMaglia) : null,
    note,
    dataCreazione: indexInModifica === null ? new Date().toISOString() : atleti[indexInModifica].dataCreazione
  };

  if (indexInModifica === null) {
    atleti.push(atleta);
  } else {
    atleti[indexInModifica] = atleta;
    annullaModifica();
  }

  salvaAtleti();
  resetForm();
  mostraLista();
  aggiornaStatistiche();
}

function modificaAtleta(i) {
  const a = atleti[i];
  document.getElementById('nome').value = a.nome;
  document.getElementById('cognome').value = a.cognome;
  document.getElementById('dataNascita').value = a.dataNascita || '';
  document.getElementById('email').value = a.email || '';
  document.getElementById('altezza').value = a.altezza || '';
  document.getElementById('peso').value = a.peso || '';
  document.getElementById('ruolo').value = a.ruolo;
  document.getElementById('numeroMaglia').value = a.numeroMaglia || '';
  document.getElementById('note').value = a.note || '';
  
  indexInModifica = i;
  document.getElementById('aggiungi-btn').textContent = 'Salva Modifica';
  document.getElementById('annulla-btn').style.display = 'inline-block';
  
  // Scroll in alto per vedere il form
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function annullaModifica() {
  indexInModifica = null;
  document.getElementById('aggiungi-btn').textContent = 'Aggiungi Atleta';
  document.getElementById('annulla-btn').style.display = 'none';
  resetForm();
}

function eliminaAtleta(i) {
  const atleta = atleti[i];
  if (confirm(`Sei sicuro di voler eliminare ${atleta.nome} ${atleta.cognome}?`)) {
    atleti.splice(i, 1);
    salvaAtleti();
    mostraLista();
    aggiornaStatistiche();
    
    // Se stavo modificando questo atleta, annulla la modifica
    if (indexInModifica === i) {
      annullaModifica();
    } else if (indexInModifica > i) {
      indexInModifica--;
    }
  }
}

function calcolaEta(dataNascita) {
  if (!dataNascita) return null;
  const oggi = new Date();
  const nascita = new Date(dataNascita);
  let eta = oggi.getFullYear() - nascita.getFullYear();
  const mesiDiff = oggi.getMonth() - nascita.getMonth();
  
  if (mesiDiff < 0 || (mesiDiff === 0 && oggi.getDate() < nascita.getDate())) {
    eta--;
  }
  return eta;
}

function mostraLista() {
  const div = document.getElementById('lista-atleti');
  const listaVuota = document.getElementById('lista-vuota');
  
  if (atleti.length === 0) {
    div.style.display = 'none';
    listaVuota.style.display = 'block';
    return;
  }
  
  div.style.display = 'grid';
  listaVuota.style.display = 'none';
  
  // Ordina per ruolo e poi per nome
  const atletiOrdinati = [...atleti].sort((a, b) => {
    if (a.ruolo !== b.ruolo) return a.ruolo.localeCompare(b.ruolo);
    return a.nome.localeCompare(b.nome);
  });
  
  div.innerHTML = atletiOrdinati.map((a, originalIndex) => {
    const realIndex = atleti.indexOf(a);
    const eta = calcolaEta(a.dataNascita);
    
    return `
      <div class='atleta'>
        <div class="atleta-header">
          <div class="atleta-nome">${a.nome} ${a.cognome}</div>
          ${a.numeroMaglia ? `<div class="numero-maglia">${a.numeroMaglia}</div>` : ''}
        </div>
        
        <div class="atleta-ruolo">${a.ruolo}</div>
        
        <div class="atleta-dettagli">
          ${eta ? `<div><strong>Età:</strong> ${eta} anni</div>` : ''}
          ${a.dataNascita ? `<div><strong>Nascita:</strong> ${new Date(a.dataNascita).toLocaleDateString('it-IT')}</div>` : ''}
          ${a.altezza ? `<div><strong>Altezza:</strong> ${a.altezza} cm</div>` : ''}
          ${a.peso ? `<div><strong>Peso:</strong> ${a.peso} kg</div>` : ''}
          ${a.email ? `<div><strong>Email:</strong> ${a.email}</div>` : ''}
          ${a.note ? `<div><strong>Note:</strong> ${a.note}</div>` : ''}
        </div>
        
        <div class="atleta-azioni">
          <button class="btn-modifica" onclick="modificaAtleta(${realIndex})">✏️ Modifica</button>
          <button class="btn-elimina" onclick="eliminaAtleta(${realIndex})">🗑️ Elimina</button>
        </div>
      </div>`;
  }).join('');
}

function aggiornaStatistiche() {
  const totalAtleti = document.getElementById('total-atleti');
  const etaMedia = document.getElementById('eta-media');
  const altezzaMedia = document.getElementById('altezza-media');
  
  totalAtleti.textContent = atleti.length;
  
  if (atleti.length === 0) {
    etaMedia.textContent = '-';
    altezzaMedia.textContent = '-';
    return;
  }
  
  // Calcola età media (solo per atleti con data nascita)
  const atletiConEta = atleti.filter(a => a.dataNascita);
  if (atletiConEta.length > 0) {
    const sommaEta = atletiConEta.reduce((sum, a) => sum + calcolaEta(a.dataNascita), 0);
    etaMedia.textContent = Math.round(sommaEta / atletiConEta.length) + ' anni';
  } else {
    etaMedia.textContent = '-';
  }
  
  // Calcola altezza media (solo per atleti con altezza)
  const atletiConAltezza = atleti.filter(a => a.altezza);
  if (atletiConAltezza.length > 0) {
    const sommaAltezza = atletiConAltezza.reduce((sum, a) => sum + a.altezza, 0);
    altezzaMedia.textContent = Math.round(sommaAltezza / atletiConAltezza.length) + ' cm';
  } else {
    altezzaMedia.textContent = '-';
  }
}

function salvaAtleti() {
  localStorage.setItem('atleti-dinamo', JSON.stringify(atleti));
}

function resetForm() {
  document.getElementById('form').reset();
}

// Inizializzazione quando la pagina è caricata
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('aggiungi-btn').addEventListener('click', aggiungiAtleta);
  document.getElementById('annulla-btn').addEventListener('click', annullaModifica);
  
  mostraLista();
  aggiornaStatistiche();
});

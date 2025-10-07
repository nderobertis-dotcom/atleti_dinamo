let atleti = JSON.parse(localStorage.getItem('atleti-dinamo')) || [];
let editIndex = null;
let nuovaCard = false;

function mostraLista() {
  const div = document.getElementById('lista-atleti');
  const listaVuota = document.getElementById('lista-vuota');
  
  if (atleti.length === 0 && !nuovaCard) {
    div.style.display = 'none';
    listaVuota.style.display = 'block';
    return;
  }
  
  div.style.display = 'grid';
  listaVuota.style.display = 'none';
  div.innerHTML = '';

  // Mostra tutti gli atleti esistenti
  atleti.forEach((a, i) => {
    div.innerHTML += (editIndex === i) ? buildCardEdit(a, i) : buildCardView(a, i);
  });
  
  // Se stiamo aggiungendo un nuovo atleta, mostra la card vuota in modifica
  if (nuovaCard) {
    div.innerHTML += buildCardEdit({
      nome: '', cognome: '', dataNascita: '', email: '', altezza: '', 
      peso: '', ruolo: '', numeroMaglia: '', note: ''
    }, atleti.length, true);
  }
}

function buildCardView(a, i) {
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
        <button class="btn-modifica" onclick="modificaAtleta(${i})">✏️ Modifica</button>
        <button class="btn-elimina" onclick="eliminaAtleta(${i})">🗑️ Elimina</button>
      </div>
    </div>`;
}

function buildCardEdit(a, i, nuova = false) {
  return `
    <div class='atleta' style="border: 3px solid #4CAF50;">
      <div class="atleta-header">
        <div style="width: 100%;">
          <input type="text" class="input-card" id="nome${i}" value="${a.nome || ''}" placeholder="Nome *">
          <input type="text" class="input-card" id="cognome${i}" value="${a.cognome || ''}" placeholder="Cognome *">
        </div>
      </div>
      <div class="atleta-dettagli">
        <select class="select-card" id="ruolo${i}">
          <option value="">Seleziona ruolo *</option>
          <option value="Palleggiatore" ${a.ruolo === 'Palleggiatore' ? 'selected' : ''}>Palleggiatore</option>
          <option value="Libero" ${a.ruolo === 'Libero' ? 'selected' : ''}>Libero</option>
          <option value="Schiacciatore" ${a.ruolo === 'Schiacciatore' ? 'selected' : ''}>Schiacciatore</option>
          <option value="Centrale" ${a.ruolo === 'Centrale' ? 'selected' : ''}>Centrale</option>
          <option value="Opposto" ${a.ruolo === 'Opposto' ? 'selected' : ''}>Opposto</option>
        </select>
        <input type="number" class="input-card" id="numeroMaglia${i}" value="${a.numeroMaglia || ''}" placeholder="Numero maglia (1-99)" min="1" max="99">
        <input type="date" class="input-card" id="dataNascita${i}" value="${a.dataNascita || ''}" title="Data di nascita">
        <input type="number" class="input-card" id="altezza${i}" value="${a.altezza || ''}" placeholder="Altezza (cm)" min="150" max="220">
        <input type="number" class="input-card" id="peso${i}" value="${a.peso || ''}" placeholder="Peso (kg)" min="40" max="150">
        <input type="email" class="input-card" id="email${i}" value="${a.email || ''}" placeholder="Email">
        <input type="text" class="input-card" id="note${i}" value="${a.note || ''}" placeholder="Note aggiuntive">
      </div>
      <div class="atleta-azioni">
        <button onclick="${nuova ? `salvaAtleta(${i}, true)` : `salvaAtleta(${i})`}">💾 Salva</button>
        <button onclick="annullaEdit()">❌ Annulla</button>
      </div>
    </div>`;
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

function modificaAtleta(i) {
  editIndex = i;
  nuovaCard = false;
  mostraLista();
}

function annullaEdit() {
  editIndex = null;
  nuovaCard = false;
  mostraLista();
}

function salvaAtleta(i, isNuova = false) {
  const nome = document.getElementById(`nome${i}`).value.trim();
  const cognome = document.getElementById(`cognome${i}`).value.trim();
  const ruolo = document.getElementById(`ruolo${i}`).value;
  const numeroMaglia = document.getElementById(`numeroMaglia${i}`).value;
  const dataNascita = document.getElementById(`dataNascita${i}`).value;
  const altezza = document.getElementById(`altezza${i}`).value;
  const peso = document.getElementById(`peso${i}`).value;
  const email = document.getElementById(`email${i}`).value.trim();
  const note = document.getElementById(`note${i}`).value.trim();

  if (!nome || !cognome || !ruolo) {
    alert('Nome, Cognome e Ruolo sono campi obbligatori!');
    return;
  }

  // Controllo numero maglia duplicato
  if (numeroMaglia) {
    const magliaDuplicata = atleti.some((a, index) => 
      a.numeroMaglia == numeroMaglia && index !== (isNuova ? -1 : i)
    );
    if (magliaDuplicata) {
      alert('Numero maglia già assegnato a un altro atleta!');
      return;
    }
  }

  const atleta = {
    nome,
    cognome,
    ruolo,
    numeroMaglia: numeroMaglia ? parseInt(numeroMaglia) : null,
    dataNascita,
    altezza: altezza ? parseInt(altezza) : null,
    peso: peso ? parseInt(peso) : null,
    email,
    note,
    dataCreazione: isNuova ? new Date().toISOString() : atleti[i].dataCreazione
  };

  if (isNuova) {
    atleti.push(atleta);
  } else {
    atleti[i] = atleta;
  }

  salvaAtleti();
  editIndex = null;
  nuovaCard = false;
  mostraLista();
  aggiornaStatistiche();
}

function eliminaAtleta(i) {
  const atleta = atleti[i];
  if (confirm(`Sei sicuro di voler eliminare ${atleta.nome} ${atleta.cognome}?`)) {
    atleti.splice(i, 1);
    salvaAtleti();
    
    // Se stavo modificando questo atleta, annulla la modifica
    if (editIndex === i) {
      editIndex = null;
    } else if (editIndex > i) {
      editIndex--;
    }
    
    mostraLista();
    aggiornaStatistiche();
  }
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

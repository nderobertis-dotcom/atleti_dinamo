let atleti = JSON.parse(localStorage.getItem('atleti-dinamo')) || [];
let editIndex = null;
let nuovaCard = false;
let atletaSelezionato = null;

function mostraLista() {
  const div = document.getElementById('lista-atleti');
  const listaVuota = document.getElementById('lista-vuota');
  
  if (atleti.length === 0 && !nuovaCard) {
    div.style.display = 'none';
    listaVuota.style.display = 'block';
  } else {
    div.style.display = 'block';
    listaVuota.style.display = 'none';

    // Ordina atleti alfabeticamente per cognome
    const atletiOrdinati = [...atleti].sort((a, b) =>
      (a.cognome || '').localeCompare(b.cognome || '')
    );

    div.innerHTML = atletiOrdinati.map((a, i) => `
      <div class="atleta-list-item">
        <div style="flex:1; font-size: 1.2em;">${a.nome} ${a.cognome}</div>
        <button class="btn-entra" onclick="entraAtleta(${atleti.indexOf(a)})">ENTRA</button>
      </div>
    `).join('');
  }
  
  clearCardAtleta();
  aggiornaStatistiche();
}

function aggiornaStatistiche() {
  // NUMERO ATLETI TOTALI
  document.getElementById('total-atleti').textContent = atleti.length;
  
  if (atleti.length === 0) {
    document.getElementById('eta-media').textContent = '-';
    document.getElementById('altezza-media').textContent = '-';
    return;
  }
  
  // ETÀ MEDIA (calcolo preciso)
  const atletiConEta = atleti.filter(a => a.dataNascita);
  if (atletiConEta.length > 0) {
    const sommaEta = atletiConEta.reduce((sum, a) => {
      const eta = calcolaEta(a.dataNascita);
      return sum + (eta || 0);
    }, 0);
    const mediaEta = Math.round(sommaEta / atletiConEta.length);
    document.getElementById('eta-media').textContent = mediaEta + ' anni';
  } else {
    document.getElementById('eta-media').textContent = '-';
  }
  
  // ALTEZZA MEDIA (calcolo preciso)
  const atletiConAltezza = atleti.filter(a => a.altezza && !isNaN(a.altezza));
  if (atletiConAltezza.length > 0) {
    const sommaAltezza = atletiConAltezza.reduce((sum, a) => sum + parseInt(a.altezza), 0);
    const mediaAltezza = Math.round(sommaAltezza / atletiConAltezza.length);
    document.getElementById('altezza-media').textContent = mediaAltezza + ' cm';
  } else {
    document.getElementById('altezza-media').textContent = '-';
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
  return eta > 0 ? eta : null;
}

function entraAtleta(i) {
  atletaSelezionato = i;
  mostraCardAtleta(i);
}

function mostraCardAtleta(i) {
  const a = atleti[i];
  const eta = calcolaEta(a.dataNascita);
  const div = document.getElementById('card-atleta');
  div.innerHTML = `
    <div class="atleta">
      <div class="atleta-header">
        <div class="atleta-nome">${a.nome} ${a.cognome}</div>
        ${a.numeroMaglia ? `<div class="numero-maglia">${a.numeroMaglia}</div>` : ''}
      </div>
      <div class="atleta-ruolo">${a.ruolo || '-'}</div>
      <div class="atleta-dettagli">
        ${eta ? `<div><strong>Età:</strong> ${eta} anni</div>` : ''}
        ${a.dataNascita ? `<div><strong>Nascita:</strong> ${new Date(a.dataNascita).toLocaleDateString('it-IT')}</div>` : ''}
        ${a.altezza ? `<div><strong>Altezza:</strong> ${a.altezza} cm</div>` : ''}
        ${a.peso ? `<div><strong>Peso:</strong> ${a.peso} kg</div>` : ''}
        ${a.email ? `<div><strong>Email:</strong> ${a.email}</div>` : ''}
        ${a.note ? `<div><strong>Note:</strong> ${a.note}</div>` : ''}
      </div>
      <div class="atleta-azioni">
        <button class="btn-modifica" onclick="modificaAtleta(${i})">MODIFICA</button>
        <button class="btn-elimina" onclick="eliminaAtleta(${i})">ELIMINA</button>
      </div>
    </div>
  `;
}

function clearCardAtleta() {
  document.getElementById('card-atleta').innerHTML = '';
  atletaSelezionato = null;
}

function modificaAtleta(i) {
  editIndex = i;
  mostraCardModifica(i);
}

function mostraCardModifica(i) {
  const a = atleti[i];
  const div = document.getElementById('card-atleta');
  div.innerHTML = `
    <div class="atleta" style="background: #f9f9f9; border-color: #4CAF50;">
      <input type="text" class="input-card" id="nome" value="${a.nome || ''}" placeholder="Nome *">
      <input type="text" class="input-card" id="cognome" value="${a.cognome || ''}" placeholder="Cognome *">
      <input type="number" class="input-card" id="numeroMaglia" value="${a.numeroMaglia || ''}" placeholder="Numero maglia (1-99)" min="1" max="99">
      <select class="select-card" id="ruolo">
        <option value="">Ruolo</option>
        <option value="Palleggiatore" ${a.ruolo === 'Palleggiatore' ? 'selected' : ''}>Palleggiatore</option>
        <option value="Libero" ${a.ruolo === 'Libero' ? 'selected' : ''}>Libero</option>
        <option value="Schiacciatore" ${a.ruolo === 'Schiacciatore' ? 'selected' : ''}>Schiacciatore</option>
        <option value="Centrale" ${a.ruolo === 'Centrale' ? 'selected' : ''}>Centrale</option>
        <option value="Opposto" ${a.ruolo === 'Opposto' ? 'selected' : ''}>Opposto</option>
      </select>
      <input type="date" class="input-card" id="dataNascita" value="${a.dataNascita || ''}">
      <input type="number" class="input-card" id="altezza" value="${a.altezza || ''}" placeholder="Altezza (cm)" min="150" max="220">
      <input type="number" class="input-card" id="peso" value="${a.peso || ''}" placeholder="Peso (kg)" min="40" max="150">
      <input type="email" class="input-card" id="email" value="${a.email || ''}" placeholder="Email">
      <input type="text" class="input-card" id="note" value="${a.note || ''}" placeholder="Note aggiuntive">
      <div style="margin-top: 18px;">
        <button onclick="salvaModifica(${i})">SALVA</button>
        <button onclick="annullaEdit()">ANNULLA</button>
      </div>
    </div>
  `;
}

function salvaModifica(i) {
  const nome = document.getElementById('nome').value.trim();
  const cognome = document.getElementById('cognome').value.trim();
  if (!nome || !cognome) { 
    alert('Nome e Cognome sono obbligatori'); 
    return; 
  }
  
  atleti[i] = {
    nome,
    cognome,
    numeroMaglia: document.getElementById('numeroMaglia').value,
    ruolo: document.getElementById('ruolo').value,
    dataNascita: document.getElementById('dataNascita').value,
    altezza: document.getElementById('altezza').value,
    peso: document.getElementById('peso').value,
    email: document.getElementById('email').value,
    note: document.getElementById('note').value,
    dataCreazione: atleti[i].dataCreazione || new Date().toISOString()
  };
  
  salvaAtleti();
  mostraLista();
  mostraCardAtleta(i);
}

function annullaEdit() {
  mostraLista();
  if (atletaSelezionato !== null) {
    mostraCardAtleta(atletaSelezionato);
  } else {
    clearCardAtleta();
  }
}

function eliminaAtleta(i) {
  const atleta = atleti[i];
  if (confirm(`Eliminare ${atleta.nome} ${atleta.cognome}?`)) {
    atleti.splice(i, 1);
    salvaAtleti();
    mostraLista();
    clearCardAtleta();
  }
}

function salvaAtleti() {
  localStorage.setItem('atleti-dinamo', JSON.stringify(atleti));
}

function mostraCardAggiungi() {
  const div = document.getElementById('card-atleta');
  div.innerHTML = `
    <div class="atleta" style="background: #f9f9f9; border-color: #4CAF50;">
      <input type="text" class="input-card" id="nome" placeholder="Nome *">
      <input type="text" class="input-card" id="cognome" placeholder="Cognome *">
      <input type="number" class="input-card" id="numeroMaglia" placeholder="Numero maglia (1-99)" min="1" max="99">
      <select class="select-card" id="ruolo">
        <option value="">Ruolo</option>
        <option value="Palleggiatore">Palleggiatore</option>
        <option value="Libero">Libero</option>
        <option value="Schiacciatore">Schiacciatore</option>
        <option value="Centrale">Centrale</option>
        <option value="Opposto">Opposto</option>
      </select>
      <input type="date" class="input-card" id="dataNascita">
      <input type="number" class="input-card" id="altezza" placeholder="Altezza (cm)" min="150" max="220">
      <input type="number" class="input-card" id="peso" placeholder="Peso (kg)" min="40" max="150">
      <input type="email" class="input-card" id="email" placeholder="Email">
      <input type="text" class="input-card" id="note" placeholder="Note aggiuntive">
      <div style="margin-top: 18px;">
        <button onclick="salvaNuovoAtleta()">SALVA</button>
        <button onclick="annullaEdit()">ANNULLA</button>
      </div>
    </div>
  `;
}

function salvaNuovoAtleta() {
  const nome = document.getElementById('nome').value.trim();
  const cognome = document.getElementById('cognome').value.trim();
  if (!nome || !cognome) { 
    alert('Nome e Cognome sono obbligatori'); 
    return; 
  }
  
  atleti.push({
    nome,
    cognome,
    numeroMaglia: document.getElementById('numeroMaglia').value,
    ruolo: document.getElementById('ruolo').value,
    dataNascita: document.getElementById('dataNascita').value,
    altezza: document.getElementById('altezza').value,
    peso: document.getElementById('peso').value,
    email: document.getElementById('email').value,
    note: document.getElementById('note').value,
    dataCreazione: new Date().toISOString()
  });
  
  salvaAtleti();
  mostraLista();
  clearCardAtleta();
}

// INIZIALIZZAZIONE
window.addEventListener('DOMContentLoaded', function() {
  mostraLista();
  document.getElementById('btn-aggiungi-bottom').onclick = function() {
    mostraCardAggiungi();
  };
});

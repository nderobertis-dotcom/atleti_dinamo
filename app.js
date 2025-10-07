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
    return;
  }
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
  clearCardAtleta();
}

function entraAtleta(i) {
  atletaSelezionato = i;
  mostraCardAtleta(i);
}

function mostraCardAtleta(i) {
  const a = atleti[i];
  const div = document.getElementById('card-atleta');
  div.innerHTML = `
    <div class="atleta">
      <div class="atleta-header">
        <div class="atleta-nome">${a.nome} ${a.cognome}</div>
        ${a.numeroMaglia ? `<div class="numero-maglia">${a.numeroMaglia}</div>` : ''}
      </div>
      <div class="atleta-ruolo">${a.ruolo || '-'}</div>
      <div class="atleta-dettagli">
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
  if (!nome || !cognome) { alert('Nome e Cognome sono obbligatori'); return; }
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
  if (atletaSelezionato !== null) mostraCardAtleta(atletaSelezionato);
  else clearCardAtleta();
}

function eliminaAtleta(i) {
  if (confirm('Eliminare questo atleta?')) {
    atleti.splice(i, 1);
    salvaAtleti();
    annullaEdit();
    mostraLista();
  }
}

function salvaAtleti() {
  localStorage.setItem('atleti-dinamo', JSON.stringify(atleti));
}

window.addEventListener('DOMContentLoaded', function() {
  mostraLista();
});

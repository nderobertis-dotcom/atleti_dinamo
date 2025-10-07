let atleti = JSON.parse(localStorage.getItem('atleti-dinamo')) || [];
let editIndex = null;
let atletaSelezionato = null;

function mostraLista() {
  const div = document.getElementById('lista-atleti');
  const listaVuota = document.getElementById('lista-vuota');
  if (atleti.length === 0) {
    div.style.display = 'none';
    listaVuota.style.display = 'block';
  } else {
    div.style.display = 'block';
    listaVuota.style.display = 'none';
    const atletiOrdinati = [...atleti].sort((a, b) =>
      (a.cognome || '').localeCompare(b.cognome || '')
    );
    div.innerHTML = atletiOrdinati.map((a, i) => `
      <div class="atleta-list-item">
        ${a.foto ? `<img src="${a.foto}" class="foto-atleta-mini">` : ''}
        <div style="flex:1; font-size: 1.2em;">${a.nome} ${a.cognome}</div>
        <button class="btn-entra" onclick="entraAtleta(${atleti.indexOf(a)})">ENTRA</button>
      </div>
    `).join('');
  }
  clearCardAtleta();
  aggiornaStatistiche();
}

function aggiornaStatistiche() {
  document.getElementById('total-atleti').textContent = atleti.length;
  if(atleti.length === 0){
    document.getElementById('eta-media').textContent = '-';
    document.getElementById('altezza-media').textContent = '-';
    return;
  }
  // Età media
  let etaArr = atleti.map(a => calcolaEta(a.dataNascita)).filter(e => e !== null && !isNaN(e));
  document.getElementById('eta-media').textContent =
    etaArr.length ? (Math.round(etaArr.reduce((x,y)=>x+y,0)/etaArr.length) + " anni") : '-';
  // Altezza media
  let altArr = atleti.map(a => Number(a.altezza)).filter(e => e);
  document.getElementById('altezza-media').textContent =
    altArr.length ? (Math.round(altArr.reduce((x,y)=>x+y,0)/altArr.length) + " cm") : '-';
}
function calcolaEta(dataNascita) {
  if (!dataNascita) return null;
  let oggi = new Date();
  let nascita = new Date(dataNascita);
  let anni = oggi.getFullYear() - nascita.getFullYear();
  let m = oggi.getMonth() - nascita.getMonth();
  if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) anni--;
  return anni;
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
      ${a.foto ? `<img src="${a.foto}" class="foto-atleta-big" alt="Foto atleta">` : ''}
      <div class="atleta-header">
        <div class="atleta-nome">${a.nome} ${a.cognome}</div>
        ${a.numeroMaglia ? `<div class="numero-maglia">${a.numeroMaglia}</div>` : ''}
      </div>
      <div class="atleta-ruolo">${a.ruolo || '-'}</div>
      <div class="atleta-dettagli">
        ${eta ? `<div><strong>Età:</strong> ${eta} anni</div>` : ''}
        ${a.dataNascita ? `<div><strong>Nascita:</strong> ${new Date(a.dataNascita).toLocaleDateString('it-IT')}</div>` : ''}
        ${a.codiceFiscale ? `<div><strong>Codice fiscale:</strong> ${a.codiceFiscale}</div>` : ''}
        ${a.altezza ? `<div><strong>Altezza:</strong> ${a.altezza} cm</div>` : ''}
        ${a.peso ? `<div><strong>Peso:</strong> ${a.peso} kg</div>` : ''}
        ${a.email ? `<div><strong>Email:</strong> ${a.email}</div>` : ''}
        ${a.cellulare ? `<div><strong>Cellulare:</strong> ${a.cellulare}</div>` : ''}
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
  const a = atleti[i];
  const div = document.getElementById('card-atleta');
  div.innerHTML = `
    <div class="atleta" style="background: #f9f9f9; border-color: #4CAF50;">
      ${a.foto ? `<img src="${a.foto}" class="foto-atleta-big" id="foto-preview-edit"><br>` : `<img src="" class="foto-atleta-big" id="foto-preview-edit" style="display:none;"><br>`}
      <label class="input-file-label">Foto (immagine locale): <input type="file" id="foto-edit-input" accept="image/*"></label>
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
      <input type="text" class="input-card" id="codiceFiscale" value="${a.codiceFiscale || ''}" placeholder="Codice fiscale">
      <input type="number" class="input-card" id="altezza" value="${a.altezza || ''}" placeholder="Altezza (cm)" min="150" max="220">
      <input type="number" class="input-card" id="peso" value="${a.peso || ''}" placeholder="Peso (kg)" min="40" max="150">
      <input type="email" class="input-card" id="email" value="${a.email || ''}" placeholder="Email">
      <input type="text" class="input-card" id="cellulare" value="${a.cellulare || ''}" placeholder="Cellulare">
      <input type="text" class="input-card" id="note" value="${a.note || ''}" placeholder="Note aggiuntive">
      <div style="margin-top: 18px;">
        <button onclick="salvaModifica(${i})">SALVA</button>
        <button onclick="annullaEdit()">ANNULLA</button>
      </div>
    </div>
  `;

  // Preview foto in modifica
  document.getElementById('foto-edit-input').addEventListener('change', function(evt){
    const file = evt.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      document.getElementById('foto-preview-edit').src = ev.target.result;
      document.getElementById('foto-preview-edit').style.display = 'block';
    }
    reader.readAsDataURL(file);
  });
}

function salvaModifica(i) {
  const nome = document.getElementById('nome').value.trim();
  const cognome = document.getElementById('cognome').value.trim();
  if (!nome || !cognome) { alert('Nome e Cognome sono obbligatori'); return; }
  let foto = document.getElementById('foto-preview-edit').src;
  if (!foto || foto.startsWith('data:') === false) foto = atleti[i].foto || "";
  atleti[i] = {
    foto,
    nome,
    cognome,
    numeroMaglia: document.getElementById('numeroMaglia').value,
    ruolo: document.getElementById('ruolo').value,
    dataNascita: document.getElementById('dataNascita').value,
    codiceFiscale: document.getElementById('codiceFiscale').value,
    altezza: document.getElementById('altezza').value,
    peso: document.getElementById('peso').value,
    email: document.getElementById('email').value,
    cellulare: document.getElementById('cellulare').value,
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
function mostraCardAggiungi() {
  const div = document.getElementById('card-atleta');
  div.innerHTML = `
    <div class="atleta" style="background: #f9f9f9; border-color: #4CAF50;">
      <img class="foto-atleta-big" id="foto-preview-add" style="display:none;"><br>
      <label class="input-file-label">Foto (immagine locale): <input type="file" id="foto-input" accept="image/*"></label>
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
      <input type="text" class="input-card" id="codiceFiscale" placeholder="Codice fiscale">
      <input type="number" class="input-card" id="altezza" placeholder="Altezza (cm)" min="150" max="220">
      <input type="number" class="input-card" id="peso" placeholder="Peso (kg)" min="40" max="150">
      <input type="email" class="input-card" id="email" placeholder="Email">
      <input type="text" class="input-card" id="cellulare" placeholder="Cellulare">
      <input type="text" class="input-card" id="note" placeholder="Note aggiuntive">
      <div style="margin-top: 18px;">
        <button onclick="salvaNuovoAtleta()">SALVA</button>
        <button onclick="annullaEdit()">ANNULLA</button>
      </div>
    </div>
  `;
  document.getElementById('foto-input').addEventListener('change', function(evt){
    const file = evt.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      document.getElementById('foto-preview-add').src = ev.target.result;
      document.getElementById('foto-preview-add').style.display = 'block';
    }
    reader.readAsDataURL(file);
  });
}
function salvaNuovoAtleta() {
  const nome = document.getElementById('nome').value.trim();
  const cognome = document.getElementById('cognome').value.trim();
  if (!nome || !cognome) { alert('Nome e Cognome sono obbligatori'); return; }
  let foto = document.getElementById('foto-preview-add').src;
  if (!foto || foto.startsWith('data:') === false) foto = "";
  atleti.push({
    foto,
    nome,
    cognome,
    numeroMaglia: document.getElementById('numeroMaglia').value,
    ruolo: document.getElementById('ruolo').value,
    dataNascita: document.getElementById('dataNascita').value,
    codiceFiscale: document.getElementById('codiceFiscale').value,
    altezza: document.getElementById('altezza').value,
    peso: document.getElementById('peso').value,
    email: document.getElementById('email').value,
    cellulare: document.getElementById('cellulare').value,
    note: document.getElementById('note').value,
    dataCreazione: new Date().toISOString()
  });
  salvaAtleti();
  mostraLista();
  clearCardAtleta();
}
window.addEventListener('DOMContentLoaded', function() {
  mostraLista();
  document.getElementById('btn-aggiungi-bottom').onclick = function() {
    mostraCardAggiungi();
  };
});

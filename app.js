let atleti = JSON.parse(localStorage.getItem('atleti-dinamo')) || [];

function mostraLista() {
  const div = document.getElementById('lista-atleti');
  if (atleti.length === 0) {
    div.innerHTML = '<p>Nessun atleta.</p>';
    return;
  }
  div.innerHTML = atleti.map((a, i) => `<div class="atleta-list-item">
    ${a.nome || ""} ${a.cognome || ""} 
    <button class="btn-entra" onclick="entraAtleta(${i})">ENTRA</button>
  </div>`).join('');
}

function mostraCardAggiungi() {
  document.getElementById('card-atleta').innerHTML = `
    <div style="background:#ebf0fc; padding:15px; border-radius:11px;">
      <input id="nome" placeholder="Nome" class="input-card">
      <input id="cognome" placeholder="Cognome" class="input-card">
      <button onclick="salvaNuovoAtleta()">SALVA</button>
      <button onclick="clearCardAtleta()">ANNULLA</button>
    </div>
  `;
}
function salvaNuovoAtleta() {
  const nome = document.getElementById('nome').value;
  const cognome = document.getElementById('cognome').value;
  atleti.push({ nome, cognome });
  salvaAtleti();
  mostraLista();
  clearCardAtleta();
}
function clearCardAtleta() { document.getElementById('card-atleta').innerHTML = "";}
function entraAtleta(i) {
  document.getElementById('card-atleta').innerHTML = `
    <div style="background:#ffe6cc; padding:12px; border-radius:8px;">
      Nome: <b>${atleti[i].nome || ""}</b><br>
      Cognome: <b>${atleti[i].cognome || ""}</b><br>
    </div>
  `;
}
function esportaAtleti() {
  const data = JSON.stringify(atleti, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'atleti_backup.json';
  document.body.appendChild(a);
  a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
window.addEventListener('DOMContentLoaded', () => {
  mostraLista();
  document.getElementById('btn-aggiungi-bottom').onclick = mostraCardAggiungi;
  document.getElementById('file-import').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const importedData = JSON.parse(evt.target.result);
        if(Array.isArray(importedData)){atleti=importedData;salvaAtleti();mostraLista();alert('Import OK!')}
        else alert('File non valido!');
      } catch (err) { alert('Errore nel file: ' + err.message);}
    };
    reader.readAsText(file);
  });
});
function salvaAtleti() { localStorage.setItem('atleti-dinamo', JSON.stringify(atleti)); }

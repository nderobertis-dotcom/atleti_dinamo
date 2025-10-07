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
    aggiornaStatistiche();
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
  aggiornaStatistiche();
}

function aggiornaStatistiche() {
  document.getElementById('total-atleti').textContent = atleti.length;
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

/* ... tutto il resto come versione precedente, inclusi aggiunta, editing, modifica, elimina ... */

window.addEventListener('DOMContentLoaded', function() {
  mostraLista();
  document.getElementById('btn-aggiungi-bottom').onclick = function() {
    mostraCardAggiungi();
  };
});

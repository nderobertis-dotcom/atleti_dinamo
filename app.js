// Inserisci qui le funzioni per mostrare, aprire modali, etc.
function mostraAtleti() { /* ... */ }
function visualizza(id) { /* ... */ }
function modifica(id) { /* ... */ }
function cancella(id) { /* ... */ }
const btnVisualizza = document.querySelectorAll('.btn-visualizza');
btnVisualizza.forEach(b => b.onclick = () => visualizza(b.dataset.id));
const btnModifica = document.querySelectorAll('.btn-modifica');
btnModifica.forEach(b => b.onclick = () => modifica(b.dataset.id));
const btnClose = document.querySelectorAll('.close-btn, .close-btn-modifica');
btnClose.forEach(b => b.onclick = () => document.querySelectorAll('.modal').forEach(m => m.style.display='none'));

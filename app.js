document.addEventListener("DOMContentLoaded", function() {

let athletes = [];
let editIndex = null;

function calcolaEta(dataNascita) {
    if (!dataNascita) return "";
    const oggi = new Date();
    const nascita = new Date(dataNascita);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--;
    return eta;
}

function upper(s) { return s ? s.trim().toUpperCase() : ''; }

try {
    if (localStorage.getItem('athletes')) {
        athletes = JSON.parse(localStorage.getItem('athletes'));
        if (!Array.isArray(athletes)) athletes = [];
    }
} catch(e) { athletes = []; }

function salvaSuStorage() { localStorage.setItem('athletes', JSON.stringify(athletes)); }

function updateDashboard() {
    document.getElementById('total-athletes').textContent = athletes.length;
    if (athletes.length > 0) {
        let sommaEta = athletes.reduce((sum, a) => sum + calcolaEta(a.birthdate), 0);
        let avgAge = (sommaEta / athletes.length).toFixed(1);
        document.getElementById('avg-age').textContent = avgAge;
    } else {
        document.getElementById('avg-age').textContent = '-';
    }
    document.getElementById('male-athletes').textContent = athletes.filter(a => a.gender === 'M').length;
    document.getElementById('female-athletes').textContent = athletes.filter(a => a.gender === 'F').length;
}

// MODALE VISUALIZZA
const modal = document.getElementById('atleta-modal');
const modalClose = document.getElementById('modal-close');
const modalData = document.getElementById('modal-data');
function openModal(idx) {
    const a = athletes[idx];
    if (!a) return;
    let birthStr = a.birthdate ? new Date(a.birthdate).toLocaleDateString('it-IT') : '';
    let eta = a.birthdate ? calcolaEta(a.birthdate) : '';
    modalData.innerHTML = `
      <div><b>Nome:</b> ${upper(a.first)}</div>
      <div><b>Cognome:</b> ${upper(a.last)}</div>
      <div><b>Codice fiscale:</b> ${upper(a.cf)}</div>
      <div><b>Genere:</b> ${a.gender}</div>
      <div><b>Data di nascita:</b> ${birthStr}</div>
      <div><b>Età:</b> ${eta}</div>
      <div><b>Documento:</b> ${a.docType}</div>
      <div><b>Numero Documento:</b> ${upper(a.docNumber)}</div>
    `;
    modal.style.display = 'block';
}
modalClose.onclick = function() { modal.style.display = 'none'; };
window.onclick = function(event) {
    if (event.target == modal) modal.style.display = 'none';
}

function updateAthleteList() {
    const list = document.getElementById('athlete-list');
    list.innerHTML = '';
    athletes.forEach((a, idx) => {
        const li = document.createElement('li');
        const info = document.createElement('span');
        info.className = 'info';
        info.textContent = `${upper(a.last)} ${upper(a.first)}`;
        const actions = document.createElement('div');
        actions.className = 'actions';

        const btnView = document.createElement('button');
        btnView.className = 'view';
        btnView.textContent = 'Visualizza';
        btnView.onclick = () => openModal(idx);

        const btnEdit = document.createElement('button');
        btnEdit.className = 'edit';
        btnEdit.textContent = 'Modifica';
        btnEdit.onclick = function() {
            editIndex = idx;
            document.getElementById('first-name').value = upper(a.first);
            document.getElementById('last-name').value = upper(a.last);
            document.getElementById('cf').value = upper(a.cf);
            document.getElementById('gender').value = a.gender;
            document.getElementById('birthdate').value = a.birthdate;
            document.getElementById('doc-type').value = a.docType;
            document.getElementById('doc-number').value = upper(a.docNumber);
            document.getElementById('form-title').textContent = 'Modifica Atleta';
            document.querySelector('#athlete-form button[type="submit"]').textContent = "Salva";
            document.getElementById('cancel-edit').style.display = '';
        };

        const btnDelete = document.createElement('button');
        btnDelete.className = 'delete';
        btnDelete.textContent = 'Cancella';
        btnDelete.onclick = function() {
            if (confirm('Vuoi davvero cancellare questo atleta?')) {
                athletes.splice(idx, 1);
                salvaSuStorage();
                updateDashboard();
                updateAthleteList();
                resetForm();
            }
        };

        actions.appendChild(btnView);
        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);
        li.appendChild(info);
        li.appendChild(actions);
        list.appendChild(li);
    });
}

function resetForm() {
    document.getElementById('athlete-form').reset();
    document.getElementById('form-title').textContent = 'Aggiungi Atleta';
    document.querySelector('#athlete-form button[type="submit"]').textContent = "Aggiungi";
    document.getElementById('cancel-edit').style.display = 'none';
    editIndex = null;
}

updateDashboard();
updateAthleteList();

document.getElementById('athlete-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const first = upper(document.getElementById('first-name').value);
    const last = upper(document.getElementById('last-name').value);
    const cf = upper(document.getElementById('cf').value);
    const gender = document.getElementById('gender').value;
    const birthdate = document.getElementById('birthdate').value;
    const docType = document.getElementById('doc-type').value;
    const docNumber = upper(document.getElementById('doc-number').value);

    if (first && last && cf && gender && birthdate && docType && docNumber) {
        if (editIndex !== null) {
            athletes[editIndex] = { first, last, cf, gender, birthdate, docType, docNumber };
        } else {
            athletes.push({ first, last, cf, gender, birthdate, docType, docNumber });
        }
        salvaSuStorage();
        updateDashboard();
        updateAthleteList();
        resetForm();
    }
});

document.getElementById('cancel-edit').onclick = resetForm;

});

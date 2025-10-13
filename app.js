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

function caricaDati() {
    try {
        let dati = localStorage.getItem('athletes');
        if (!dati) return [];
        let arr = JSON.parse(dati);
        return Array.isArray(arr) ? arr : [];
    } catch { return []; }
}
athletes = caricaDati();

function salvaSuStorage() { localStorage.setItem('athletes', JSON.stringify(athletes)); }

function medicalStatus(expiry) {
    if (!expiry) return {class:"",code:"none"};
    const today = new Date();
    const expiryDate = new Date(expiry);
    expiryDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffMs = expiryDate - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { class: "medical-red", code:"expired" };
    if (diffDays <= 31) return { class: "medical-yellow", code:"expiring" };
    return { class: "medical-green", code:"valid" };
}
function countExpiredAndExpiring() {
    let expired = 0, expiring = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    athletes.forEach(a => {
        if (!a.medical_expiry) return;
        const expiry = new Date(a.medical_expiry);
        expiry.setHours(0,0,0,0);
        const diff = Math.round((expiry - today)/(1000*60*60*24));
        if (diff < 0) expired++;
        else if (diff <= 31) expiring++;
    });
    return { expired, expiring };
}
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
    // CARD VISITE
    const c = countExpiredAndExpiring();
    document.getElementById('total-expired').textContent = c.expired;
    document.getElementById('total-expiring').textContent = c.expiring;
}

function showScheda(idx) {
    const box = document.getElementById('atleta-scheda');
    if (typeof idx === 'undefined' || idx === null || !athletes[idx]) {
        box.innerHTML = "<div class='info-group'>Seleziona un atleta per visualizzare i dettagli.</div>";
        return;
    }
    const a = athletes[idx];
    let fipavVal = (a.fipav !== undefined && a.fipav !== null) ? ("" + a.fipav).padStart(7, "0") : "-";
    let birthStr = a.birthdate ? new Date(a.birthdate).toLocaleDateString('it-IT') : '';
    let eta = a.birthdate ? calcolaEta(a.birthdate) : '';
    let medicalStr = a.medical_expiry ? new Date(a.medical_expiry).toLocaleDateString('it-IT') : '-';
    let medicalS = medicalStatus(a.medical_expiry);
    box.innerHTML = `
      <div class="info-group"><span class="field-label">CODICE FIPAV:</span> <b>${fipavVal}</b></div>
      <div class="main-id">${upper(a.last)} ${upper(a.first)}</div>
      <div class="info-group ${medicalS.class}"><span class="field-label">Scadenza visita medica:</span> <b>${medicalStr}</b></div>
      <div class="info-group"><span class="field-label">Codice fiscale:</span> ${upper(a.cf)}</div>
      <div class="info-group"><span class="field-label">Genere:</span> ${a.gender}</div>
      <div class="info-group"><span class="field-label">Data di nascita:</span> ${birthStr}</div>
      <div class="info-group"><span class="field-label">Età:</span> ${eta}</div>
      <div class="info-group"><span class="field-label">Documento:</span> ${a.docType}</div>
      <div class="info-group"><span class="field-label">Numero Documento:</span> ${upper(a.docNumber)}</div>
    `;
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
        btnView.textContent = 'V';
        btnView.title = "Visualizza";
        btnView.onclick = () => showScheda(idx);

        const btnEdit = document.createElement('button');
        btnEdit.className = 'edit';
        btnEdit.textContent = 'M';
        btnEdit.title = "Modifica";
        btnEdit.onclick = function() {
            editIndex = idx;
            document.getElementById('fipav-code').value = a.fipav || '';
            document.getElementById('first-name').value = upper(a.first);
            document.getElementById('last-name').value = upper(a.last);
            document.getElementById('cf').value = upper(a.cf);
            document.getElementById('gender').value = a.gender;
            document.getElementById('birthdate').value = a.birthdate;
            document.getElementById('medical-expiry').value = a.medical_expiry || "";
            document.getElementById('doc-type').value = a.docType;
            document.getElementById('doc-number').value = upper(a.docNumber);
            document.getElementById('form-title').textContent = 'Modifica Atleta';
            document.querySelector('#athlete-form button[type="submit"]').textContent = "Salva";
            document.getElementById('cancel-edit').style.display = '';
        };

        const btnDelete = document.createElement('button');
        btnDelete.className = 'delete';
        btnDelete.textContent = 'C';
        btnDelete.title = "Cancella";
        btnDelete.onclick = function() {
            if (confirm('Vuoi davvero cancellare questo atleta?')) {
                athletes.splice(idx, 1);
                salvaSuStorage();
                updateDashboard();
                updateAthleteList();
                showScheda();
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
showScheda();

document.getElementById('athlete-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const fipav = document.getElementById('fipav-code').value.trim();
    const first = upper(document.getElementById('first-name').value);
    const last = upper(document.getElementById('last-name').value);
    const cf = upper(document.getElementById('cf').value);
    const gender = document.getElementById('gender').value;
    const birthdate = document.getElementById('birthdate').value;
    const medical_expiry = document.getElementById('medical-expiry').value;
    const docType = document.getElementById('doc-type').value;
    const docNumber = upper(document.getElementById('doc-number').value);

    if (!/^\d{7}$/.test(fipav)) {
        alert('Il codice FIPAV deve essere composto da 7 cifre numeriche.');
        document.getElementById('fipav-code').focus();
        return;
    }
    if (!medical_expiry) {
        alert('La scadenza visita medica è obbligatoria.');
        document.getElementById('medical-expiry').focus();
        return;
    }
    if (first && last && cf && gender && birthdate && docType && docNumber) {
        if (editIndex !== null) {
            athletes[editIndex] = {
                fipav: fipav,
                first, last, cf, gender, birthdate, medical_expiry, docType, docNumber
            };
        } else {
            athletes.push({
                fipav: fipav,
                first, last, cf, gender, birthdate, medical_expiry, docType, docNumber
            });
        }
        salvaSuStorage();
        updateDashboard();
        updateAthleteList();
        showScheda();
        resetForm();
    }
});

document.getElementById('cancel-edit').onclick = resetForm;

});

document.addEventListener("DOMContentLoaded", function() {

let athletes = [];
let editIndex = null;

function calcolaEta(dataNascita) {
    const oggi = new Date();
    const nascita = new Date(dataNascita);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) {
        eta--;
    }
    return eta;
}

if (localStorage.getItem('athletes')) {
    athletes = JSON.parse(localStorage.getItem('athletes'));
}

function salvaSuStorage() {
    localStorage.setItem('athletes', JSON.stringify(athletes));
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
}

function upper(s) {
    return s ? s.trim().toUpperCase() : '';
}

function updateAthleteList() {
    const list = document.getElementById('athlete-list');
    list.innerHTML = '';
    athletes.forEach((a, idx) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';

        // Dati atleta
        const dati = document.createElement('span');
        dati.textContent =
            `${a.last.toUpperCase()} ${a.first.toUpperCase()} (${a.gender}, ${a.birthdate}, CF: ${a.cf.toUpperCase()}, ${a.docType}: ${a.docNumber.toUpperCase()})`;

        // Bottoni
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '12px';

        const btnEdit = document.createElement('button');
        btnEdit.className = 'edit';
        btnEdit.textContent = 'Modifica';
        btnEdit.style.padding = '10px 26px';
        btnEdit.style.borderRadius = '22px';
        btnEdit.style.background = 'linear-gradient(90deg, #1966c2 0%, #4d96ff 100%)';
        btnEdit.style.border = '2px solid #1553a1';
        btnEdit.style.color = '#fff';
        btnEdit.style.fontWeight = '600';
        btnEdit.style.fontSize = '1em';
        btnEdit.onclick = function() {
            editIndex = idx;
            document.getElementById('first-name').value = a.first;
            document.getElementById('last-name').value = a.last;
            document.getElementById('cf').value = a.cf;
            document.getElementById('gender').value = a.gender;
            document.getElementById('birthdate').value = a.birthdate;
            document.getElementById('doc-type').value = a.docType;
            document.getElementById('doc-number').value = a.docNumber;
            document.getElementById('form-title').textContent = 'Modifica Atleta';
            document.querySelector('#athlete-form button[type="submit"]').textContent = "Salva";
            document.getElementById('cancel-edit').style.display = '';
        };

        const btnDelete = document.createElement('button');
        btnDelete.className = 'delete';
        btnDelete.textContent = 'Cancella';
        btnDelete.style.padding = '10px 26px';
        btnDelete.style.borderRadius = '22px';
        btnDelete.style.background = 'linear-gradient(90deg, #e15c5c 0%, #ff7575 100%)';
        btnDelete.style.border = '2px solid #b72a34';
        btnDelete.style.color = '#fff';
        btnDelete.style.fontWeight = '600';
        btnDelete.style.fontSize = '1em';
        btnDelete.onclick = function() {
            if (confirm('Vuoi davvero cancellare questo atleta?')) {
                athletes.splice(idx, 1);
                salvaSuStorage();
                updateDashboard();
                updateAthleteList();
                resetForm();
            }
        };

        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);

        li.appendChild(dati);
        li.appendChild(actions);

        list.appendChild(li);
    });
}

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

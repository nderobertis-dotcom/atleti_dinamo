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

function updateAthleteList() {
    const list = document.getElementById('athlete-list');
    list.innerHTML = '';
    athletes.sort((a, b) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first));
    athletes.forEach((a, idx) => {
        const eta = calcolaEta(a.birthdate);
        const birthStr = new Date(a.birthdate).toLocaleDateString('it-IT');
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${a.last} ${a.first} (${a.gender}, ${birthStr}, ${eta} anni, CF: ${a.cf})</span>
            <button class="edit" data-idx="${idx}">Modifica</button>
            <button class="delete" data-idx="${idx}">Cancella</button>
        `;
        list.appendChild(li);
    });
    document.querySelectorAll('.edit').forEach(btn => {
        btn.onclick = function() {
            editIndex = parseInt(this.dataset.idx, 10);
            const atleta = athletes[editIndex];
            document.getElementById('first-name').value = atleta.first;
            document.getElementById('last-name').value = atleta.last;
            document.getElementById('cf').value = atleta.cf;
            document.getElementById('gender').value = atleta.gender;
            document.getElementById('birthdate').value = atleta.birthdate;
            document.getElementById('form-title').textContent = 'Modifica Atleta';
            document.querySelector('#athlete-form button[type="submit"]').textContent = "Salva";
            document.getElementById('cancel-edit').style.display = '';
        };
    });
    document.querySelectorAll('.delete').forEach(btn => {
        btn.onclick = function() {
            const i = parseInt(this.dataset.idx, 10);
            if (confirm('Vuoi davvero cancellare questo atleta?')) {
                athletes.splice(i, 1);
                salvaSuStorage();
                updateDashboard();
                updateAthleteList();
                resetForm();
            }
        };
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
    const first = document.getElementById('first-name').value.trim();
    const last = document.getElementById('last-name').value.trim();
    const cf = document.getElementById('cf').value.trim();
    const gender = document.getElementById('gender').value;
    const birthdate = document.getElementById('birthdate').value;

    if (first && last && cf && gender && birthdate) {
        if (editIndex !== null) {
            athletes[editIndex] = { first, last, cf, gender, birthdate };
        } else {
            athletes.push({ first, last, cf, gender, birthdate });
        }
        salvaSuStorage();
        updateDashboard();
        updateAthleteList();
        resetForm();
    }
});

document.getElementById('cancel-edit').onclick = resetForm;

});

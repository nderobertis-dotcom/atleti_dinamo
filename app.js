// Struttura dati atleti
let athletes = [];

// Funzione per calcolare età dalla data di nascita
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

// Utility per aggiornare dashboard
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

// Utility per aggiornare lista atleti
function updateAthleteList() {
    const list = document.getElementById('athlete-list');
    list.innerHTML = '';
    // Ordine alfabetico per cognome, poi nome
    athletes.sort((a, b) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first));
    athletes.forEach(a => {
        const eta = calcolaEta(a.birthdate);
        const birthStr = new Date(a.birthdate).toLocaleDateString('it-IT');
        const li = document.createElement('li');
        li.textContent = `${a.last} ${a.first} (${a.gender}, ${birthStr}, ${eta} anni)`;
        list.appendChild(li);
    });
}

document.getElementById('athlete-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const first = document.getElementById('first-name').value.trim();
    const last = document.getElementById('last-name').value.trim();
    const gender = document.getElementById('gender').value;
    const birthdate = document.getElementById('birthdate').value;

    if (first && last && gender && birthdate) {
        athletes.push({ first, last, gender, birthdate });
        updateDashboard();
        updateAthleteList();
        this.reset();
    }
});

// Struttura dati atleti
let athletes = [];

// Utility per aggiornare dashboard
function updateDashboard() {
    document.getElementById('total-athletes').textContent = athletes.length;
    if (athletes.length > 0) {
        let avgAge = (athletes.reduce((sum, a) => sum + a.age, 0) / athletes.length).toFixed(1);
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
        const li = document.createElement('li');
        li.textContent = `${a.last} ${a.first} (${a.gender}, ${a.age} anni)`;
        list.appendChild(li);
    });
}

document.getElementById('athlete-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const first = document.getElementById('first-name').value.trim();
    const last = document.getElementById('last-name').value.trim();
    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('age').value, 10);

    if (first && last && gender && age) {
        athletes.push({ first, last, gender, age });
        updateDashboard();
        updateAthleteList();
        this.reset();
    }
});

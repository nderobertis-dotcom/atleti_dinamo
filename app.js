// Athlete management application
class AthleteManager {
    constructor() {
        this.athletes = [
            {
                id: 1,
                nome: "Marco",
                cognome: "Rossi",
                dataNascita: "1995-03-15",
                codiceFiscale: "RSSMRC95C15H501Z",
                indirizzo: "Via Roma 123, Milano",
                telefono: "348-1234567",
                email: "marco.rossi@email.com",
                altezza: 195,
                peso: 85,
                wingspan: 205,
                saltoVerticale: 78,
                ruolo: "Centrale",
                numeroMaglia: 14,
                anniEsperienza: 8,
                livello: "Senior",
                visitaMedica: "2024-12-15",
                certificatoAgonistico: "2024-08-30",
                assicurazione: "2024-06-01",
                note: "Capitano squadra, ottimo in attacco"
            },
            {
                id: 2,
                nome: "Luca",
                cognome: "Bianchi",
                dataNascita: "1998-07-22",
                codiceFiscale: "BNCLCU98L22F205K",
                indirizzo: "Corso Italia 45, Milano",
                telefono: "347-9876543",
                email: "luca.bianchi@email.com",
                altezza: 180,
                peso: 75,
                wingspan: 185,
                saltoVerticale: 65,
                ruolo: "Palleggiatore",
                numeroMaglia: 7,
                anniEsperienza: 5,
                livello: "Senior",
                visitaMedica: "2024-11-20",
                certificatoAgonistico: "2024-09-15",
                assicurazione: "2024-06-01",
                note: "Ottima regia e visione di gioco"
            },
            {
                id: 3,
                nome: "Alessandro",
                cognome: "Verdi",
                dataNascita: "1997-11-08",
                codiceFiscale: "VRDLND97S08L219Y",
                indirizzo: "Via Garibaldi 78, Milano",
                telefono: "349-5551234",
                email: "alessandro.verdi@email.com",
                altezza: 188,
                peso: 80,
                wingspan: 195,
                saltoVerticale: 72,
                ruolo: "Schiacciatore",
                numeroMaglia: 11,
                anniEsperienza: 6,
                livello: "Senior",
                visitaMedica: "2025-01-10",
                certificatoAgonistico: "2024-08-15",
                assicurazione: "2024-06-01",
                note: "Forte in attacco e ricezione"
            },
            {
                id: 4,
                nome: "Francesco",
                cognome: "Gialli",
                dataNascita: "1999-05-03",
                codiceFiscale: "GLLFNC99E03H501B",
                indirizzo: "Piazza Duomo 12, Milano",
                telefono: "346-7778899",
                email: "francesco.gialli@email.com",
                altezza: 175,
                peso: 70,
                wingspan: 180,
                saltoVerticale: 60,
                ruolo: "Libero",
                numeroMaglia: 5,
                anniEsperienza: 4,
                livello: "Senior",
                visitaMedica: "2024-10-30",
                certificatoAgonistico: "2024-07-20",
                assicurazione: "2024-06-01",
                note: "Eccellente in difesa e ricezione"
            },
            {
                id: 5,
                nome: "Andrea",
                cognome: "Neri",
                dataNascita: "1996-12-18",
                codiceFiscale: "NRIANDR96T18F205W",
                indirizzo: "Via Manzoni 33, Milano",
                telefono: "348-3334455",
                email: "andrea.neri@email.com",
                altezza: 200,
                peso: 92,
                wingspan: 210,
                saltoVerticale: 82,
                ruolo: "Opposto",
                numeroMaglia: 9,
                anniEsperienza: 7,
                livello: "Senior",
                visitaMedica: "2024-12-01",
                certificatoAgonistico: "2024-09-01",
                assicurazione: "2024-06-01",
                note: "Potente attaccante, punto di forza"
            },
            {
                id: 6,
                nome: "Davide",
                cognome: "Blu",
                dataNascita: "2000-02-14",
                codiceFiscale: "BLUDVD00B14H501C",
                indirizzo: "Via Montenapoleone 55, Milano",
                telefono: "347-1112233",
                email: "davide.blu@email.com",
                altezza: 192,
                peso: 82,
                wingspan: 200,
                saltoVerticale: 75,
                ruolo: "Centrale",
                numeroMaglia: 13,
                anniEsperienza: 3,
                livello: "Giovanile",
                visitaMedica: "2025-02-15",
                certificatoAgonistico: "2024-10-10",
                assicurazione: "2024-06-01",
                note: "Giovane promettente, in crescita"
            }
        ];

        this.roles = ["Palleggiatore", "Libero", "Schiacciatore", "Centrale", "Opposto"];
        this.levels = ["Giovanile", "Senior", "Professionista"];
        this.filteredAthletes = [...this.athletes];
        this.charts = {};

        this.init();
    }

    init() {
        this.initializeUI();
        this.setupEventListeners();
        this.updateDashboard();
        this.renderAthletes();
        this.populateFormSelects();
    }

    initializeUI() {
        // Initialize role and level filters
        this.populateFilterSelects();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterAthletes());
        }

        // Filter dropdowns
        const roleFilter = document.getElementById('role-filter');
        const levelFilter = document.getElementById('level-filter');
        if (roleFilter) roleFilter.addEventListener('change', () => this.filterAthletes());
        if (levelFilter) levelFilter.addEventListener('change', () => this.filterAthletes());

        // Form submission
        const athleteForm = document.getElementById('athlete-form');
        if (athleteForm) {
            athleteForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    populateFilterSelects() {
        const roleFilter = document.getElementById('role-filter');
        const levelFilter = document.getElementById('level-filter');

        if (roleFilter) {
            this.roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role;
                option.textContent = role;
                roleFilter.appendChild(option);
            });
        }

        if (levelFilter) {
            this.levels.forEach(level => {
                const option = document.createElement('option');
                option.value = level;
                option.textContent = level;
                levelFilter.appendChild(option);
            });
        }
    }

    populateFormSelects() {
        const ruoloSelect = document.getElementById('ruolo');
        const livelloSelect = document.getElementById('livello');

        if (ruoloSelect) {
            this.roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role;
                option.textContent = role;
                ruoloSelect.appendChild(option);
            });
        }

        if (livelloSelect) {
            this.levels.forEach(level => {
                const option = document.createElement('option');
                option.value = level;
                option.textContent = level;
                livelloSelect.appendChild(option);
            });
        }
    }

    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    updateDashboard() {
        const totalAthletes = this.athletes.length;
        const avgAge = Math.round(this.athletes.reduce((sum, athlete) => 
            sum + this.calculateAge(athlete.dataNascita), 0) / totalAthletes);
        const avgHeight = Math.round(this.athletes.reduce((sum, athlete) => 
            sum + athlete.altezza, 0) / totalAthletes);
        const seniorCount = this.athletes.filter(athlete => athlete.livello === 'Senior').length;

        // Update dashboard stats
        document.getElementById('total-athletes').textContent = totalAthletes;
        document.getElementById('avg-age').textContent = `${avgAge} anni`;
        document.getElementById('avg-height').textContent = `${avgHeight} cm`;
        document.getElementById('senior-count').textContent = seniorCount;

        // Update charts
        this.updateCharts();
    }

    updateCharts() {
        this.createRolesChart();
        this.createLevelsChart();
    }

    createRolesChart() {
        const ctx = document.getElementById('roles-chart');
        if (!ctx) return;

        // Count athletes by role
        const roleCounts = {};
        this.roles.forEach(role => {
            roleCounts[role] = this.athletes.filter(athlete => athlete.ruolo === role).length;
        });

        const data = {
            labels: Object.keys(roleCounts),
            datasets: [{
                data: Object.values(roleCounts),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        if (this.charts.roles) {
            this.charts.roles.destroy();
        }

        this.charts.roles = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createLevelsChart() {
        const ctx = document.getElementById('levels-chart');
        if (!ctx) return;

        // Count athletes by level
        const levelCounts = {};
        this.levels.forEach(level => {
            levelCounts[level] = this.athletes.filter(athlete => athlete.livello === level).length;
        });

        const data = {
            labels: Object.keys(levelCounts),
            datasets: [{
                label: 'Numero Atleti',
                data: Object.values(levelCounts),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderWidth: 1
            }]
        };

        if (this.charts.levels) {
            this.charts.levels.destroy();
        }

        this.charts.levels = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    filterAthletes() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const roleFilter = document.getElementById('role-filter').value;
        const levelFilter = document.getElementById('level-filter').value;

        this.filteredAthletes = this.athletes.filter(athlete => {
            const matchesSearch = !searchTerm || 
                athlete.nome.toLowerCase().includes(searchTerm) ||
                athlete.cognome.toLowerCase().includes(searchTerm);
            const matchesRole = !roleFilter || athlete.ruolo === roleFilter;
            const matchesLevel = !levelFilter || athlete.livello === levelFilter;

            return matchesSearch && matchesRole && matchesLevel;
        });

        this.renderAthletes();
    }

    renderAthletes() {
        const grid = document.getElementById('athletes-grid');
        if (!grid) return;

        grid.innerHTML = '';

        if (this.filteredAthletes.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-secondary);">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <h3>Nessun atleta trovato</h3>
                    <p>Prova a modificare i filtri di ricerca.</p>
                </div>
            `;
            return;
        }

        this.filteredAthletes.forEach(athlete => {
            const card = this.createAthleteCard(athlete);
            grid.appendChild(card);
        });
    }

    createAthleteCard(athlete) {
        const card = document.createElement('div');
        card.className = 'athlete-card fade-in';
        card.onclick = () => this.showAthleteDetail(athlete);

        const initials = `${athlete.nome[0]}${athlete.cognome[0]}`;
        const age = this.calculateAge(athlete.dataNascita);

        card.innerHTML = `
            <div class="athlete-header">
                <div class="athlete-avatar">${initials}</div>
                <div class="athlete-info">
                    <h4>${athlete.nome} ${athlete.cognome}</h4>
                    <span class="athlete-role">${athlete.ruolo}</span>
                </div>
            </div>
            <div class="athlete-details">
                <div class="detail-item">
                    <span class="detail-label">Età</span>
                    <span class="detail-value">${age} anni</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Altezza</span>
                    <span class="detail-value">${athlete.altezza} cm</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Maglia</span>
                    <span class="detail-value">#${athlete.numeroMaglia}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Livello</span>
                    <span class="detail-value">${athlete.livello}</span>
                </div>
            </div>
        `;

        return card;
    }

    showAthleteDetail(athlete) {
        const modal = document.getElementById('athlete-modal');
        const modalName = document.getElementById('modal-athlete-name');
        const modalDetails = document.getElementById('modal-athlete-details');

        modalName.textContent = `${athlete.nome} ${athlete.cognome}`;

        const initials = `${athlete.nome[0]}${athlete.cognome[0]}`;
        const age = this.calculateAge(athlete.dataNascita);

        modalDetails.innerHTML = `
            <div class="athlete-modal-header">
                <div class="athlete-modal-avatar">${initials}</div>
                <div class="athlete-modal-info">
                    <h4>${athlete.nome} ${athlete.cognome}</h4>
                    <span class="athlete-role">${athlete.ruolo} - Maglia #${athlete.numeroMaglia}</span>
                </div>
            </div>
            
            <div class="athlete-modal-sections">
                <div class="detail-section">
                    <h5><i class="fas fa-user"></i> Dati Anagrafici</h5>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Nome Completo</span>
                            <span class="detail-value">${athlete.nome} ${athlete.cognome}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Età</span>
                            <span class="detail-value">${age} anni</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Data di Nascita</span>
                            <span class="detail-value">${new Date(athlete.dataNascita).toLocaleDateString('it-IT')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Codice Fiscale</span>
                            <span class="detail-value">${athlete.codiceFiscale}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Indirizzo</span>
                            <span class="detail-value">${athlete.indirizzo}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Telefono</span>
                            <span class="detail-value">${athlete.telefono}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${athlete.email}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h5><i class="fas fa-dumbbell"></i> Dati Fisici</h5>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Altezza</span>
                            <span class="detail-value">${athlete.altezza} cm</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Peso</span>
                            <span class="detail-value">${athlete.peso} kg</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Wingspan</span>
                            <span class="detail-value">${athlete.wingspan} cm</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Salto Verticale</span>
                            <span class="detail-value">${athlete.saltoVerticale} cm</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h5><i class="fas fa-volleyball-ball"></i> Dati Sportivi</h5>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Ruolo</span>
                            <span class="detail-value">${athlete.ruolo}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Numero Maglia</span>
                            <span class="detail-value">#${athlete.numeroMaglia}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Esperienza</span>
                            <span class="detail-value">${athlete.anniEsperienza} anni</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Livello</span>
                            <span class="detail-value">${athlete.livello}</span>
                        </div>
                    </div>
                </div>
                
                ${athlete.note ? `
                <div class="detail-section">
                    <h5><i class="fas fa-sticky-note"></i> Note</h5>
                    <p>${athlete.note}</p>
                </div>
                ` : ''}
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newAthlete = {
            id: this.athletes.length + 1,
            nome: formData.get('nome'),
            cognome: formData.get('cognome'),
            dataNascita: formData.get('dataNascita'),
            codiceFiscale: formData.get('codiceFiscale') || '',
            indirizzo: formData.get('indirizzo') || '',
            telefono: formData.get('telefono') || '',
            email: formData.get('email') || '',
            altezza: parseInt(formData.get('altezza')),
            peso: parseInt(formData.get('peso')),
            wingspan: parseInt(formData.get('wingspan')) || 0,
            saltoVerticale: parseInt(formData.get('saltoVerticale')) || 0,
            ruolo: formData.get('ruolo'),
            numeroMaglia: parseInt(formData.get('numeroMaglia')),
            anniEsperienza: parseInt(formData.get('anniEsperienza')) || 0,
            livello: formData.get('livello'),
            visitaMedica: '',
            certificatoAgonistico: '',
            assicurazione: '',
            note: formData.get('note') || ''
        };

        // Check if jersey number is already taken
        if (this.athletes.some(athlete => athlete.numeroMaglia === newAthlete.numeroMaglia)) {
            alert('Il numero di maglia è già in uso da un altro atleta!');
            return;
        }

        this.athletes.push(newAthlete);
        this.filteredAthletes = [...this.athletes];
        
        this.updateDashboard();
        this.renderAthletes();
        
        // Reset form and show success message
        e.target.reset();
        alert('Atleta aggiunto con successo!');
        
        // Switch to athletes view
        showSection('atleti');
    }
}

// Global functions
function showSection(sectionName) {
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionName) {
            link.classList.add('active');
        }
    });

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('role-filter').value = '';
    document.getElementById('level-filter').value = '';
    athleteManager.filterAthletes();
}

function resetForm() {
    document.getElementById('athlete-form').reset();
}

function closeModal() {
    document.getElementById('athlete-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function editAthlete() {
    alert('Funzionalità di modifica in sviluppo!');
}

function exportData() {
    // Create a simple CSV export simulation
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Nome,Cognome,Età,Ruolo,Altezza,Peso,Livello,Maglia\n"
        + athleteManager.athletes.map(athlete => {
            const age = athleteManager.calculateAge(athlete.dataNascita);
            return `${athlete.nome},${athlete.cognome},${age},${athlete.ruolo},${athlete.altezza},${athlete.peso},${athlete.livello},${athlete.numeroMaglia}`;
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "atleti_squadra_volley.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Dati esportati con successo!');
}

// Initialize application
let athleteManager;

document.addEventListener('DOMContentLoaded', function() {
    athleteManager = new AthleteManager();
    
    // Close modal when clicking outside
    document.getElementById('athlete-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

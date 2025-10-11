// Province italiane (targhe) e DEMO principali comuni (puoi espandere la lista)
const PROVINCE = {
  "BA": ["Bari", "Bitonto", "Corato"],
  "MI": ["Milano", "Sesto San Giovanni", "Cinisello Balsamo"],
  "TO": ["Torino", "Moncalieri", "Collegno"],
  "RM": ["Roma", "Tivoli", "Frascati"],
  "NA": ["Napoli", "Pozzuoli", "Ercolano"],
  // ...aggiungi tutte le province e comuni necessari!
};

// Main class per gestione atleti
class AthleteManager {
  constructor() {
    this.athletes = [
      // Demo, puoi lasciare vuoto o inserire atleti di prova
      // {
      //   id: 1,
      //   codiceTesseramento: "1234567",
      //   sesso: "M",
      //   nome: "NICOLA",
      //   cognome: "ROSSI",
      //   dataNascita: "1995-03-15",
      //   codiceFiscale: "RSSNCL95C15H501Z",
      //   via: "VIA ROMA 22",
      //   provincia: "BA",
      //   comune: "Bari",
      //   telefono: "",
      //   email: "",
      //   altezza: 187,
      //   peso: 82,
      //   ruolo: "CENTRALE",
      //   numeroMaglia: 8,
      //   campionato: "SERIE D MASCHILE",
      //   note: ""
      // }
    ];
    this.roles = ["LIBERO","SCHIACCIATORE","CENTRALE","OPPOSTO","PALLEGGIATORE","ALLENATORE"];
    this.campionati = ["SERIE D MASCHILE", "1° DIV. FEMMINILE", "1° DIVISIONE MASCHILE"];
    this.filteredAthletes = [...this.athletes];
    this.charts = {};
    this.init();
  }

  init() {
    this.setupProvinceComuneMenus();
    this.initializeUI();
    this.setupEventListeners();
    this.updateDashboard();
    this.renderAthletes();
    this.populateFormSelects();
  }

  setupProvinceComuneMenus() {
    const provinciaSelect = document.getElementById('provincia');
    const comuneSelect = document.getElementById('comune');
    provinciaSelect.innerHTML = '<option value="">Seleziona provincia...</option>';
    Object.keys(PROVINCE).forEach(targa => {
      const option = document.createElement('option');
      option.value = targa;
      option.textContent = targa;
      provinciaSelect.appendChild(option);
    });
    provinciaSelect.addEventListener('change', function() {
      comuneSelect.innerHTML = '<option value="">Seleziona comune...</option>';
      if (this.value && PROVINCE[this.value]) {
        PROVINCE[this.value].forEach(comune => {
          const option = document.createElement('option');
          option.value = comune;
          option.textContent = comune;
          comuneSelect.appendChild(option);
        });
      }
    });
  }

  initializeUI() {
    // UI populate/callback nei filtri/menù
    // No-op qui: eventuale futuro supporto
  }
  setupEventListeners() {
    const athleteForm = document.getElementById('athlete-form');
    if (athleteForm) {
      athleteForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  }
  populateFormSelects() {
    // Ruoli/campionati sono già nel markup; se vuoi generare in JS, attiva questa funzione
  }

  calculateAge(birthDate) {
    if (!birthDate) return "";
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
    // Stubs: da implementare section dashboard/base.
  }

  filterAthletes() {
    // Demo: puoi aggiungere campi di filtro
    this.filteredAthletes = [...this.athletes];
    this.renderAthletes();
  }

  renderAthletes() {
    const grid = document.getElementById('athletes-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (this.filteredAthletes.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-secondary);">
        <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px;"></i>
        <h3>Nessun atleta trovato</h3>
        <p>Prova a modificare i filtri di ricerca.</p>
      </div>`;
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
    const initials = (athlete.nome && athlete.cognome)
      ? `${athlete.nome[0] || ''}${athlete.cognome[0] || ''}`
      : '';
    const age = this.calculateAge(athlete.dataNascita);
    card.innerHTML = `
      <div class="athlete-header">
        <div class="athlete-avatar">${initials}</div>
        <div class="athlete-info">
          <h4>${athlete.nome || ''} ${athlete.cognome || ''}</h4>
          <span class="athlete-role">${athlete.ruolo || ''}</span>
        </div>
      </div>
      <div class="athlete-details">
        <div class="detail-item">
          <span class="detail-label">Cod. Tess.</span>
          <span class="detail-value">${athlete.codiceTesseramento || ''}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Età</span>
          <span class="detail-value">${age ? age+" anni" : ""}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Maglia</span>
          <span class="detail-value">${athlete.numeroMaglia || ''}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Campionato</span>
          <span class="detail-value">${athlete.campionato || ''}</span>
        </div>
      </div>
    `;
    return card;
  }

  showAthleteDetail(athlete) {
    const modal = document.getElementById('athlete-modal');
    const modalName = document.getElementById('modal-athlete-name');
    const modalDetails = document.getElementById('modal-athlete-details');
    // RENDER dettaglio atleta
    if (modalName) modalName.textContent = `${athlete.nome || ''} ${athlete.cognome || ''}`;
    if (modalDetails) {
      modalDetails.innerHTML = `
        <div class="athlete-modal-header">
          <div class="athlete-modal-avatar">${(athlete.nome && athlete.cognome) ? athlete.nome[0]+athlete.cognome[0] : ''}</div>
          <div class="athlete-modal-info">
            <h4>${athlete.nome || ''} ${athlete.cognome || ''}</h4>
            <span class="athlete-role">${athlete.ruolo || ''} ${athlete.numeroMaglia ? "- Maglia #"+athlete.numeroMaglia : ""}</span>
          </div>
        </div>
        <div class="athlete-modal-sections">
          <div class="detail-section"><h5>Dati Anagrafici</h5><div class="detail-grid">
            <div class="detail-item"><span class="detail-label">Codice Tesseramento</span><span class="detail-value">${athlete.codiceTesseramento || ''}</span></div>
            <div class="detail-item"><span class="detail-label">Nome</span><span class="detail-value">${athlete.nome || ''}</span></div>
            <div class="detail-item"><span class="detail-label">Cognome</span><span class="detail-value">${athlete.cognome || ''}</span></div>
            <div class="detail-item"><span class="detail-label">Sesso</span><span class="detail-value">${athlete.sesso || ''}</span></div>
            <div class="detail-item"><span class="detail-label">Data nascita</span><span class="detail-value">${athlete.dataNascita || ''}</span></div>
            <div class="detail-item"><span class="detail-label">Codice Fiscale</span><span class="detail-value">${athlete.codiceFiscale || ''}</span></div>
            <div class="detail-item"><span class="detail-label">Indirizzo</span><span class="detail-value">${athlete.via || ''} ${athlete.comune || ''} (${athlete.provincia || ''})</span></div>
            <div class="detail-item"><span class="detail-label">Telefono</span><span class="detail-value">${athlete.telefono || ''}</span></div>
            <div class="detail-item"><span class="detail-label">Email</span><span class="detail-value">${athlete.email || ''}</span></div>
          </div></div>
          <div class="detail-section"><h5>Dati Fisici</h5><div class="detail-grid">
            <div class="detail-item"><span class="detail-label">Altezza</span><span class="detail-value">${athlete.altezza || ''}</span></div>
            <div class="detail-item"><span class="detail-label">Peso</span><span class="detail-value">${athlete.peso || ''}</span></div>
          </div></div>
          <div class="detail-section"><h5>Dati Sportivi</h5><div class="detail-grid">
            <div class="detail-item"><span class="detail-label">Ruolo</span><span class="detail-value">${athlete.ruolo || ''}</span></div>
            <div class="detail-item"><span class="detail-label">Numero Maglia</span><span class="detail-value">${athlete.numeroMaglia || ''}</span></div>
            <div class="detail-item"><span class="detail-label">Campionato</span><span class="detail-value">${athlete.campionato || ''}</span></div>
          </div></div>
          ${(athlete.note) ? `<div class="detail-section"><h5>Note</h5><p>${athlete.note}</p></div>` : ''}
        </div>
      `;
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    function up(val) { return (val ? val.toUpperCase() : ""); }
    const codiceTesseramento = formData.get('codiceTesseramento');
    // Validazione: numerico, lunghezza 7 e unico
    if (!codiceTesseramento || !/^\d{7}$/.test(codiceTesseramento)) {
      alert('Codice tesseramento obbligatorio, numerico di 7 cifre.');
      return;
    }
    if (this.athletes.some(a => a.codiceTesseramento === codiceTesseramento)) {
      alert('Codice tesseramento già presente!');
      return;
    }
    const newAthlete = {
      id: this.athletes.length ? Math.max(...this.athletes.map(a=>a.id))+1 : 1,
      codiceTesseramento: up(codiceTesseramento),
      sesso: formData.get('sesso') || "",
      nome: up(formData.get('nome')),
      cognome: up(formData.get('cognome')),
      dataNascita: formData.get('dataNascita'),
      codiceFiscale: up(formData.get('codiceFiscale')),
      via: up(formData.get('via')),
      provincia: formData.get('provincia') || "",
      comune: up(formData.get('comune')),
      telefono: up(formData.get('telefono')),
      email: up(formData.get('email')),
      altezza: parseInt(formData.get('altezza')) || "",
      peso: parseInt(formData.get('peso')) || "",
      ruolo: formData.get('ruolo') || "",
      numeroMaglia: parseInt(formData.get('numeroMaglia')) || "",
      campionato: formData.get('campionato') || "",
      note: up(formData.get('note')) || ""
    };
    // Codice tesseramento unico (già fatto sopra)
    this.athletes.push(newAthlete);
    this.filteredAthletes = [...this.athletes];
    this.updateDashboard();
    this.renderAthletes();
    e.target.reset();
    alert('Atleta aggiunto con successo!');
    showSection('atleti');
  }
}

// Navigation logic
function showSection(sectionName) {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === sectionName) {
      link.classList.add('active');
    }
  });
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  const targetSection = document.getElementById(`${sectionName}-section`);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

// Import/export logic
function exportData() {
  const csvContent =
    "data:text/csv;charset=utf-8,CodiceTesseramento,Nome,Cognome,Sesso,DataNascita,CodiceFiscale,Via,Provincia,Comune,Telefono,Email,Altezza,Peso,Ruolo,NumeroMaglia,Campionato,Note\n" +
    athleteManager.athletes.map(a => [
      a.codiceTesseramento,a.nome,a.cognome,a.sesso,a.dataNascita,a.codiceFiscale,a.via,a.provincia,a.comune,a.telefono,a.email,a.altezza,a.peso,a.ruolo,a.numeroMaglia,a.campionato,a.note
    ].join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "atleti_squadra_volley.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert('Dati esportati con successo!');
}

// Import JSON (sostituisce tutti i dati)
document.getElementById('import-file').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      let imported = JSON.parse(evt.target.result);
      if (Array.isArray(imported)) {
        athleteManager.athletes = imported;
        athleteManager.filteredAthletes = [...imported];
        athleteManager.updateDashboard();
        athleteManager.renderAthletes();
        alert('Dati importati con successo!');
      } else {
        alert('File importato non corretto!');
      }
    } catch (err) {
      alert('Errore durante l\'import: ' + err.message);
    }
  };
  reader.readAsText(file);
});

function resetForm() {
  document.getElementById('athlete-form').reset();
}
function closeModal() {
  document.getElementById('athlete-modal').classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Modal logic (demo)
document.addEventListener('DOMContentLoaded', function() {
  window.athleteManager = new AthleteManager();

  // Modal chiusura
  const modal = document.getElementById('athlete-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });
});

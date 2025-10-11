const PROVINCE = {
  "BA": ["Bari", "Bitonto", "Corato"],
  "MI": ["Milano", "Sesto San Giovanni", "Cinisello Balsamo"],
  // ...altre province/comuni
};

class AthleteManager {
  constructor() {
    this.athletes = [];
    this.roles = ["LIBERO","SCHIACCIATORE","CENTRALE","OPPOSTO","PALLEGGIATORE","ALLENATORE"];
    this.campionati = ["SERIE D MASCHILE", "1° DIV. FEMMINILE", "1° DIVISIONE MASCHILE"];
    this.filteredAthletes = [...this.athletes];
    this.charts = {};
    this.init();
  }
  init() {
    this.setupProvinceComuneMenus();
    this.setupEventListeners();
    this.renderAthletes();
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
  setupEventListeners() {
    const athleteForm = document.getElementById('athlete-form');
    if (athleteForm) {
      athleteForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  }
  renderAthletes() {
    const grid = document.getElementById('athletes-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (this.filteredAthletes.length === 0) {
      grid.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--color-text-secondary);">
        <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px;"></i>
        <h3>Nessun atleta trovato</h3>
      </div>`;
      return;
    }
    this.filteredAthletes.forEach(athlete => {
      const card = document.createElement('div');
      card.className = 'athlete-card fade-in';
      card.onclick = () => this.showAthleteDetail(athlete);
      const initials = (athlete.nome && athlete.cognome) ? athlete.nome[0]+athlete.cognome[0] : '';
      card.innerHTML = `
        <div class="athlete-header">
          <div class="athlete-avatar">${initials}</div>
          <div class="athlete-info">
            <h4>${athlete.nome || ''} ${athlete.cognome || ''}</h4>
            <span class="athlete-role">${athlete.ruolo || ''}</span>
          </div>
        </div>
        <div class="athlete-details">
          <div class="detail-item"><span class="detail-label">Cod. Tess.</span><span class="detail-value">${athlete.codiceTesseramento || ''}</span></div>
          <div class="detail-item"><span class="detail-label">Campionato</span><span class="detail-value">${athlete.campionato || ''}</span></div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
  showAthleteDetail(athlete) {
    const modal = document.getElementById('athlete-modal');
    const modalName = document.getElementById('modal-athlete-name');
    const modalDetails = document.getElementById('modal-athlete-details');
    if (modalName) modalName.textContent = `${athlete.nome || ''} ${athlete.cognome || ''}`;
    if (modalDetails) {
      modalDetails.innerHTML = `
        <strong>Codice Tesseramento:</strong> ${athlete.codiceTesseramento || ''}<br>
        <strong>Nome:</strong> ${athlete.nome || ''}<br>
        <strong>Cognome:</strong> ${athlete.cognome || ''}<br>
        <strong>Sesso:</strong> ${athlete.sesso || ''}<br>
        <strong>Data nascita:</strong> ${athlete.dataNascita || ''}<br>
        <strong>Comune:</strong> ${athlete.comune || ''} (${athlete.provincia || ''})<br>
        <strong>Ruolo:</strong> ${athlete.ruolo || ''}<br>
        <strong>Campionato:</strong> ${athlete.campionato || ''}<br>
        <strong>Numero Maglia:</strong> ${athlete.numeroMaglia || ''}<br>
        <strong>Note:</strong> ${athlete.note || ''}
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
    this.athletes.push(newAthlete);
    this.filteredAthletes = [...this.athletes];
    this.renderAthletes();
    e.target.reset();
    alert('Atleta aggiunto con successo!');
    showSection('atleti');
  }
}
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
function exportData() {
  // ...come sopra...
}
// Import JSON
document.getElementById('import-file').addEventListener('change', function(e) {
  // ...come sopra...
});
function resetForm() {
  document.getElementById('athlete-form').reset();
}
function closeModal() {
  document.getElementById('athlete-modal').classList.add('hidden');
  document.body.style.overflow = 'auto';
}
document.addEventListener('DOMContentLoaded', function() {
  window.athleteManager = new AthleteManager();
  const modal = document.getElementById('athlete-modal');
  if (modal) modal.addEventListener('click', function(e) { if (e.target === this) closeModal(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
});


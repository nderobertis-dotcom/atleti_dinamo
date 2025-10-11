// Province/targhe e comuni per esempio
const PROVINCE = {
  "BA": ["Bari", "Bitonto", "Corato"],
  "MI": ["Milano", "Sesto San Giovanni", "Cinisello Balsamo"],
  "TO": ["Torino", "Moncalieri", "Collegno"],
  "RM": ["Roma", "Tivoli", "Frascati"],
  "NA": ["Napoli", "Pozzuoli", "Ercolano"],
  // ... aggiungi tutte le province italiane e i principali comuni
};

class AthleteManager {
  constructor() {
    this.athletes = [
      // ... elenco demo
    ];
    this.roles = ["LIBERO","SCHIACCIATORE","CENTRALE","OPPOSTO","PALLEGGIATORE","ALLENATORE"];
    this.campionati = ["SERIE D MASCHILE", "1° DIV. FEMMINILE", "1° DIVISIONE MASCHILE"];
    this.filteredAthletes = [...this.athletes];
    this.charts = {};
    this.init();
  }
  init() {
    // ... esistente ...
    this.setupProvinceComuneMenus();
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
  // ...resto invariato... Modificare la handleFormSubmit:
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
    // Nessun altro campo obbligatorio
    this.athletes.push(newAthlete);
    this.filteredAthletes = [...this.athletes];
    this.updateDashboard();
    this.renderAthletes();
    e.target.reset();
    alert('Atleta aggiunto con successo!');
    showSection('atleti');
  }
  // ... tutto il resto invariato
}

// ...showSection, import, export, ecc...
document.addEventListener('DOMContentLoaded', function() {
  athleteManager = new AthleteManager();
  // ... come già fornito ...
});

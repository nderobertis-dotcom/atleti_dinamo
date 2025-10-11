// Dati iniziali d'esempio
let elencoOriginario = [
  {
    cognome: "Rossi",
    nome: "Mario",
    genere: "M",
    nascita: "2001-09-12",
    luogoNascita: "Molfetta",
    codiceFiscale: "RSSMRA01S12F123",
    email: "mario.rossi@email.it",
    foto: "",
  },
  {
    cognome: "Bianchi",
    nome: "Luca",
    genere: "M",
    nascita: "2003-05-22",
    luogoNascita: "Bari",
    codiceFiscale: "BNCLCU03E22A123",
    email: "luca.bianchi@email.it",
    foto: "",
  },
  {
    cognome: "Verdi",
    nome: "Anna",
    genere: "F",
    nascita: "2000-11-08",
    luogoNascita: "Trani",
    codiceFiscale: "vrdnna00v08t123",
    email: "anna.verdi@email.it",
    foto: "",
  }
];

// Stato filtro
let filtroCognome = "";
let filtroGenere = "";

// Visualizza elenco all'avvio
aggiornaStatistiche();
mostraAtleti(elencoOriginario);

// Bottone: Mostra form
document.getElementById("add-athlete-btn").onclick = function() {
  document.getElementById("form-card").classList.remove("hidden");
};

// Bottone: Annulla form
document.getElementById("cancel-btn").onclick = function() {
  document.getElementById("athlete-form").reset();
  document.getElementById("form-card").classList.add("hidden");
};

// Submit form: aggiungi atleta
document.getElementById("athlete-form").onsubmit = function(e) {
  e.preventDefault();
  const nuovo = {
    cognome: document.getElementById("cognome").value.trim(),
    nome: document.getElementById("nome").value.trim(),
    genere: document.getElementById("genere").value,
    nascita: document.getElementById("nascita").value,
    luogoNascita: document.getElementById("luogo-nascita").value.trim(),
    codiceFiscale: document.getElementById("codice-fiscale").value.trim(),
    email: document.getElementById("email").value.trim(),
    foto: "",
  };
  const fileInput = document.getElementById("foto");
  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      nuovo.foto = evt.target.result;
      elencoOriginario.push(nuovo);
      aggiornaStatistiche();
      mostraAtleti(elencoOriginario);
      document.getElementById("athlete-form").reset();
      document.getElementById("form-card").classList.add("hidden");
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    elencoOriginario.push(nuovo);
    aggiornaStatistiche();
    mostraAtleti(elencoOriginario);
    document.getElementById("athlete-form").reset();
    document.getElementById("form-card").classList.add("hidden");
  }
};

// Filtro cognome con bottone cerca
document.getElementById("cerca-btn").onclick = function() {
  filtroCognome = document.getElementById("ricerca").value.trim().toLowerCase();
  filtraEVisualizza();
};

// Filtro genere
document.getElementById("gender-filter").onchange = function() {
  filtroGenere = this.value;
  filtraEVisualizza();
};

// Funzione applica filtri e mostra
function filtraEVisualizza() {
  let filtrati = [...elencoOriginario];
  if (filtroCognome) {
    filtrati = filtrati.filter(atleta =>
      atleta.cognome.toLowerCase().includes(filtroCognome)
    );
  }
  if (filtroGenere) {
    filtrati = filtrati.filter(atleta =>
      atleta.genere === filtroGenere
    );
  }
  mostraAtleti(filtrati);
}

// Mostra elenco atleti
function mostraAtleti(atleti) {
  atleti = atleti.sort((a, b) => a.cognome.localeCompare(b.cognome));
  const lista = document.getElementById("lista-atleti");
  lista.innerHTML = "";
  if (atleti.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nessun atleta trovato";
    lista.appendChild(li);
    document.getElementById("totale-atleti").textContent = 0;
    return;
  }
  atleti.forEach(atleta => {
    const li = document.createElement("li");
    const row = document.createElement("div");
    row.className = "elenco-fields";
    // Foto
    const foto = document.createElement("img");
    foto.className = "atleta-foto";
    foto.src = atleta.foto ? atleta.foto : "https://via.placeholder.com/40?text=A";
    foto.alt = `${atleta.cognome} Foto`;
    row.appendChild(foto);
    // Dati principali
    const dati = document.createElement("span");
    dati.textContent =
      atleta.cognome + " " + atleta.nome +
      " (" + (atleta.genere === "M" ? "M" : "F") + ")" +
      " - Nato a " + atleta.luogoNascita +
      " il " + atleta.nascita;
    row.appendChild(dati);
    // Codice Fiscale
    const cf = document.createElement("span");
    cf.textContent = "CF: " + atleta.codiceFiscale;
    cf.style.fontSize = '0.98em';
    cf.style.marginLeft = "10px";
    row.appendChild(cf);
    // Email
    const mail = document.createElement("span");
    mail.textContent = atleta.email;
    mail.style.marginLeft = "10px";
    row.appendChild(mail);
    li.appendChild(row);
    lista.appendChild(li);
  });
  document.getElementById("totale-atleti").textContent = atleti.length;
}

// Mostra statistiche
function aggiornaStatistiche() {
  document.getElementById("totale-atleti").textContent = elencoOriginario.length;
}

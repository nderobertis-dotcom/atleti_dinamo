// ...inizio invariato...

function mostraCardAggiungi() {
  const div = document.getElementById('card-atleta');
  div.innerHTML = `
    <div class="atleta" style="background: #f9f9f9; border-color: #4CAF50;">
      <img class="foto-atleta-big" id="foto-preview-add" style="display:none;">
      <label class="input-file-label">Foto:<input type="file" id="foto-input" accept="image/*"></label>
      ...tutti gli altri campi e menu...
      <div style="margin-top: 16px;">
        <button onclick="salvaNuovoAtleta()">SALVA</button>
        <button onclick="annullaEdit()">ANNULLA</button>
      </div>
    </div>
  `;
  document.getElementById('foto-input').addEventListener('change', function(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    if (file.size > 150000) { // blocco immagini >150KB
      alert("L'immagine è troppo grande! Usa una foto inferiore a 150KB.");
      evt.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
      document.getElementById('foto-preview-add').src = ev.target.result;
      document.getElementById('foto-preview-add').style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
}

// ...in modificaAtleta cambia per la foto così:
document.getElementById('foto-edit-input').addEventListener('change', function(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  if (file.size > 150000) {
    alert("L'immagine è troppo grande! Usa una foto inferiore a 150KB.");
    evt.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = function(ev) {
    document.getElementById('foto-preview-edit').src = ev.target.result;
    document.getElementById('foto-preview-edit').style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// ...resto invariato...

// Il resto come nelle versioni più recenti che ti ho già fornito!


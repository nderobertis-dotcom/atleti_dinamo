function esportaAtleti() {
  const blob = new Blob([JSON.stringify(atleti, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "atleti_backup.json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
document.getElementById('file-import').addEventListener('change', function(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    try {
      atleti = JSON.parse(evt.target.result);
      salvaAtleti();
      mostraLista();
      alert("Elenco atleti importato!");
    } catch (err) {
      alert("File non valido!");
    }
  };
  reader.readAsText(file);
});

document.addEventListener("DOMContentLoaded", function() {

let athletes = [];
let editIndex = null;

function calcolaEta(dataNascita) {
    if (!dataNascita) return "";
    const oggi = new Date();
    const nascita = new Date(dataNascita);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--;
    return eta;
}
function upper(s) { return s ? s.trim().toUpperCase() : ''; }

function caricaDati() {
    try {
        let dati = localStorage.getItem('athletes');
        if (!dati) return [];
        let arr = JSON.parse(dati);
        return Array.isArray(arr) ? arr : [];
    } catch { return []; }
}
athletes = caricaDati();

function salvaSuStorage() { localStorage.setItem('athletes', JSON.stringify(athletes)); }

function medicalStatus(expiry) {
    if (!expiry) return {class:"",code:"none"};
    const today = new Date();
    const expiryDate = new Date(expiry);
    expiryDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffMs = expiryDate - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { class: "medical-red", code:"expired" };
    if (diffDays <= 31) return { class: "medical-yellow", code:"expiring" };
    return { class: "medical-green", code:"valid" };
}
function listExpiredAndExpiring(type) {
    const today = new Date();
    today.setHours(0,0,0,0);
    let result = [];
    athletes.forEach(a => {
        if (!a.medical_expiry) return;
        const expiry = new Date(a.medical_expiry);
        expiry.setHours(0,0,0,0);
        const diff = Math.round((expiry - today)/(1000*60*60*24));
        if (type === "expired" && diff < 0) result.push(a);
        if (type === "expiring" && diff >= 0 && diff <= 31) result.push(a);
    });
    return result;
}
function countExpiredAndExpiring() {
    let expired = 0, expiring = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    athletes.forEach(a => {
        if (!a.medical_expiry) return;
        const expiry = new Date(a.medical_expiry);
        expiry.setHours(0,0,0,0);
        const diff = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) expired++;
        else if (diff <= 31) expiring++;
    });
    return { expired, expiring };
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
    // CARD VISITE
    const c = countExpiredAndExpiring();
    document.getElementById('total-expired').textContent = c.expired;
    document.getElementById('total-expiring').textContent = c.expiring;
}
function showMedicalList(type) {
    const container = document.getElementById('medical-list');
    let records = listExpiredAndExpiring(type);
    let color = type === "expired" ? "medical-red" : "medical-yellow";
    let title = type === "expired" ? "Vis

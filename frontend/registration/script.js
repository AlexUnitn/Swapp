// controllo formale codice fiscale
function validaCF(cf) {
  return /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i.test(cf);
}

// mostra il modale con l’elenco campi mancanti
function showRequiredModal(list) {
  const ul = document.getElementById('missingList');
  ul.innerHTML = '';
  list.forEach(txt => {
    const li = document.createElement('li');
    li.textContent = txt;
    ul.appendChild(li);
  });
  document.getElementById('modalRequired').classList.add('show');
}
function closeRequiredModal() {
  document.getElementById('modalRequired').classList.remove('show');
}

// gestione invio
document.getElementById('regForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const fields = [
    { id: 'nome',     label: 'Nome' },
    { id: 'cognome',  label: 'Cognome' },
	{ id: 'indirizzo', label: 'Indirizzo'},
    { id: 'cf',       label: 'Codice Fiscale' },
    { id: 'username', label: 'Username' },
    { id: 'email',    label: 'Email' },
    { id: 'password', label: 'Password' },
    { id: 'telefono', label: 'Telefono' }
  ];

  const missing = fields
    .map(f => ({ ...f, value: document.getElementById(f.id).value.trim() }))
    .filter(f => !f.value)
    .map(f => f.label);

  if (missing.length) {
    showRequiredModal(missing);
    return;
  }

  if (!validaCF(document.getElementById('cf').value.toUpperCase())) {
    alert('Codice Fiscale non valido');
    return;
  }

  alert('Registrazione completata (simulata)');
});
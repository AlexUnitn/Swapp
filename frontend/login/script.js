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
    { id: 'username', label: 'Username' },
    { id: 'password', label: 'Password' }
  ];

  const missing = fields
    .map(f => ({ ...f, value: document.getElementById(f.id).value.trim() }))
    .filter(f => !f.value)
    .map(f => f.label);

  if (missing.length) {
    showRequiredModal(missing);
    return;
  }
  alert('Login completato (simulata)');
});
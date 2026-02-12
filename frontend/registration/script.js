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
const FORM_FIELDS = [
  { id: 'nome',     key: 'firstName',   label: 'Nome' },
  { id: 'cognome',  key: 'lastName',    label: 'Cognome' },
  { id: 'indirizzo',key: 'address',     label: 'Indirizzo' },
  { id: 'cf',       key: 'fiscalCode',  label: 'Codice Fiscale' },
  { id: 'username', key: 'username',    label: 'Username' },
  { id: 'email',    key: 'email',       label: 'Email' },
  { id: 'password', key: 'password',    label: 'Password' },
  { id: 'telefono', key: 'phoneNumber', label: 'Telefono' }
];

document.getElementById('regForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const payload = {};
  let hasErrors = false;

  // Reset errori precedenti
  FORM_FIELDS.forEach(field => {
    document.getElementById(field.id).classList.remove('error-border');
  });

  // Raccolta dati e validazione campi vuoti
  FORM_FIELDS.forEach(field => {
    const element = document.getElementById(field.id);
    const value = element.value.trim();
    
    if (!value) {
      element.classList.add('error-border');
      hasErrors = true;
    }
    payload[field.key] = value;
  });

  if (hasErrors) {
    return; 
  }

  // Validazione CF
  if (!validaCF(payload.fiscalCode.toUpperCase())) {
    const cfInput = document.getElementById('cf');
    cfInput.classList.add('error-border');
    return;
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      window.location.href = 'successful.html';
    } else {
      alert('Errore: ' + result.message);
    }
  } catch (error) {
    console.error(error);
    alert('Impossibile contattare il server.');
  }
});
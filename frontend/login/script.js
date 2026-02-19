
const FORM_FIELDS = [
  { id: 'username', key: 'username',    label: 'Username' },
  { id: 'password', key: 'password',    label: 'Password' }
];

// gestione invio
document.getElementById('regForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const payload = {};
  let hasErrors = false;

  const errorDiv = document.getElementById('loginError');
  errorDiv.textContent = ''; // Pulisce errori precedenti

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

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      // Salva token e dati utente nel localStorage
      localStorage.setItem('token', result.token);
      if(result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      // Reindirizza alla pagina principale
      window.location.href = '../main/index.html';
    } else {
      // Mostra errore nel div dedicato invece dell'alert
      const errorDiv = document.getElementById('loginError');
      errorDiv.textContent = result.message || 'Credenziali non valide';
      
      // Colora anche il campo password di rosso per feedback visivo
      document.getElementById('password').classList.add('error-border');
      document.getElementById('username').classList.add('error-border');
    }
  } catch (error) {
    console.error(error);
    document.getElementById('loginError').textContent = 'Impossibile contattare il server.';
  }
});

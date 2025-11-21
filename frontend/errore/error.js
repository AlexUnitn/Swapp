// errore/error.js
(() => {
  // pagine reali che hai già pronte
  const existing = ['index.html', 'login.html', 'registrazione.html', '404.html'];

  // nome file attuale (es. "pagina-non-esiste.html")
  const file = location.pathname.split('/').pop() || 'index.html';

  if (!existing.includes(file)) {
    // mostra la tua pagina 404 senza cambiare URL
    document.body.innerHTML = `
      <div style="height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;font-family:Inter">
        <div>
          <h1 style="font-size:4rem;margin:0">404</h1>
          <p>La pagina che cerchi non esiste.</p>
          <a href="/" style="color:#2563eb">Torna alla home</a>
        </div>
      </div>`;
  }
})();
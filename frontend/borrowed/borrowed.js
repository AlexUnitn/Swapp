document.addEventListener('DOMContentLoaded', () => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  
  const userId = localStorage.getItem('userId')
    || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null);

  if (!userId) {
    showError('ID utente non trovato. Effettua il login.');
    return;
  }

  loadItems(userId);
});

async function loadItems(userId) {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const itemsListEl = document.getElementById('itemsList');
  const emptyStateEl = document.getElementById('emptyState');

  try {
    // Usa l'endpoint dedicato per gli oggetti presi in prestito
    const response = await fetch(`/api/item/recipient/${userId}`);
    
    if (!response.ok) {
      throw new Error('Errore nel caricamento degli oggetti');
    }

    const items = await response.json();

    loadingEl.classList.add('hidden');

    if (!items || items.length === 0) {
      emptyStateEl.classList.remove('hidden');
      return;
    }

    renderItems(items, itemsListEl);
    itemsListEl.classList.remove('hidden');

  } catch (err) {
    loadingEl.classList.add('hidden');
    showError(err.message || 'Errore di rete');
  }
}

function renderItems(items, container) {
  container.innerHTML = '';
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    const status = item.status || 'available';
    const statusClass = `status-${status}`;
    const statusText = getStatusText(status);
    
    // Estrai il nome del proprietario dall'oggetto popolato userId
    const ownerName = item.userId?.username || item.userId?.name || item.userId?.email || 'Sconosciuto';
    
    card.innerHTML = `
      <div class="item-header">
        <h3 class="item-title">${escapeHtml(item.title)}</h3>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ''}
      <p class="item-owner">👤 Proprietario: ${escapeHtml(ownerName)}</p>
      ${item.location?.city ? `<p class="item-location">📍 ${escapeHtml(item.location.city)}</p>` : ''}
      ${item.category ? `<span class="item-category">${escapeHtml(item.category)}</span>` : ''}
      <div class="item-footer">
        <span class="item-date">Durata max: ${item.maxLoanDuration || 'N/A'} giorni</span>
        <span class="item-id">ID: ${item._id?.toString().slice(-6) || 'N/A'}</span>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function getStatusText(status) {
  const statuses = {
    'available': 'Disponibile',
    'booked': 'Prenotato',
    'on_loan': 'In prestito',
    'unavailable': 'Non disponibile',
    'deleted': 'Eliminato'
  };
  return statuses[status] || status;
}

function showError(message) {
  const errorEl = document.getElementById('error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
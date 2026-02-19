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
    const response = await fetch(`/api/item/user/${userId}`);
    
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
    
    card.innerHTML = `
      <div class="item-header">
        <h3 class="item-title">${escapeHtml(item.title || item.name || 'Oggetto senza nome')}</h3>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ''}
      ${item.category ? `<span class="item-category">${escapeHtml(item.category)}</span>` : ''}
      <div class="item-footer">
        <span class="item-date">ID: ${item._id || item.id}</span>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function getStatusText(status) {
  const statuses = {
    'available': 'Disponibile',
    'lent': 'In prestito',
    'reserved': 'Prenotato',
    'unavailable': 'Non disponibile'
  };
  return statuses[status] || status;
}

function showError(message) {
  const errorEl = document.getElementById('error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
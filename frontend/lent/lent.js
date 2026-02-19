document.addEventListener('DOMContentLoaded', () => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  
  const userId = localStorage.getItem('userId')
    || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null);

  if (!userId) {
    showError('ID utente non trovato. Effettua il login.');
    return;
  }

  loadItems(userId);
  setupFormHandlers();
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
        <h3 class="item-title">${escapeHtml(item.title || 'Oggetto senza nome')}</h3>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ''}
      ${item.category ? `<span class="item-category">${escapeHtml(item.category)}</span>` : ''}
      <div class="item-footer">
        <span class="item-date">Durata max: ${item.maxLoanDuration || 'N/A'} giorni</span>
        <span class="item-id">ID: ${item._id?.toString().slice(-6) || 'N/A'}</span>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  // Aggiungi sempre il pulsante per nuovo oggetto in fondo alla lista
  const addButton = document.createElement('button');
  addButton.className = 'btn-primary';
  addButton.style.width = '100%';
  addButton.style.marginTop = '10px';
  addButton.innerHTML = '➕ Metti nuovo oggetto in prestito';
  addButton.addEventListener('click', showForm);
  container.appendChild(addButton);
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

function setupFormHandlers() {
  const showFormBtn = document.getElementById('showFormBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('createItemForm');
  const imagesInput = document.getElementById('images');
  
  if (showFormBtn) {
    showFormBtn.addEventListener('click', showForm);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', hideForm);
  }
  
  if (imagesInput) {
    imagesInput.addEventListener('change', handleImagePreview);
  }
  
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
}

function showForm() {
  const emptyState = document.getElementById('emptyState');
  const itemsList = document.getElementById('itemsList');
  const form = document.getElementById('newItemForm');
  
  if (emptyState) emptyState.classList.add('hidden');
  if (itemsList) itemsList.classList.add('hidden');
  form.classList.remove('hidden');
}

function hideForm() {
  const form = document.getElementById('newItemForm');
  const itemsList = document.getElementById('itemsList');
  const emptyState = document.getElementById('emptyState');
  
  form.classList.add('hidden');
  
  // Mostra la lista o lo stato vuoto in base ai dati
  const hasItems = document.querySelectorAll('.item-card').length > 0;
  if (hasItems) {
    itemsList.classList.remove('hidden');
  } else {
    emptyState.classList.remove('hidden');
  }
  
  // Reset form
  document.getElementById('createItemForm').reset();
  document.getElementById('imagePreview').innerHTML = '';
}

function handleImagePreview(e) {
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = '';
  
  const files = e.target.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    
    reader.onload = function(event) {
      const img = document.createElement('img');
      img.src = event.target.result;
      img.title = i === 0 ? 'Immagine principale' : `Immagine ${i + 1}`;
      if (i === 0) {
        img.style.borderColor = 'var(--accent)';
      }
      preview.appendChild(img);
    };
    
    reader.readAsDataURL(file);
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const userId = localStorage.getItem('userId')
    || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null);
  
  if (!userId) {
    showError('ID utente non trovato. Effettua il login.');
    return;
  }
  
  const formData = new FormData(e.target);
  
  // Costruisci l'oggetto dati
  const itemData = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    maxLoanDuration: parseInt(formData.get('maxLoanDuration')) || null,
    userId: userId,
    location: {
      city: document.getElementById('city').value,
      address: document.getElementById('address').value
    },
    status: 'available'
  };
  
  // Gestisci le immagini
  const imagesInput = document.getElementById('images');
  const images = [];
  
  if (imagesInput.files.length > 0) {
    const filePromises = Array.from(imagesInput.files).map((file, index) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          images.push({
            data: event.target.result,
            isMain: index === 0
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });
    
    await Promise.all(filePromises);
    itemData.images = images;
  }
  
  try {
    const response = await fetch('/api/item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Errore nella creazione dell\'oggetto');
    }
    
    // Successo! Ricarica la pagina per mostrare il nuovo oggetto
    showSuccess(responseData.message || 'Oggetto creato con successo!');
    setTimeout(() => {
      location.reload();
    }, 1500);
    
  } catch (err) {
    showError(err.message || 'Errore di rete');
  }
}

function showError(message) {
  const errorEl = document.getElementById('error');
  errorEl.className = 'error';
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  
  setTimeout(() => {
    errorEl.classList.add('hidden');
  }, 5000);
}

function showSuccess(message) {
  const errorEl = document.getElementById('error');
  errorEl.className = 'success';
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
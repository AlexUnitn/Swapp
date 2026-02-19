document.addEventListener('DOMContentLoaded', async () => {
    // 1. Gestione Icona Utente (Login/Account)
    const userIconLink = document.getElementById('userIconLink');
    if (userIconLink) {
        userIconLink.addEventListener('click', (e) => {
            e.preventDefault();
            const isLoggedIn = !!localStorage.getItem('token');
            window.location.href = isLoggedIn ? '../account/account.html' : '../login/login.html';
        });
    }

    // 2. Recupera ID Oggetto
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');

    if (!itemId) {
        showError('Nessun oggetto specificato.');
        return;
    }

    // 3. Fetch Dati
    try {
        const response = await fetch(`/api/item/${itemId}`);
        if (!response.ok) throw new Error('Oggetto non trovato');
        const item = await response.json();
        renderItem(item);
    } catch (err) {
        showError('Impossibile caricare i dettagli dell\'oggetto.');
        console.error(err);
    }
});

function renderItem(item) {
    const container = document.getElementById('itemDetails');
    
    // Gestione immagini
    const images = item.images && item.images.length > 0 
        ? item.images 
        : [{ data: '', isMain: true }];
    
    // Trova immagine principale
    let mainImgObj = images.find(img => img.isMain) || images[0];
    let mainImgSrc = getSrc(mainImgObj.data);

    const galleryHtml = `
        <div class="gallery-section">
            <img src="${mainImgSrc}" alt="${item.title}" class="main-image" id="mainImage">
            <div class="thumbnails">
                ${images.map((img, index) => {
                    const src = getSrc(img.data);
                    return `
                        <img src="${src}" 
                             class="thumbnail ${img === mainImgObj ? 'active' : ''}" 
                             onclick="changeImage('${src}', this)"
                             alt="Thumbnail ${index + 1}">
                    `;
                }).join('')}
            </div>
        </div>
    `;

    const infoHtml = `
        <div class="info-section">
            <div class="item-category">${item.category || 'Generico'}</div>
            <h1 class="item-title">${item.title}</h1>
            
            <div class="item-meta">
                <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${item.location?.city || 'N/A'}
                </div>
                <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Max ${item.maxLoanDuration || '?'} giorni
                </div>
            </div>

            <div class="item-description">
                ${item.description ? item.description.replace(/\n/g, '<br>') : 'Nessuna descrizione disponibile.'}
            </div>

            <button class="action-btn" onclick="contactOwner('${item.userId}')">Contatta Proprietario</button>
        </div>
    `;

    container.innerHTML = galleryHtml + infoHtml;
}

function getSrc(data) {
    if (!data) return 'https://via.placeholder.com/400x300?text=No+Image';
    // Se è già un URL completo o data URI
    if (data.startsWith('http') || data.startsWith('data:')) return data;
    // Altrimenti assumiamo sia base64 jpeg (standard più comune qui)
    return `data:image/jpeg;base64,${data}`;
}

function changeImage(src, thumb) {
    document.getElementById('mainImage').src = src;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

function showError(msg) {
    const container = document.getElementById('itemDetails');
    if(container) container.innerHTML = `<div class="error-msg">${msg}</div>`;
}

async function contactOwner(userId) {
    const token = localStorage.getItem('token');
    if (!token) {
        // Salva l'URL corrente per tornarci dopo il login (opzionale)
        alert('Devi effettuare il login per contattare il proprietario.');
        window.location.href = '../login/login.html';
        return;
    }
    
    // Qui si potrebbe reindirizzare alla chat
    alert(`Funzionalità chat in arrivo! Proprietario ID: ${userId}`);
    // window.location.href = `../chats/chats.html?contact=${userId}`;
}

// Esporta funzioni globali
window.changeImage = changeImage;
window.contactOwner = contactOwner;

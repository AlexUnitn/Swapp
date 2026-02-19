document.addEventListener('DOMContentLoaded', () => {
  // only allow access when logged in
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  /*sif (!loggedIn) {
    location.href = '../login/login.html';
    return;
  }*/

  const loansLink = document.getElementById('loansLink');
  const modalRoot = document.getElementById('modal-root');

  loansLink.addEventListener('click', async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId')
      || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null);

    if (!userId) {
      alert('User ID not found in localStorage. Cannot fetch your items/bookings.');
      return;
    }

    try {
      const [itemsRes, bookingsRes] = await Promise.all([
        fetch(`/api/item/user/${userId}`),
        fetch(`/api/booking/user/${userId}`)
      ]);

      if (!itemsRes.ok) throw new Error('Failed to fetch items');
      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');

      const items = await itemsRes.json();
      const bookings = await bookingsRes.json();

      showModal(items, bookings);
    } catch (err) {
      alert(err.message || 'Network error');
    }
  });

  function showModal(items, bookings) {
    modalRoot.innerHTML = '';
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:2000;padding:20px;';

    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:12px;padding:18px;max-width:800px;width:100%;max-height:80vh;overflow:auto;border:1px solid #e5e7eb;box-shadow:0 8px 30px rgba(2,6,23,0.2);';

    const close = document.createElement('button');
    close.textContent = 'Chiudi';
    close.style.cssText = 'float:right;background:#111827;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;margin-left:8px;';
    close.addEventListener('click', () => modalRoot.innerHTML = '');

    const title = document.createElement('h3');
    title.textContent = 'Prestiti e Prenotazioni';

    box.appendChild(close);
    box.appendChild(title);

    const itemsSection = document.createElement('section');
    const itemsH = document.createElement('h4');
    itemsH.textContent = `Items (${Array.isArray(items) ? items.length : 0})`;
    itemsSection.appendChild(itemsH);
    if (!items || items.length === 0) {
      const p = document.createElement('p'); p.textContent = 'Nessun item.'; itemsSection.appendChild(p);
    } else {
      const ul = document.createElement('ul');
      items.forEach(it => {
        const li = document.createElement('li');
        li.textContent = it.title || it.name || `ID: ${it._id || it.id}`;
        ul.appendChild(li);
      });
      itemsSection.appendChild(ul);
    }

    const bookingsSection = document.createElement('section');
    const bookH = document.createElement('h4');
    bookH.textContent = `Bookings (${Array.isArray(bookings) ? bookings.length : 0})`;
    bookingsSection.appendChild(bookH);
    if (!bookings || bookings.length === 0) {
      const p = document.createElement('p'); p.textContent = 'Nessuna prenotazione.'; bookingsSection.appendChild(p);
    } else {
      const ul2 = document.createElement('ul');
      bookings.forEach(b => {
        const li = document.createElement('li');
        const itemRef = b.item || b.itemId || b.itemTitle || b._id || 'item';
        const state = b.status || b.state || 'n/a';
        li.textContent = `Item: ${itemRef} — Status: ${state}`;
        ul2.appendChild(li);
      });
      bookingsSection.appendChild(ul2);
    }

    box.appendChild(itemsSection);
    box.appendChild(bookingsSection);

    overlay.appendChild(box);
    modalRoot.appendChild(overlay);
  }
});

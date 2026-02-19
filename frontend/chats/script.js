// We'll build conversations from bookings and items and keep messages in localStorage
let convs = []; // {id, name, avatar, itemId, lastMsg, lastTime}
let messagesStore = {}; // keyed by convKey -> [{sender,text,time,meta}]

// ---- render conversation list ----
const convList = document.getElementById('convList');
const searchConv = document.getElementById('searchConv');

function convKey(counterpartId, itemId) {
  return `${counterpartId}:${itemId || 'noitem'}`;
}

function renderConvList(list) {
  convList.innerHTML = '';
  list.forEach(c => {
    const li = document.createElement('li');
    li.className = 'conv-item';
    li.dataset.key = c.key;
    li.innerHTML = `
      <img class="conv-avatar" src="${c.avatar}" alt="">
      <div class="conv-body">
        <div class="conv-name">${c.name}</div>
        <div class="conv-last">${c.lastMsg || ''}</div>
      </div>
      <div class="conv-time">${c.lastTime || ''}</div>`;
    convList.appendChild(li);
  });
}

async function initConversations() {
  const token = localStorage.getItem('token');
  if (!token) {
    location.href = '../login/login.html';
    return;
  }

  const userId = localStorage.getItem('userId') || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null);
  if (!userId) return;

  // load persisted messages
  try { messagesStore = JSON.parse(localStorage.getItem('messages') || '{}'); } catch(e){ messagesStore = {}; }

  // fetch bookings where user is borrower
  const headers = { 'Authorization': `Bearer ${token}` };
  const borrowerRes = await fetch(`/api/booking/user/${userId}`, { headers });
  const borrowerBookings = borrowerRes.ok ? await borrowerRes.json() : [];

  // fetch items owned by user
  // Items API might be public or protected, better to send token if we have it
  const myItemsRes = await fetch(`/api/item/user/${userId}`, { headers });
  const myItems = myItemsRes.ok ? await myItemsRes.json() : [];
  const myItemIds = myItems.map(i => i._id || i.id);

  // fetch all bookings to find those referencing my items
  const allBookingsRes = await fetch('/api/booking', { headers });
  const allBookings = allBookingsRes.ok ? await allBookingsRes.json() : [];

  const ownerBookings = allBookings.filter(b => myItemIds.includes((b.item && (b.item._id || b.item)) || b.item));

  const convMap = new Map();

  // helper to ensure counterpart user info
  async function ensureConv(counterpartId, itemId) {
    const key = convKey(counterpartId, itemId);
    if (convMap.has(key)) return;
    // fetch user info
    const uRes = await fetch(`/api/users/${counterpartId}`, { headers });
    const user = uRes.ok ? await uRes.json() : { username: 'User' };
    const avatar = `https://i.pravatar.cc/150?u=${counterpartId}`;
    // attempt to get last message/time from store
    const msgs = messagesStore[key] || [];
    const last = msgs.length ? msgs[msgs.length-1] : null;
    convMap.set(key, {
      key,
      counterpartId,
      itemId,
      name: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
      avatar,
      lastMsg: last ? last.text : (itemId ? `Conversazione su item ${itemId}` : ''),
      lastTime: last ? last.time : ''
    });
  }

  // process borrower bookings -> counterpart is item owner
  for (const b of borrowerBookings) {
    const itemId = (b.item && (b.item._id || b.item)) || b.item;
    // fetch item to get owner
    const itRes = await fetch(`/api/item/${itemId}`);
    const it = itRes.ok ? await itRes.json() : null;
    if (!it) continue;
    const ownerId = it.userId;
    await ensureConv(ownerId, itemId);
  }

  // process owner bookings -> counterpart is borrower
  for (const b of ownerBookings) {
    const itemId = (b.item && (b.item._id || b.item)) || b.item;
    const borrowerId = b.borrower;
    await ensureConv(borrowerId, itemId);
  }

  // check for contact/item params in URL to start a new conversation
  const params = new URLSearchParams(window.location.search);
  const contactId = params.get('contact');
  const paramItemId = params.get('item');

  if (contactId) {
    // ensure conversation exists (create if new)
    await ensureConv(contactId, paramItemId);
  }

  convs = Array.from(convMap.values());
  renderConvList(convs);

  if (contactId) {
      const targetKey = convKey(contactId, paramItemId);
      openConversation(targetKey);
  } else if (convs.length) {
      openConversation(convs[0].key);
  }
}

initConversations().catch(err => console.error(err));

// ---- search / filter ----
searchConv.addEventListener('input', () => {
  const q = searchConv.value.toLowerCase();
  const filtered = convs.filter(c => c.name.toLowerCase().includes(q));
  renderConvList(filtered);
});

// ---- open conversation ----
const chatAvatar  = document.querySelector('.chat-header .chat-avatar');
const chatName    = document.querySelector('.chat-header .chat-name');
const messagesDiv = document.getElementById('messages');
let activeConvKey = null;

convList.addEventListener('click', async e => {
  const item = e.target.closest('.conv-item');
  if (!item) return;
  const key = item.dataset.key;
  openConversation(key);
});

async function openConversation(key) {
  activeConvKey = key;
  const conv = convs.find(c => c.key === key);
  if (!conv) return;
  chatAvatar.src = conv.avatar;
  chatName.textContent = conv.name;

  const chatItemDiv = document.getElementById('chat-item');
  // if conversation is about an item, fetch and render it at the top
  if (conv.itemId) {
    try {
      const itRes = await fetch(`/api/item/${conv.itemId}`);
      if (itRes.ok) {
        const it = await itRes.json();
        chatName.textContent = `${conv.name}`;
        // render item block
        const mainImage = (it.images && it.images.find(img => img.isMain)) || (it.images && it.images[0]);
        const imgTag = mainImage ? `<img src="data:image/png;base64,${mainImage.data}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;margin-right:12px;"/>` : '';
        const title = it.title || `Item ${conv.itemId}`;
        const desc = it.description ? (it.description.length > 140 ? it.description.slice(0,140)+'…' : it.description) : '';
        const location = it.location ? (it.location.city || '') : '';

        chatItemDiv.style.display = 'flex';
        chatItemDiv.style.alignItems = 'center';
        const detailHref = `../itemdetails/item.html?id=${encodeURIComponent(conv.itemId)}`;
        chatItemDiv.innerHTML = `
          <a href="${detailHref}" style="display:flex;align-items:center;text-decoration:none;color:inherit;width:100%">
            ${imgTag}
            <div style="flex:1;min-width:0;">
              <div style="font-weight:600;margin-bottom:6px;">${escapeHtml(title)}</div>
              <div style="font-size:13px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(desc)}</div>
              <div style="font-size:12px;color:#888;margin-top:6px;">${escapeHtml(location)}</div>
            </div>
          </a>
        `;
      } else {
        chatItemDiv.style.display = 'none';
      }
    } catch (e) {
      chatItemDiv.style.display = 'none';
    }
  } else {
    if (chatItemDiv) chatItemDiv.style.display = 'none';
  }

  // mark active
  document.querySelectorAll('.conv-item').forEach(li => {
    li.classList.toggle('active', li.dataset.key === key);
  });

  // load messages: try server endpoint first
  messagesDiv.innerHTML = '';
  let msgs = [];
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch(`/api/messages/conversation/${encodeURIComponent(key)}`, { headers });
    if (res.ok) msgs = await res.json();
  } catch (e) { /* ignore */ }

  // fallback to localStorage
  if (!msgs || !msgs.length) {
    msgs = messagesStore[key] || [];
  }

  msgs.forEach(msg => addBubble(msg));
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addBubble(msg) {
  const div = document.createElement('div');
  div.className = `bubble ${msg.sender}`;
  div.textContent = msg.text;
  messagesDiv.appendChild(div);

  const time = document.createElement('div');
  time.className = 'time';
  time.textContent = msg.time;
  messagesDiv.appendChild(time);
}

// simple HTML escape
function escapeHtml(str){
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]);
}

// ---- send message ----
const composeForm = document.getElementById('composeForm');
const msgInput    = document.getElementById('msgInput');

composeForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!activeConvKey) return;
  const text = msgInput.value.trim();
  if (!text) return;

  const msg = { sender: 'you', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  addBubble(msg);
  msgInput.value = '';
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // try to POST to server endpoint if available
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type':'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    await fetch('/api/messages', { 
      method: 'POST', 
      headers, 
      body: JSON.stringify({conversation: activeConvKey, message: msg}) 
    });
  } catch (e) { /* ignore */ }

  // persist locally
  messagesStore[activeConvKey] = messagesStore[activeConvKey] || [];
  messagesStore[activeConvKey].push(msg);
  localStorage.setItem('messages', JSON.stringify(messagesStore));
});

// no-op: conversations will open after initialization
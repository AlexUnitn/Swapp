// Configuration
const API_BASE = ''; // or your API base URL

// State
let convs = []; // {key, name, avatar, itemId, counterpartId, lastMsg, lastTime}
let currentUserId = null;
let activeConvKey = null;

// DOM Elements
const convList = document.getElementById('convList');
const searchConv = document.getElementById('searchConv');
const chatAvatar = document.querySelector('.chat-header .chat-avatar');
const chatName = document.querySelector('.chat-header .chat-name');
const messagesDiv = document.getElementById('messages');
const composeForm = document.getElementById('composeForm');
const msgInput = document.getElementById('msgInput');

// ---- Utility Functions ----

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function getCurrentUserId() {
  if (currentUserId) return currentUserId;
  const stored = localStorage.getItem('userId') || 
    (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null);
  currentUserId = stored;
  return stored;
}

function convKey(counterpartId, itemId) {
  return `${counterpartId}:${itemId || 'noitem'}`;
}

function parseConvKey(key) {
  const [counterpartId, itemId] = key.split(':');
  return { counterpartId, itemId: itemId === 'noitem' ? null : itemId };
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]);
}

// ---- Render Functions ----

function renderConvList(list) {
  convList.innerHTML = '';
  list.forEach(c => {
    const li = document.createElement('li');
    li.className = 'conv-item';
    li.dataset.key = c.key;
    const timeStr = c.lastTime ? formatTime(c.lastTime) : '';
    li.innerHTML = `
      <img class="conv-avatar" src="${c.avatar}" alt="">
      <div class="conv-body">
        <div class="conv-name">${escapeHtml(c.name)}</div>
        <div class="conv-last">${escapeHtml(c.lastMsg || '')}</div>
      </div>
      <div class="conv-time">${timeStr}</div>`;
    convList.appendChild(li);
  });
}

function addBubble(msg, isMe) {
  const div = document.createElement('div');
  div.className = `bubble ${isMe ? 'you' : 'other'}`;
  div.textContent = msg.text;
  messagesDiv.appendChild(div);

  const time = document.createElement('div');
  time.className = 'time';
  time.textContent = formatTime(msg.createdAt || msg.time || new Date());
  time.style.alignSelf = isMe ? 'flex-end' : 'flex-start';
  messagesDiv.appendChild(time);
}

// ---- API Functions ----

async function fetchMessages(conversationKey) {
  try {
    const res = await fetch(`${API_BASE}/api/messages?conversationKey=${encodeURIComponent(conversationKey)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return await res.json();
  } catch (e) {
    console.error('Error fetching messages:', e);
    return [];
  }
}

async function sendMessage(conversationKey, recipientId, text) {
  try {
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        conversationKey,
        recipient: recipientId,
        text
      })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return await res.json();
  } catch (e) {
    console.error('Error sending message:', e);
    throw e;
  }
}

// ---- Conversation Management ----

async function ensureConv(counterpartId, itemId, headers) {
  const key = convKey(counterpartId, itemId);
  
  // Check if already exists
  const existing = convs.find(c => c.key === key);
  if (existing) return existing;

  // Fetch user info
  const uRes = await fetch(`/api/users/${counterpartId}`, { headers });
  const user = uRes.ok ? await uRes.json() : { username: 'User' };
  const avatar = `https://i.pravatar.cc/150?u=${counterpartId}`;
  
  // Fetch last message for this conversation
  let lastMsg = '';
  let lastTime = '';
  try {
    const msgs = await fetchMessages(key);
    if (msgs && msgs.length > 0) {
      lastMsg = msgs[msgs.length - 1].text;
      lastTime = msgs[msgs.length - 1].createdAt;
    }
  } catch (e) {
    // If no messages yet, that's fine
    lastMsg = itemId ? `Conversation about item` : '';
  }

  const conv = {
    key,
    counterpartId,
    itemId,
    name: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
    avatar,
    lastMsg,
    lastTime
  };
  
  convs.push(conv);
  return conv;
}

async function initConversations() {
  const token = localStorage.getItem('token');
  if (!token) {
    location.href = '../login/login.html';
    return;
  }

  const userId = getCurrentUserId();
  if (!userId) {
    console.error('No user ID found');
    return;
  }

  const headers = getAuthHeaders();

  // Fetch bookings where user is borrower
  const borrowerRes = await fetch(`/api/booking/user/${userId}`, { headers });
  const borrowerBookings = borrowerRes.ok ? await borrowerRes.json() : [];

  // Fetch items owned by user
  const myItemsRes = await fetch(`/api/item/user/${userId}`, { headers });
  const myItems = myItemsRes.ok ? await myItemsRes.json() : [];
  const myItemIds = myItems.map(i => i._id || i.id);

  // Fetch all bookings to find those referencing my items
  const allBookingsRes = await fetch('/api/booking', { headers });
  const allBookings = allBookingsRes.ok ? await allBookingsRes.json() : [];
  const ownerBookings = allBookings.filter(b => 
    myItemIds.includes((b.item && (b.item._id || b.item)) || b.item)
  );

  // Build conversations
  for (const b of borrowerBookings) {
    const itemId = (b.item && (b.item._id || b.item)) || b.item;
    const itRes = await fetch(`/api/item/${itemId}`, { headers });
    const it = itRes.ok ? await itRes.json() : null;
    if (!it) continue;
    await ensureConv(it.userId, itemId, headers);
  }

  for (const b of ownerBookings) {
    const itemId = (b.item && (b.item._id || b.item)) || b.item;
    const borrowerId = b.borrower;
    await ensureConv(borrowerId, itemId, headers);
  }

  // Check for contact/item params in URL
  const params = new URLSearchParams(window.location.search);
  const contactId = params.get('contact');
  const paramItemId = params.get('item');

  if (contactId) {
    await ensureConv(contactId, paramItemId, headers);
  }

  // Sort by last message time
  convs.sort((a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0));
  
  renderConvList(convs);

  if (contactId) {
    const targetKey = convKey(contactId, paramItemId);
    openConversation(targetKey);
  } else if (convs.length) {
    openConversation(convs[0].key);
  }
}

// ---- Event Handlers ----

searchConv.addEventListener('input', () => {
  const q = searchConv.value.toLowerCase();
  const filtered = convs.filter(c => c.name.toLowerCase().includes(q));
  renderConvList(filtered);
});

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
  
  // Render item info if applicable
  if (conv.itemId) {
    try {
      const itRes = await fetch(`/api/item/${conv.itemId}`, { headers: getAuthHeaders() });
      if (itRes.ok) {
        const it = await itRes.json();
        const mainImage = (it.images && it.images.find(img => img.isMain)) || (it.images && it.images[0]);
        const imgTag = mainImage ? 
          `<img src="data:image/png;base64,${mainImage.data}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;margin-right:12px;"/>` : '';
        const title = it.title || `Item ${conv.itemId}`;
        const desc = it.description ? 
          (it.description.length > 140 ? it.description.slice(0,140)+'…' : it.description) : '';
        const location = it.location ? (it.location.city || '') : '';

        chatItemDiv.style.display = 'flex';
        chatItemDiv.style.alignItems = 'center';
        const detailHref = `../itemdetails/index.html?id=${encodeURIComponent(conv.itemId)}`;
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
    chatItemDiv.style.display = 'none';
  }

  // Mark active
  document.querySelectorAll('.conv-item').forEach(li => {
    li.classList.toggle('active', li.dataset.key === key);
  });

  // Load messages from API
  messagesDiv.innerHTML = '';
  const msgs = await fetchMessages(key);
  
  const myId = getCurrentUserId();
  msgs.forEach(msg => {
    const isMe = msg.sender === myId || msg.sender?._id === myId;
    addBubble(msg, isMe);
  });
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

composeForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!activeConvKey) return;
  
  const text = msgInput.value.trim();
  if (!text) return;

  const conv = convs.find(c => c.key === activeConvKey);
  if (!conv) return;

  const myId = getCurrentUserId();
  
  // Optimistically add to UI
  const tempMsg = { text, createdAt: new Date().toISOString() };
  addBubble(tempMsg, true);
  msgInput.value = '';
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  try {
    // Send to server
    const savedMsg = await sendMessage(activeConvKey, conv.counterpartId, text);
    
    // Update conversation list with new message
    conv.lastMsg = text;
    conv.lastTime = savedMsg.createdAt || new Date().toISOString();
    
    // Re-sort and re-render conversation list
    convs.sort((a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0));
    renderConvList(convs);
    
    // Re-mark active
    document.querySelectorAll('.conv-item').forEach(li => {
      li.classList.toggle('active', li.dataset.key === activeConvKey);
    });
    
  } catch (e) {
    // Show error state on the bubble if needed
    console.error('Failed to send:', e);
    alert('Failed to send message. Please try again.');
  }
});

// Initialize
initConversations().catch(err => console.error(err));
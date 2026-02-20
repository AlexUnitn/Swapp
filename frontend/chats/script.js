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
const proposeBtn = document.getElementById('proposeBtn');
const proposalPanel = document.getElementById('proposalPanel');
const proposalStart = document.getElementById('proposalStart');
const proposalEnd = document.getElementById('proposalEnd');
const proposalSend = document.getElementById('proposalSend');
const proposalCancel = document.getElementById('proposalCancel');

// ---- Utility Functions ----

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function getCurrentUserId() {
  if (currentUserId) return currentUserId;
  const stored = localStorage.getItem('userId') || 
    (localStorage.getItem('user') ? (JSON.parse(localStorage.getItem('user')).id || JSON.parse(localStorage.getItem('user'))._id) : null);
  currentUserId = stored;
  return stored;
}

function convKey(counterpartId, itemId) {
  const me = normalizeId(getCurrentUserId());
  const other = normalizeId(counterpartId);
  if (!me || !other) {
    return `${other || 'unknown'}:${itemId || 'noitem'}`;
  }
  const pair = [me, other].sort();
  return `${pair[0]}:${pair[1]}:${itemId || 'noitem'}`;
}

function parseConvKey(key, currentUserId) {
  const parts = key.split(':');
  if (parts.length >= 3) {
    const userA = parts[0];
    const userB = parts[1];
    const itemId = parts.slice(2).join(':');
    const me = normalizeId(currentUserId);
    const counterpartId = me === userA ? userB : userA;
    return { userA, userB, counterpartId, itemId: itemId === 'noitem' ? null : itemId };
  }
  const [counterpartId, itemId] = parts;
  return { counterpartId, itemId: itemId === 'noitem' ? null : itemId };
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('it-IT');
}

function formatDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function setProposalPanelVisible(visible) {
  proposalPanel.classList.toggle('hidden', !visible);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]);
}

function normalizeId(id) {
  if (!id) return null;
  return String(id);
}

function getImageSrc(data) {
  if (!data) return 'https://via.placeholder.com/72?text=No+Image';
  if (data.startsWith('http') || data.startsWith('data:')) return data;
  return `data:image/jpeg;base64,${data}`;
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
  if (msg.meta && msg.meta.type === 'booking_proposal') {
    addProposalBubble(msg, isMe);
    return;
  }
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

function addProposalBubble(msg, isMe) {
  const meta = msg.meta || {};
  const status = meta.status || 'pending';
  const title = meta.itemTitle || 'Oggetto';
  const start = meta.requestedStartDate ? formatDateLabel(meta.requestedStartDate) : '';
  const end = meta.requestedEndDate ? formatDateLabel(meta.requestedEndDate) : '';
  const statusLabel = status === 'accepted' ? 'Accettata' : status === 'rejected' ? 'Rifiutata' : 'In attesa';
  const myId = getCurrentUserId();
  const recipientId = msg.recipient?._id || msg.recipient;
  const canRespond = status === 'pending' && normalizeId(recipientId) === normalizeId(myId);

  const div = document.createElement('div');
  div.className = `bubble proposal ${isMe ? 'you' : 'other'}`;
  div.innerHTML = `
    <div class="proposal-title">Proposta prenotazione</div>
    <div class="proposal-item">${escapeHtml(title)}</div>
    ${start && end ? `<div class="proposal-dates">${escapeHtml(start)} → ${escapeHtml(end)}</div>` : ''}
    <div class="proposal-status status-${status}">${statusLabel}</div>
    ${canRespond ? `
      <div class="proposal-actions">
        <button class="proposal-btn accept" data-action="accept" data-id="${msg._id}">Accetta</button>
        <button class="proposal-btn reject" data-action="reject" data-id="${msg._id}">Rifiuta</button>
      </div>
    ` : ''}
  `;
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

async function sendProposal(conversationKey, recipientId, itemId, requestedStartDate, requestedEndDate) {
  try {
    const res = await fetch(`${API_BASE}/api/messages/proposal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        conversationKey,
        recipient: recipientId,
        itemId,
        requestedStartDate,
        requestedEndDate
      })
    });
    if (!res.ok) throw new Error('Failed to send proposal');
    return await res.json();
  } catch (e) {
    console.error('Error sending proposal:', e);
    throw e;
  }
}

async function respondToProposal(messageId, action) {
  try {
    const res = await fetch(`${API_BASE}/api/messages/proposal/${messageId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error('Failed to respond to proposal');
    return await res.json();
  } catch (e) {
    console.error('Error responding to proposal:', e);
    throw e;
  }
}

async function fetchMyConversations() {
  try {
    const res = await fetch(`${API_BASE}/api/messages/conversations`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return await res.json();
  } catch (e) {
    console.error('Error fetching conversations:', e);
    return [];
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

async function ensureConvFromKey(key, counterpartId, itemId, headers, lastMsg, lastTime) {
  const existing = convs.find(c => c.key === key);
  if (existing) return existing;

  let user = { username: 'User' };
  if (counterpartId) {
    const uRes = await fetch(`/api/users/${counterpartId}`, { headers });
    user = uRes.ok ? await uRes.json() : user;
  }

  const conv = {
    key,
    counterpartId,
    itemId,
    name: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
    avatar: `https://i.pravatar.cc/150?u=${counterpartId || key}`,
    lastMsg: lastMsg || '',
    lastTime: lastTime || ''
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

  const convSummaries = await fetchMyConversations();
  for (const summary of convSummaries) {
    const key = summary._id || summary.conversationKey;
    if (!key) continue;
    const parsed = parseConvKey(key, userId);
    const last = summary.lastMessage || {};
    const senderId = normalizeId(last.sender);
    const recipientId = normalizeId(last.recipient);
    const me = normalizeId(userId);
    let counterpartId = parsed.counterpartId;
    if (!counterpartId && (senderId || recipientId)) {
      counterpartId = senderId === me ? recipientId : senderId;
    }
    await ensureConvFromKey(key, counterpartId, parsed.itemId, headers, last.text, last.createdAt);
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
  proposeBtn.disabled = !conv.itemId;
  setProposalPanelVisible(false);

  const chatItemDiv = document.getElementById('chat-item');
  
  // Render item info if applicable
  if (conv.itemId) {
    try {
      const itRes = await fetch(`/api/item/${conv.itemId}`, { headers: getAuthHeaders() });
      if (itRes.ok) {
        const it = await itRes.json();
        const mainImage = (it.images && it.images.find(img => img.isMain)) || (it.images && it.images[0]);
        const mainImageSrc = mainImage ? getImageSrc(mainImage.data) : '';
        const imgTag = mainImage ? 
          `<img src="${mainImageSrc}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;margin-right:12px;"/>` : '';
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

proposeBtn.addEventListener('click', async () => {
  if (!activeConvKey) return;
  const conv = convs.find(c => c.key === activeConvKey);
  if (!conv || !conv.itemId) {
    alert('Seleziona una conversazione legata a un oggetto.');
    return;
  }

  const itRes = await fetch(`/api/item/${conv.itemId}`, { headers: getAuthHeaders() });
  if (!itRes.ok) {
    alert('Impossibile caricare i dettagli dell’oggetto.');
    return;
  }
  const it = await itRes.json();
  if (it.status !== 'available') {
    alert('L’oggetto non è disponibile per la prenotazione.');
    return;
  }

  const startDefault = new Date();
  const endDefault = new Date();
  const duration = Number(it.maxLoanDuration) || 1;
  endDefault.setDate(startDefault.getDate() + duration);

  proposalStart.value = formatDateInput(startDefault);
  proposalEnd.value = formatDateInput(endDefault);
  proposalPanel.dataset.conversationKey = activeConvKey;
  proposalPanel.dataset.recipientId = conv.counterpartId || '';
  proposalPanel.dataset.itemId = conv.itemId;
  setProposalPanelVisible(true);
  proposalStart.focus();
});

proposalCancel.addEventListener('click', () => {
  setProposalPanelVisible(false);
});

proposalSend.addEventListener('click', async () => {
  const conversationKey = proposalPanel.dataset.conversationKey;
  const recipientId = proposalPanel.dataset.recipientId;
  const itemId = proposalPanel.dataset.itemId;
  if (!conversationKey || !recipientId || !itemId) return;

  const start = new Date(proposalStart.value);
  const end = new Date(proposalEnd.value);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    alert('Intervallo date non valido.');
    return;
  }

  const conv = convs.find(c => c.key === conversationKey);
  if (!conv) return;

  try {
    const savedMsg = await sendProposal(
      conversationKey,
      recipientId,
      itemId,
      start.toISOString(),
      end.toISOString()
    );

    addBubble(savedMsg, true);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    conv.lastMsg = savedMsg.text;
    conv.lastTime = savedMsg.createdAt || new Date().toISOString();
    convs.sort((a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0));
    renderConvList(convs);
    document.querySelectorAll('.conv-item').forEach(li => {
      li.classList.toggle('active', li.dataset.key === activeConvKey);
    });

    setProposalPanelVisible(false);
  } catch (e) {
    alert('Invio proposta non riuscito.');
  }
});

messagesDiv.addEventListener('click', async e => {
  const btn = e.target.closest('.proposal-btn');
  if (!btn) return;
  const action = btn.dataset.action;
  const messageId = btn.dataset.id;
  if (!action || !messageId) return;

  try {
    await respondToProposal(messageId, action);
    if (activeConvKey) {
      openConversation(activeConvKey);
    }
  } catch (e) {
    alert('Operazione non riuscita.');
  }
});

// Initialize
initConversations().catch(err => console.error(err));

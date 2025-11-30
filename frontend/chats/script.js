// ---- dummy data ----
const fakeConvs = [
  { id: 1, name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1',
    lastMsg: 'See you tomorrow!', lastTime: '10:42', unread: 2 },
  { id: 2, name: 'Bob', avatar: 'https://i.pravatar.cc/150?img=2',
    lastMsg: 'Okay 👍', lastTime: 'Yesterday', unread: 0 },
  { id: 3, name: 'Dev Team', avatar: 'https://i.pravatar.cc/150?img=3',
    lastMsg: 'PR merged', lastTime: 'Mon', unread: 5 }
];

const fakeMessages = {
  1: [
    { sender: 'other', text: 'Hey, how are you?', time: '10:40' },
    { sender: 'you',  text: 'Good, you?',       time: '10:41' },
    { sender: 'other', text: 'See you tomorrow!',time: '10:42' }
  ],
  2: [
    { sender: 'you', text: 'Can you review?', time: 'Yesterday 18:22' },
    { sender: 'other', text: 'Okay 👍',       time: 'Yesterday 18:40' }
  ],
  3: [
    { sender: 'other', text: 'New build is up', time: 'Mon 09:12' }
  ]
};

// ---- render conversation list ----
const convList = document.getElementById('convList');
const searchConv = document.getElementById('searchConv');

function renderConvList(list) {
  convList.innerHTML = '';
  list.forEach(c => {
    const li = document.createElement('li');
    li.className = 'conv-item';
    li.dataset.id = c.id;
    li.innerHTML = `
      <img class="conv-avatar" src="${c.avatar}" alt="">
      <div class="conv-body">
        <div class="conv-name">${c.name}</div>
        <div class="conv-last">${c.lastMsg}</div>
      </div>
      <div class="conv-time">${c.lastTime}</div>`;
    convList.appendChild(li);
  });
}
renderConvList(fakeConvs);

// ---- search / filter ----
searchConv.addEventListener('input', () => {
  const q = searchConv.value.toLowerCase();
  const filtered = fakeConvs.filter(c => c.name.toLowerCase().includes(q));
  renderConvList(filtered);
});

// ---- open conversation ----
const chatAvatar  = document.querySelector('.chat-header .chat-avatar');
const chatName    = document.querySelector('.chat-header .chat-name');
const messagesDiv = document.getElementById('messages');
let activeConvId  = null;

convList.addEventListener('click', e => {
  const item = e.target.closest('.conv-item');
  if (!item) return;
  openConversation(+item.dataset.id);
});

function openConversation(id) {
  activeConvId = id;
  const conv = fakeConvs.find(c => c.id === id);
  chatAvatar.src = conv.avatar;
  chatName.textContent = conv.name;

  // mark active
  document.querySelectorAll('.conv-item').forEach(li => {
    li.classList.toggle('active', +li.dataset.id === id);
  });

  // render messages
  messagesDiv.innerHTML = '';
  (fakeMessages[id] || []).forEach(msg => addBubble(msg));

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

// ---- send message ----
const composeForm = document.getElementById('composeForm');
const msgInput    = document.getElementById('msgInput');

composeForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!activeConvId) return;
  const text = msgInput.value.trim();
  if (!text) return;

  const msg = { sender: 'you', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  addBubble(msg);
  msgInput.value = '';
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // optional: append to fake storage so it persists while page is open
  fakeMessages[activeConvId].push(msg);
});

// ---- open first conv by default ----
openConversation(fakeConvs[0].id);
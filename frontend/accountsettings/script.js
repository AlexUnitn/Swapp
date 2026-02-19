const form = document.getElementById('accountForm');
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

const fullNameText = document.getElementById('fullNameText');
const usernameText = document.getElementById('usernameText');
const emailText = document.getElementById('emailText');
const bioText = document.getElementById('bioText');

const fullNameInput = form.elements['fullName'];
const usernameInput = form.elements['username'];
const emailInput = form.elements['email'];
const bioInput = form.elements['bio'];

let original = {};
let currentUserId = null;
let currentToken = null;

/* ---------- avatar preview ---------- */
avatarInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    avatarPreview.src = URL.createObjectURL(file);
  }
});

initializeAccountSettings();

/* ---------- toggle edit / view ---------- */
editBtn.addEventListener('click', () => {
  original = serializeForm(form);          // snapshot
  form.classList.add('edit-mode');
  toggleButtons(false);
});

cancelBtn.addEventListener('click', () => {
  form.classList.remove('edit-mode');
  toggleButtons(true);
  restoreForm(original);
});

/* ---------- save ---------- */
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.checkValidity()) return form.reportValidity();

  const fullName = fullNameInput.value.trim();
  const { firstName, lastName } = splitFullName(fullName);
  if (!firstName || !lastName) {
    alert('Inserisci nome e cognome.');
    return;
  }

  const payload = {
    firstName,
    lastName,
    username: usernameInput.value.trim(),
    email: emailInput.value.trim()
  };

  // disable while saving
  [saveBtn, cancelBtn].forEach(b => b.disabled = true);
  saveBtn.textContent = 'Saving…';

  try {
    const res = await fetch(`/api/users/${currentUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Save failed');
    // success
    form.classList.remove('edit-mode');
    toggleButtons(true);
    applyUserToView({ ...payload });
    persistUser(payload);
    alert('Saved ✔');
  } catch (err) {
    alert(err.message);
  } finally {
    [saveBtn, cancelBtn].forEach(b => b.disabled = false);
    saveBtn.textContent = 'Save';
  }
});

/* ---------- helpers ---------- */
function toggleButtons(viewMode) {
  editBtn.classList.toggle('hidden', !viewMode);
  saveBtn.classList.toggle('hidden', viewMode);
  cancelBtn.classList.toggle('hidden', viewMode);
}

function serializeForm(formEl) {
  const data = {};
  new FormData(formEl).forEach((v, k) => data[k] = v);
  return data;
}

function restoreForm(data) {
  Object.keys(data).forEach(k => {
    const el = form.elements[k];
    if (el) el.value = data[k];
  });
}

async function initializeAccountSettings() {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const storedUserObj = storedUser ? JSON.parse(storedUser) : null;
  const userId = localStorage.getItem('userId') || storedUserObj?.id || storedUserObj?._id || null;

  if (!token || !userId) {
    location.href = '../login/login.html';
    return;
  }

  currentToken = token;
  currentUserId = userId;

  try {
    const res = await fetch(`/api/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Impossibile caricare i dati utente');
    const user = await res.json();
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    fullNameInput.value = fullName;
    usernameInput.value = user.username || '';
    emailInput.value = user.email || '';
    bioInput.value = '';
    applyUserToView({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    alert(err.message);
  }
}

function applyUserToView(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  fullNameText.textContent = fullName || '';
  usernameText.textContent = user.username || '';
  emailText.textContent = user.email || '';
  bioText.textContent = '';
}

function persistUser(user) {
  const storedUser = localStorage.getItem('user');
  const storedUserObj = storedUser ? JSON.parse(storedUser) : {};
  const merged = { ...storedUserObj, ...user };
  localStorage.setItem('user', JSON.stringify(merged));
}

function splitFullName(fullName) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || '';
  const lastName = parts.join(' ');
  return { firstName, lastName };
}

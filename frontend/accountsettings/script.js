const form           = document.getElementById('accountForm');
const avatarInput    = document.getElementById('avatarInput');
const avatarPreview  = document.getElementById('avatarPreview');
const editBtn        = document.getElementById('editBtn');
const saveBtn        = document.getElementById('saveBtn');
const cancelBtn      = document.getElementById('cancelBtn');

let original = {};   // snapshot for cancel

/* ---------- avatar preview ---------- */
avatarInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    avatarPreview.src = URL.createObjectURL(file);
  }
});

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

  const payload = new FormData(form);
  //per json quello sotto
  //const payload = Object.fromEntries(new FormData(form));
  if (avatarInput.files[0]) payload.set('avatar', avatarInput.files[0]);

  // disable while saving
  [saveBtn, cancelBtn].forEach(b => b.disabled = true);
  saveBtn.textContent = 'Saving…';

  try {
    const res = await fetch('/api/account', { method: 'POST', body: payload });
    if (!res.ok) throw new Error('Save failed');
    // success
    form.classList.remove('edit-mode');
    toggleButtons(true);
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
    const el = formEl.elements[k];
    if (el) el.value = data[k];
  });
}
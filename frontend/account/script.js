document.addEventListener('DOMContentLoaded', () => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  /*if (!loggedIn) {
    location.href = '../login/login.html';
    return;
  }*/

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('sessionToken');
      
      location.href = '../login/login.html';
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Rimuovi i dati di sessione
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // 2. Reindirizza al login
            window.location.href = '../login/login.html';
        });
    }
});
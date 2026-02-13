document.addEventListener("DOMContentLoaded", () => {
	const searchInput = document.querySelector(".search-bar input");
	const searchIcon = document.querySelector(".search-icon");
	const arrow = document.querySelector(".arrow");
	const dropdown = document.getElementById("categoryDropdown");
	const filterPill = document.getElementById('filterPill');
	const filterText = filterPill.querySelector('.filter-text');
	const filterX = filterPill.querySelector('.filter-remove');
	const userIconLink = document.getElementById('userIconLink');

	let activeCategory = '';

	/* ---------- helpers ---------- */
	function showPill(text) {
		activeCategory = text;
		filterText.textContent = text;
		filterPill.classList.remove('hidden');
	}

	function hidePill() {
		activeCategory = '';
		filterPill.classList.add('hidden');
	}

	async function goToResults() {
		const query = searchInput.value.trim();
		const category = activeCategory;          // stringa vuota se nessuna pill

		if (!query && !category) return;          // niente da cercare

		const params = new URLSearchParams();
		if (query)
			params.set('q', query);
		if (category)
			params.set('cat', category);

		window.location.href = `/search/search.html?${params.toString()}`;

		
	}

	/* ---------- search ---------- */
	searchIcon.addEventListener("click", goToResults);
	searchInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter")
			goToResults();
	});

	//account page

	userIconLink.addEventListener('click', e => {
    e.preventDefault(); // stop the instant jump
    // Verifica se esiste un token di autenticazione
    const isLoggedIn = !!localStorage.getItem('token');
    
    location.href = isLoggedIn
    	? '../account/account.html'
    	: '../login/login.html';
  });

	/* ---------- dropdown ---------- */
	arrow.addEventListener("click", () => {
		dropdown.classList.toggle("show");
	});

	dropdown.addEventListener("click", (e) => {
		if (!e.target.classList.contains("dropdown-item"))
			return;
		searchInput.value = '';
		showPill(e.target.dataset.value);
		dropdown.classList.remove("show");
	});

	document.addEventListener("click", (e) => {
		if (!e.target.closest(".search-bar"))
			dropdown.classList.remove("show");
	});

	/* ---------- pill ---------- */
	filterX.addEventListener("click", () => {
		hidePill();
		searchInput.focus();
	});
});
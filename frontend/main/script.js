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

		try {
			/*const res = await fetch(`http://localhost:3000/api/search?${params}`);
			if (!res.ok)
				throw new Error('Network error');
			const data = await res.json();
			const payload = encodeURIComponent(btoa(JSON.stringify(data)));*/
			window.location.href = `../search/search.html`;
			//temporary
			window.location.href = `../search/search.html?data=${payload}`;

		} catch (err) {
			console.error(err);
			alert('Impossibile contattare il server');
		}
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
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
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
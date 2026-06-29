import Cat from '../Cat.js';

// ────── Initialise Cat ──────
async function initialiseGame() {
	// Check if there's a saved state in the Chrome storage
	const { cat } = await chrome.storage.local.get("cat");

	// Create a new cat if it doesn't exit
	if (!cat) {
		// Navigate to the create page
		window.location.href = "create.html";
		return;
	}

	// Rebuilt the Cat object
	const catInstance = Object.assign(new Cat(), cat);
	document.getElementById("cat-name").textContent = catInstance.getName();
	document.getElementById("cat-status").textContent = catInstance.getStatus();

	// Add event listener to fish icon
	document.getElementById("feed-button").addEventListener("click", () => {
		window.location.href = "feed.html";
	});
}

initialiseGame();

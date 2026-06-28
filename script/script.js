// ────── Initialise Cat ──────
async function initialiseGame() {
	// Check if there's a saved state in the Chrome storage
	const { cat } = await chrome.storage.local.get("cat");

	// Create a new cat if it doesn't exit
	if (!cat) {
		// Navigate to the create page
		window.location.href = 'create.html';
	}
}

initialiseGame();

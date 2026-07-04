import Cat from "../Cat.js";

let catInstance;

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
	catInstance = Object.assign(new Cat(), cat);
	document.getElementById("cat-name").textContent = catInstance.getName();
	document.getElementById("cat-status").textContent = catInstance.getStatus();

	// Initialise all the navigation HTML
	const mainNav = `
		<div class="icon-container">
			<img id="feed-button" src="../assets/icons/fish.png" />
		</div>
		<div class="icon-container">
			<img id="groom-button" src="../assets/icons/brush.png" />
		</div>
	`;

	const feedNav = `
		<div class="icon-container">
			<img id="fish-button" src="../assets/icons/fish.png" />
		</div>
		<div class="icon-container">
			<img id="canned-button" src="../assets/icons/canned-food.png" />
		</div>
		<div class="icon-container">
			<img id="treat-button" src="../assets/icons/treat.png" />
		</div>
		<div class="icon-container">
			<img id="back-button" src="../assets/icons/back.png" />
		</div>
	`;
	
	// Setup functions for initialising each button
	function bindMainNav() {
		document.getElementById("top-nav").innerHTML = mainNav;
		document.getElementById("feed-button").addEventListener("click", () => {
			bindFeedNav();
		});
		document.getElementById("groom-button").addEventListener("click", () => {
			window.location.href = "groom.html";
		});
	}

	function bindFeedNav() {
		document.getElementById("top-nav").innerHTML = feedNav;
		document.getElementById("back-button").addEventListener("click", () => {
			bindMainNav();
		});
		document.getElementById("fish-button").addEventListener("click", () => {
			catInstance.feed(60);
			bindMainNav();
		});
		document.getElementById("canned-button").addEventListener("click", () => {
			catInstance.feed(40);
			bindMainNav();
		});
		document.getElementById("treat-button").addEventListener("click", () => {
			catInstance.feed(20);
			bindMainNav();
		});
	}

	bindMainNav();
}

initialiseGame();

//Update the cat's stats every 5 minutes
setInterval(() => {
	catInstance.updateStats();
}, 1000 * 60 * 5);

//Saves the state when popup is closed
window.addEventListener("unload", () => {
	chrome.storage.local.set({ cat: catInstance });
});
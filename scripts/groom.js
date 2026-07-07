import Cat from "../Cat.js";

const HOLES = 9;
const grid = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const subtitleElement = document.getElementById("subtitle");
const feedbackElement = document.getElementById("feedback");

let catInstance;
let score = 0;
let activeHole = null;
let catTimer;
let playing = false;

const TIERS = [
	{ pts: 0, prob: 0.5 },
	{ pts: 5, prob: 0.25 },
	{ pts: 10, prob: 0.13 },
	{ pts: 15, prob: 0.08 },
	{ pts: 20, prob: 0.04 },
];

// Create the hole grid
for (let i = 0; i < HOLES; i++) {
	const hole = document.createElement("div");
	hole.className = "hole";
	hole.dataset.index = i;
	hole.addEventListener("click", () => catchCat(i));
	grid.appendChild(hole);
}

/**
 * Randomly selects points given based on probability
 * @returns points
 */
function roll() {
	const r = Math.random();
	let cum = 0;
	for (const t of TIERS) {
		cum += t.prob;
		if (r < cum) return t;
	}
	return TIERS[0];
}

/**
 * Show the cat on the one of the grids
 */
function showCat() {
	if (activeHole !== null) hideCat(activeHole);
	activeHole = Math.floor(Math.random() * HOLES);
	grid.children[activeHole].classList.add("active");

	// Add an image of the cat on the active hole
	const img = document.createElement("img");
	img.src = "../assets/body/full-body.PNG";
	img.style.cssText = "width:80%;height:80%;object-fit:contain;";
	grid.children[activeHole].appendChild(img);

	const delay = Math.max(750, 1400 - score * 30); // gets faster as score rises
	catTimer = setTimeout(() => {
		hideCat(activeHole);
		if (playing) showCat();
	}, delay);
}

/**
 * Hide the cat from the given index in the grid
 * @param {number} index of the grid
 */
function hideCat(i) {
	grid.children[i].classList.remove("active");
	grid.children[i].innerHTML = "";
	if (activeHole === i) activeHole = null;
}

/**
 * Attempts to catch the cat in the given index
 * @param {number} index of the grid
 */
function catchCat(i) {
	if (!playing || i !== activeHole) return;
	const tier = roll();
	feedbackElement.textContent = `+${tier.pts}`;

	score = Math.min(100, score + tier.pts);
	scoreElement.textContent = score;
	clearTimeout(catTimer);
	hideCat(i);

	// Check if the cat is max cleanliness
	if (score >= 100) {
		hideCat(i);
		feedback.textContent = `${catInstance.getName()} is clean!`;
		return;
	} else {
		showCat();
	}
}

/**
 * Starts the game
 */
async function startGame() {
	// Grab the cat instance
	const { cat } = await chrome.storage.local.get("cat");
	catInstance = Object.assign(new Cat(), cat);

	score = 0;
	scoreElement.textContent = score;

	// If cat already max cleanliness, end game
	if (score >= 100) {
		endGame();
		subtitleElement.textContent = `${catInstance.getName()} is already clean!`;
		return;
	}

	playing = true;
	showCat();
}

/**
 * Ends the game and display results
 */
function endGame() {
	playing = false;
	clearTimeout(catTimer);
	if (activeHole !== null) hideCat(activeHole);

	// Save the cat state
	chrome.storage.local.set({ cat: {...catInstance } });
}

startGame();

document.getElementById("back-button").addEventListener("click", () => {
	endGame();
	window.location.href = "home.html";
});

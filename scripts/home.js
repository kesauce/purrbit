import Cat from "../Cat.js";

let catInstance;
let isPetting = false;
let inactivityTimer;
let excitedUntil;

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
		<div class="icon-container">
			<img id="play-button" src="../assets/icons/mouse.png" />
		</div>
		<div class="icon-container">
			<img id="settings-button" src="../assets/icons/settings.png" />
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
			saveState();
			bindFeedNav();
		});
		document.getElementById("groom-button").addEventListener("click", () => {
			saveState();
			window.location.href = "groom.html";
		});
		document.getElementById("settings-button").addEventListener("click", () => {
			saveState();
			window.location.href = "settings.html";
		});
		document.getElementById("play-button").addEventListener("click", () => {
			saveState();
			window.location.href = "play.html";
		});
	}

	// Sets up the food and their actions
	// If the cat is full, it will not be fed and is instead annoyed
	function bindFeedNav() {
		document.getElementById("top-nav").innerHTML = feedNav;
		document.getElementById("back-button").addEventListener("click", () => {
			bindMainNav();
		});
		document.getElementById("fish-button").addEventListener("click", () => {
			const catName = document.getElementById("cat-name");
			const original = catName.textContent;

			if (catInstance.getHunger() >= 90) {
				catName.textContent = "They're full!";
				setTimeout(() => {
					catName.textContent = original;
				}, 2000);

				setMood("full");
				bindMainNav();
				return;
			}

			catName.textContent = "+60";
			setTimeout(() => {
				catName.textContent = original;
			}, 2000);

			catInstance.feed(60);
			excitedUntil = Date.now() + 5000;
			setMood("feed");
			saveState();
			bindMainNav();
		});
		document.getElementById("canned-button").addEventListener("click", () => {
			const catName = document.getElementById("cat-name");
			const original = catName.textContent;

			if (catInstance.getHunger() >= 90) {
				catName.textContent = "They're full!";
				setTimeout(() => {
					catName.textContent = original;
				}, 2000);

				setMood("full");
				bindMainNav();
				return;
			}

			catName.textContent = "+40";
			setTimeout(() => {
				catName.textContent = original;
			}, 2000);

			catInstance.feed(40);
			excitedUntil = Date.now() + 5000;
			setMood("feed");
			saveState();
			bindMainNav();
		});
		document.getElementById("treat-button").addEventListener("click", () => {
			const catName = document.getElementById("cat-name");
			const original = catName.textContent;

			if (catInstance.getHunger() >= 90) {
				catName.textContent = "They're full!";
				setTimeout(() => {
					catName.textContent = original;
				}, 2000);

				setMood("full");
				bindMainNav();
				return;
			}

			catName.textContent = "+20";
			setTimeout(() => {
				catName.textContent = original;
			}, 2000);

			catInstance.feed(20);
			excitedUntil = Date.now() + 5000;
			setMood("feed");
			saveState();
			bindMainNav();
		});
	}

	bindMainNav();
	//Set initial mood
	setMood();
	resetInactivity();
}

// ────── Mood ──────
/**
 * Sets the mood based on specific actions and stats.
 * Energy is the most important, so once it hits the threshold, the cat will go to sleep.
 * Then mood is determined based on action with specific constraints, then status, then actions in general.
 * The second conditions check the mood that was set initially and applies the correct animation.
 * @param {string} action
 */
function setMood(action = null) {
	let mood;
	const hunger = catInstance.getHunger();
	const happiness = catInstance.getHappiness();
	const energy = catInstance.getEnergy();
	const cleanliness = catInstance.getCleanliness();

	if (energy <= 10) {
		mood = "tired-sleep";
	} else if (action === "full") {
		mood = "idle-to-annoyed";
	} else if (hunger >= 80 && happiness >= 80 && energy >= 80 && cleanliness >= 80) {
		mood = "happy";
	} else if (action === "pet") {
		mood = hunger <= 20 ? "idle-to-annoyed" : "happy";
	} else if (action === "play") {
		mood = hunger <= 20 ? "idle-to-annoyed" : "idle-to-excited";
	} else if (action === "groom") {
		mood = hunger <= 20 ? "idle-to-annoyed" : "happy";
	} else if (action === "feed") {
		mood = hunger <= 20 ? "idle-to-excited" : "eating";
	} else if (catInstance.hunger <= 20 && catInstance.happiness <= 20) {
		mood = "idle-to-angry";
	} else if (hunger <= 20) {
		mood = "hungry";
	} else if (happiness <= 20) {
		mood = "bored";
	} else if (action === "inactive") {
		mood = "inactive-sleep";
	} else {
		mood = "idle";
	}

	if (mood === "tired-sleep") {
		catInstance.setStatus("Asleep");
		setEmote("sleep");
		playMoodSequence("yawn", "idle-to-sleep", "sleep-to-idle", () => energy >= 80);
		catInstance.rest();
	} else if (mood === "inactive-sleep") {
		catInstance.setStatus("Resting");
		setEmote("sleep");
		document.querySelector(".cat-eyes").className = `cat-eyes idle-to-sleep`;
		document.querySelector(".cat-tail").className = `cat-tail idle-to-sleep`;
		catInstance.rest();
	} else if (mood === "idle-to-angry") {
		catInstance.setStatus("Angry");
		setEmote("angry");
		playMoodSequence(
			"idle-to-annoyed",
			"annoyed",
			"annoyed-to-idle",
			() => hunger >= 60 && hunger >= 60,
		);
	} else if (mood === "idle-to-excited") {
		catInstance.setStatus("Excited");
		setEmote("surprised");
		playMoodSequence(
			"idle-to-excited",
			null,
			"excited-to-idle",
			() => Date.now() > excitedUntil,
		);
	} else if (mood === "idle-to-annoyed") {
		catInstance.setStatus("Annoyed");
		setEmote("none");
		let exitCondition;

		if (action === "full") {
			const annoyedUntil = Date.now() + 8000; //Annoyed for 4 seconds
			exitCondition = () => Date.now() > annoyedUntil;
		} else {
			exitCondition = () => !isPetting;
		}

		playMoodSequence("idle-to-annoyed", "annoyed", "annoyed-to-idle", exitCondition);
	} else {
		//Simple moods that map to a status and emote
		const emoteMap = {
			hungry: { status: "Hungry", emote: "confused" },
			bored: { status: "Bored", emote: "bored" },
			happy: { status: "Happy", emote: "happy" },
			idle: { status: "Idle", emote: "none" },
			eating: { status: "Eating", emote: "none" },
		};

		const { status, emote } = emoteMap[mood] ?? {
			status: mood,
			emote: "none",
		};
		catInstance.setStatus(status);
		setEmote(emote);
		document.querySelector(".cat-eyes").className = `cat-eyes ${mood}`;
		document.querySelector(".cat-tail").className = `cat-tail ${mood}`;
	}
	updateUI();
}

/**
 * Sets an emote that accompanies the cat if needed.
 * @param {string} emote
 */
function setEmote(emote) {
	document.querySelector(".cat-emote").className = `cat-emote ${emote}`;
}

/**
 * Helper function that plays a sequence for animations that need to be chained.
 * It starts with the first transition, and stays on the hold transition if given,
 * otherwise the end of the first transition is treated as the "hold".
 * Once the exit condition is fulfilled, it plays the return transition given.
 * @param {string} transition
 * @param {string} hold
 * @param {string} returnTransition
 * @param {boolean} exitCondition
 */
function playMoodSequence(transition, hold = null, returnTransition, exitCondition = () => true) {
	document.querySelector(".cat-eyes").className = `cat-eyes ${transition}`;
	document.querySelector(".cat-tail").className = `cat-tail ${transition}`;

	setTimeout(() => {
		if (hold) {
			document.querySelector(".cat-eyes").className = `cat-eyes ${hold}`;
			document.querySelector(".cat-tail").className = `cat-tail ${hold}`;
		}

		const holdInterval = setInterval(() => {
			if (exitCondition()) {
				clearInterval(holdInterval);
				document.querySelector(".cat-eyes").className = `cat-eyes ${returnTransition}`;
				document.querySelector(".cat-tail").className = `cat-tail ${returnTransition}`;
				setTimeout(() => setMood(), 800);
			}
		}, 500);
	}, 800);
}

// ────── Petting ──────
const catHead = document.getElementById("cat-head");
let petTimer;
let petHappinessInterval;

/**
 * A listener that checks if the cursor entered the head area.
 * If the cat is sleeping, it will not trigger.
 * If the cursor has been on the area for 2 seconds, it will
 * trigger the petting animation and increase happiness every 5 seconds.
 */
catHead.addEventListener("mouseenter", () => {
	if (catInstance.getStatus() === "Asleep" || catInstance.getStatus() === "Resting") return;

	petTimer = setTimeout(() => {
		isPetting = true;
		setMood("pet");

		//Increase happiness while being petted
		petHappinessInterval = setInterval(() => {
			catInstance.pet();
			saveState();
		}, 5000);
	}, 2000);
});

/**
 * A listener that checks if the cursor leaves the head area.
 * It clears the timer and interval, and resets the mood.
 */
catHead.addEventListener("mouseleave", () => {
	if (catInstance.getStatus() === "Asleep" || catInstance.getStatus() === "Resting") return;
	clearTimeout(petTimer);
	clearInterval(petHappinessInterval);
	isPetting = false;
	setMood();
	saveState();
});

// ────── Update UI ──────
/**
 * Updates the cat status displayed on the page.
 */
function updateUI() {
	document.getElementById("cat-status").textContent = catInstance.getStatus();
}

// ────── Inactivity ──────
/**
 * Resets inactivity whenever the cursor moves.
 * It clears the timeout, and if the cat is currently
 * resting due to inactivity, it is woken up.
 * If the user is inactive for 3 minutes, the cat returns
 * into an inactive state.
 */
function resetInactivity() {
	clearTimeout(inactivityTimer);

	if (catInstance.getStatus() === "Resting") {
		document.querySelector(".cat-eyes").className = `cat-eyes sleep-to-idle`;
		document.querySelector(".cat-tail").className = `cat-tail sleep-to-idle`;
		setEmote("none");
		setTimeout(() => setMood(), 800);
	}
	inactivityTimer = setTimeout(() => setMood("inactive"), 1000 * 60 * 3);
}

//Add listeners for mouse move and click event
document.addEventListener("mousemove", resetInactivity);
document.addEventListener("click", resetInactivity);

// ────── Stat Decay (5mins) ──────
/**
 * Updates the cat's stats every 5 minutes.
 * If the cat is asleep in any way or is being petted,
 * then the stat decay won't trigger.
 */
setInterval (
	() => {
		if (
			catInstance.getStatus() !== "Asleep" &&
			catInstance.getStatus() !== "Resting" &&
			!isPetting
		) {
			catInstance.updateStats();
			//Set mood depending on stats
			setMood();
			saveState();
		}
	}, 1000 * 60 * 5
);

// ────── Save State ──────
/**
 * Saves the cat's state after every event.
 */
function saveState() {
	chrome.storage.local.set({ cat: { ...catInstance } });
}

// ────── Start Game ──────
initialiseGame();

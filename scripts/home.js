import Cat from "../Cat.js";

let catInstance;
let isPetting = false;
let inactivityTimer;

// ────── Initialise Cat ──────
async function initialiseGame() {
	// window.location.href = "play.html";
	// Check if there's a saved state in the Chrome storage
	const { cat } = await chrome.storage.local.get("cat");

	//DEbugging
	chrome.storage.local.get("cat", (data) => console.log(data));

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
		document
			.getElementById("groom-button")
			.addEventListener("click", () => {
				saveState();
				window.location.href = "groom.html";
			});
		document
			.getElementById("settings-button")
			.addEventListener("click", () => {
				saveState();
				window.location.href = "settings.html";
			});
		//play button
	}

	function bindFeedNav() {
		document.getElementById("top-nav").innerHTML = feedNav;
		document.getElementById("back-button").addEventListener("click", () => {
			bindMainNav();
		});
		document.getElementById("fish-button").addEventListener("click", () => {
			catInstance.feed(60);
			setMood("feed");
			bindMainNav();
		});
		document
			.getElementById("canned-button")
			.addEventListener("click", () => {
				catInstance.feed(40);
				setMood("feed");
				bindMainNav();
			});
		document
			.getElementById("treat-button")
			.addEventListener("click", () => {
				catInstance.feed(20);
				setMood("feed");
				bindMainNav();
			});
	}

	bindMainNav();
	//Set initial mood
	setMood();
	resetInactivity();
}

// ────── Mood ──────
function setMood(action = null) {
	//DEBUGGIGN
	console.log("setMood called with action:", action);
	console.log(
		"Stats - Energy:",
		catInstance.getEnergy(),
		"Hunger:",
		catInstance.getHunger(),
		"Happiness:",
		catInstance.getHappiness(),
		"Status:",
		catInstance.getStatus(),
	);

	let mood;

	//Energy is most important of all, no matter the other stats if the cat is tired it will sleep
	//Rest of mood based on stats
	if (catInstance.getEnergy() <= 10) {
		mood = "tired-sleep";
	} else if (action === "pat") {
		mood = catInstance.getHunger() <= 20 ? "idle-to-annoyed" : "happy";
	} else if (action === "play") {
		mood =
			catInstance.getHunger() <= 20
				? "idle-to-annoyed"
				: "idle-to-excited";
	} else if (action === "groom") {
		mood = catInstance.getHunger() <= 20 ? "idle-to-annoyed" : "happy";
	} else if (
		catInstance.getHunger() <= 20 &&
		catInstance.getHappiness() <= 20
	) {
		mood = "idle-to-angry";
	} else if (catInstance.getHunger() <= 20) {
		mood = "hungry";
	} else if (catInstance.getHappiness() <= 20) {
		mood = "bored";
	} else if (action === "feed") {
		mood = "happy";
	} else if (action === "inactive") {
		mood = "inactive-sleep";
	} else {
		mood = "idle";
	}

	if (mood === "tired-sleep") {
		catInstance.setStatus("Asleep");
		setEmote("sleep");
		playMoodSequence(
			"yawn",
			"idle-to-sleep",
			"sleep-to-idle",
			() => catInstance.getEnergy() >= 80,
		);
		catInstance.rest();
	} else if (mood === "inactive-sleep") {
		console.log("Entering inactive sleep");
		catInstance.setStatus("Resting");
		setEmote("sleep");
		//No sequence needed as it just handles going to sleep
		document.querySelector(".cat-eyes").className =
			`cat-eyes idle-to-sleep`;
		document.querySelector(".cat-tail").className =
			`cat-tail idle-to-sleep`;
		catInstance.rest();
	} else if (mood === "idle-to-angry") {
		console.log("Entering angry sequence");
		catInstance.setStatus("Angry");
		setEmote("angry");
		playMoodSequence(
			"idle-to-annoyed",
			"annoyed",
			"annoyed-to-idle",
			() =>
				catInstance.getHunger() >= 60 &&
				catInstance.getHappiness() >= 60,
		);
	} else if (mood === "idle-to-excited") {
		console.log("Entering excited sequence");
		catInstance.setStatus("Excited");
		setEmote("surprised");
		playMoodSequence(
			"idle-to-excited",
			null,
			"excited-to-idle",
			() => Date.now() > excitedUntil,
		);
	} else if (mood === "idle-to-annoyed") {
		console.log("Entering annoyed sequence");
		catInstance.setStatus("Annoyed");
		playMoodSequence(
			"idle-to-annoyed",
			"annoyed",
			"annoyed-to-idle",
			() => !isPetting,
		);
	} else {
		//Simple moods that map to a status and emote
		const emoteMap = {
			hungry: { status: "Hungry", emote: "confused" },
			bored: { status: "Bored", emote: "bored" },
			happy: { status: "Happy", emote: "happy" },
			idle: { status: "Idle", emote: "none" },
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

function setEmote(emote) {
	document.querySelector(".cat-emote").className = `cat-emote ${emote}`;
}

//Helper function for moods that have a sequence
function playMoodSequence(
	transition,
	hold = null,
	returnTransition,
	exitCondition = () => true,
) {
	console.log(
		"playMoodSequence:",
		transition,
		"->",
		hold,
		"->",
		returnTransition,
	);

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
				document.querySelector(".cat-eyes").className =
					`cat-eyes ${returnTransition}`;
				document.querySelector(".cat-tail").className =
					`cat-tail ${returnTransition}`;
				setTimeout(() => setMood(), 800);
			}
		}, 500);
	}, 800);
}

// ────── Petting ──────
const catHead = document.getElementById("cat-head");
let petTimer;
let petHappinessInterval;

//Checks if cursor entered the petting area
catHead.addEventListener("mouseenter", () => {
	console.log("Mouse entered cat head, status:", catInstance.getStatus());
	if (
		catInstance.getStatus() === "Asleep" ||
		catInstance.getStatus() === "Resting"
	)
		return;
	petTimer = setTimeout(() => {
		isPetting = true;
		setMood("pat");

		//Increase happiness while being petted
		petHappinessInterval = setInterval(() => {
			catInstance.pet();
			saveState();
		}, 2000);
	}, 2000);
});

//Checks if cursor leaves the area
catHead.addEventListener("mouseleave", () => {
	console.log("Mouse left cat head");
	if (
		catInstance.getStatus() === "Asleep" ||
		catInstance.getStatus() === "Resting"
	)
		return;
	clearTimeout(petTimer);
	clearInterval(petHappinessInterval);
	isPetting = false;
	setMood();
	saveState();
});

// ────── Update UI ──────
function updateUI() {
	document.getElementById("cat-status").textContent = catInstance.getStatus();
}

// ────── Inactivity ──────
function resetInactivity() {
	clearTimeout(inactivityTimer);

	if (catInstance.getStatus() === "Resting") {
		document.querySelector(".cat-eyes").className =
			`cat-eyes sleep-to-idle`;
		document.querySelector(".cat-tail").className =
			`cat-tail sleep-to-idle`;
		setEmote("none");
		setTimeout(() => setMood(), 800);
	}
	inactivityTimer = setTimeout(() => setMood("inactive"), 1000 * 60 * 3);
}

//Add listeners for mouse move and click event
document.addEventListener("mousemove", resetInactivity);
document.addEventListener("click", resetInactivity);

// ────── Stat Decay (5mins) ──────
//Update the cat's stats every 5 minutes
setInterval(() => {
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
}, 6000);
// 1000 * 60 * 5

// ────── Save State ────── Use in every event
function saveState() {
	chrome.storage.local.set({ cat: { ...catInstance } });
}

// ────── Start Game ──────
initialiseGame();

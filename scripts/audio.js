// ────── Audio ──────
// Create an audio environment
const audioContext = new AudioContext();

// Fetches the audio file, converts it into raw bytes, then decodes it again for the browser
async function loadAudio(url) {
	const res = await fetch(url);
	const buf = await res.arrayBuffer();
	return await audioContext.decodeAudioData(buf);
}

let source;
const gainNode = audioContext.createGain();

// Plays the music within the audio context
async function startMusic() {
	// Set the music based on the screen
	let bgmPath = "../assets/bgm/bgm-marimba.wav";
	if (window.location.href.includes("create.html")) {
		bgmPath = "../assets/bgm/bgm-piano.wav";
	} else if (window.location.href.includes("groom.html")) {
		bgmPath = "../assets/bgm/bgm-strings.wav";
	} else if (window.location.href.includes("settings.html")) {
		bgmPath = "../assets/bgm/bgm-wind.wav";
	} else if (window.location.href.includes("play.html")) {
		bgmPath = "../assets/bgm/bgm-synth.wav";
	}

	const url = chrome.runtime.getURL(bgmPath);
	const buffer = await loadAudio(url);

	// Creates a player for the buffered audio
	source = audioContext.createBufferSource();
	source.buffer = buffer;
	source.loop = true;

	// Connect volume
	source.connect(gainNode);
	gainNode.connect(audioContext.destination);

	// Check if there's user preference for volume
	const { volume } = await chrome.storage.local.get("volume");
	gainNode.gain.value = volume ?? 1;

	source.start(0);
}

startMusic();

// Only get volume control if at settings page
if (window.location.href.includes("settings.html")) {
	document.getElementById("volume").addEventListener("input", async (e) => {
		gainNode.gain.value = e.target.value;

		// Set volume preference
		await chrome.storage.local.set({ volume: e.target.value });
	});
}

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

// Plays the music within the audio context
async function startMusic() {
	const url = chrome.runtime.getURL("../assets/bgm.wav");
	const buffer = await loadAudio(url);

	// Creates a player for the buffered audio
	source = audioContext.createBufferSource();
	source.buffer = buffer;
	source.loop = true;
	source.connect(audioContext.destination);
	source.start(0);
}

startMusic();
import Cat from "../Cat.js";

// Preselect the settings
async function loadSettings() {
	const { display } = await chrome.storage.local.get("display");
	const { cat } = await chrome.storage.local.get("cat");

	const value = display || "popup";
	document.querySelector(`input[value="${value}"]`).checked = true;

	const catInstance = Object.assign(new Cat(), cat);
	document.getElementById("cat-name").value = catInstance.getName() ?? "";
}

loadSettings();

// Add back button event listener]
document.getElementById("back-button").addEventListener("click", () => {
	window.location.href = "home.html";
});

// Add event listeners to the radio buttons
document.getElementById("popup").addEventListener("change", () => {
	chrome.runtime.sendMessage({ action: "setDisplay", display: "popup" });
	chrome.storage.local.set({ display: "popup" });
});

document.getElementById("side-panel").addEventListener("change", () => {
	chrome.runtime.sendMessage({ action: "setDisplay", display: "side-panel" });
	chrome.storage.local.set({ display: "side-panel" });
});

// Add event listener to name change button
document.getElementById("name-change").addEventListener("click", async () => {
	const { cat } = await chrome.storage.local.get("cat");
	cat.name = document.getElementById("cat-name").value;
	await chrome.storage.local.set({ cat });
});

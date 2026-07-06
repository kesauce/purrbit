// Preselect the display preference
async function loadSettings() {
  const { display } = await chrome.storage.local.get("display");
  const value = display || "popup";
  document.querySelector(`input[value="${value}"]`).checked = true;
}

loadSettings();
// Add event listeners to the radio
document.getElementById("popup").addEventListener("change", () => {
  chrome.runtime.sendMessage({ action: "setDisplay", display: "popup" });
	chrome.storage.local.set({ display: "popup" });
});

document.getElementById("side-panel").addEventListener("change", () => {
  chrome.runtime.sendMessage({ action: "setDisplay", display: "side-panel" });
	chrome.storage.local.set({ display: "side-panel" });
});

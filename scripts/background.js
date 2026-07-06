// Changes the display of the game
async function applyDisplay(display) {
  if (display === "side-panel") {
    await chrome.action.setPopup({ popup: "" });
    await chrome.sidePanel.setOptions({ enabled: true, path: "pages/home.html" });
  } else {
    await chrome.sidePanel.setOptions({ enabled: false });
    await chrome.action.setPopup({ popup: "pages/home.html" });
  }
}

// Listens for a new display change
chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action !== "setDisplay") { return; }
  applyDisplay(msg.display);
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Use the user's display preference
chrome.runtime.onInstalled.addListener(async () => {
  const { display } = await chrome.storage.local.get("display");
  applyDisplay(display);
});
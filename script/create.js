import Cat from '../Cat.js';

document.getElementById("name-form").addEventListener("submit", async (e) => {
	// Prevents refreshing
	e.preventDefault();

	// Initialise a cat and pass the name
    const name = document.getElementById("name").value;
    const cat = new Cat(name);
    await chrome.storage.local.set({ cat: cat });

	// Navigate back to home
	window.location.href = "home.html";
});

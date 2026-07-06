const GAME_TIME = 120; //2 minutes
const TIME_PER_WORD = 5;
const scoreElement = document.getElementById("score");
const subtitleElement = document.getElementById("subtitle");
const feedbackElement = document.getElementById("feedback");
const wordDisplay = document.getElementById("word-display");
const wordInput = document.getElementById("word-input");
const equationDisplay = document.getElementById("equation-display");
const mathInput = document.getElementById("math-input");
const gameTimerElement = document.getElementById("game-timer");
const timerElement = document.getElementById("timer");

let gameTimeLeft = GAME_TIME;
let gameTimer;
let timeLeft = TIME_PER_WORD;
let timer;
let catInstance;
let score = 0;
let currentWord = "";
let currentAnswer = 0;

//Timer for each word/equation that ticks down every second
function startTimer(onExpire) {
    clearInterval(timer);
    timeLeft = TIME_PER_WORD;
    timerElement.textContent = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            onExpire();
        }
    }, 1000);
}

//Timer for the whole game
function startGameTimer() {
    gameTimeLeft = GAME_TIME;

    gameTimer = setInterval(() => {
        gameTimeLeft--;
        //Calculate the mins and secs left
        const mins = Math.floor(gameTimeLeft / 60);
        const secs = gameTimeLeft % 60;
        gameTimerElement.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;

        if (gameTimeLeft <= 0) {
            clearInterval(gameTimer);
            clearInterval(timer);
            subtitleElement.textContent = `Time's up! Score: ${score}`;
            endGame();
        }
    }, 1000);
}

//Typing game
const words = ["fish", "purr", "treat", "meow", "play", "bird", "paw", "yarn", "mice"];

function startTypingGame() {
    document.getElementById("typing-game").style.display = "block";
    document.getElementById("math-game").style.display = "none";
    subtitleElement.textContent = "Type the word!";
    showWord();
}

function showWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    wordDisplay.textContent = currentWord;
    wordInput.value = "";
    wordInput.focus();
    startTimer(() => {
        feedbackElement.textContent = "too slow!";
        showWord();
    });
}

wordInput.addEventListener("input", (e) => {
    if (e.target.value === currentWord) {
        score += 10;
        scoreElement.textContent = score;
        catInstance.play();
        feedbackElement.textContent = "+10";
        showWord();
    }
});

//Math game
function startMathGame() {
    document.getElementById("typing-game").style.display = "none";
    document.getElementById("math-game").style.display = "block";
    subtitleElement.textContent = "Solve the equation!";
    showEquation();
}

function showEquation() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;

    currentAnswer = a + b;
    equationDisplay.textContent = `${a} + ${b} = ?`;
    mathInput.value = "";
    mathInput.focus();
    startTimer(() => {
        feedbackElement.textContent = "too slow!";
        showEquation();
    });
}

mathInput.addEventListener("input", (e) => {
    if (parseInt(e.target.value) === currentAnswer) {
        score += 10;
        scoreElement.textContent = score;
        catInstance.play();
        feedbackElement.textContent = "+10";
        showEquation();
    }
});

//Start game
async function startGame() {
    const { cat } = await chrome.storage.local.get("cat");
    catInstance = Object.assign(new Cat(), cat);

    score = 0;
    scoreElement.textContent = score;
    startGameTimer();

    const game = Math.random() < 0.5 ? "typing" : "math";
    if (game === "typing") {
        startTypingGame();
    } else {
        startMathGame();
    }
}

//Clears the timers, saves the state of the cat and returns home automatically
function endGame() {
    clearInterval(gameTimer);
    clearInterval(timer);
    chrome.storage.local.set({ cat: { ...catInstance } });
    setTimeout(() => window.location.href = "home.html", 2000);
}

startGame();

document.getElementById("back-button").addEventListener("click", () => {
	endGame();
});

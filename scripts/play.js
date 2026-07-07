import Cat from "../Cat.js";

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

/**
 * Starts a timer for the current word/equation and calls onExpire when
 * the timer runs out.
 * @param {Function} onExpire 
 */
function startTimer(onExpire) {
    clearInterval(timer);
    timeLeft = TIME_PER_WORD;
    timerElement.textContent = `Time: ${timeLeft}`;

    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            onExpire();
        }
    }, 1000);
}

/**
 * Starts a timer for the whole game (set to 2 minutes).
 * When the timer is up, it shows the user's final score.
 */
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

// ────── Typing Game ──────
const words = ["fish", "purr", "treat", "meow", "play", "bird", "paw", "yarn", "mice"];

/**
 * Starts the typing game.
 */
function startTypingGame() {
    document.getElementById("typing-game").style.display = "block";
    document.getElementById("math-game").style.display = "none";
    subtitleElement.textContent = "Type the word!";
    showWord();
}

/**
 * Shows a word chosen from the array of words.
 * It also starts a timer that shows the next word if
 * it runs out.
 */
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

/**
 * A listener that checks if the text inputted by the user
 * matches the text shown. When it matches, the cat's happiness
 * is increased. There's no penalty for the wrong spelling.
 */
wordInput.addEventListener("input", (e) => {
    if (e.target.value === currentWord) {
        score += 10;
        scoreElement.textContent = score;
        catInstance.play();
        feedbackElement.textContent = "+10";
        showWord();
    }
});

// ────── Math Game ──────
/**
 * Starts the math game.
 */
function startMathGame() {
    document.getElementById("typing-game").style.display = "none";
    document.getElementById("math-game").style.display = "block";
    subtitleElement.textContent = "Solve the equation!";
    showEquation();
}

/**
 * Shows an equation created randomly.
 * To make it easier, only addition is used.
 * It also starts a timer that shows the next
 * equation if it runs out.
 */
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

/**
 * A listener that checks if the answer inputted by the user
 * is correct. If correct, the cat's happiness
 * is increased. There's no penalty for the wrong answer as
 * it only triggers when the input is correct.
 */
mathInput.addEventListener("input", (e) => {
    if (parseInt(e.target.value) === currentAnswer) {
        score += 10;
        scoreElement.textContent = score;
        catInstance.play();
        feedbackElement.textContent = "+10";
        showEquation();
    }
});

// ────── Start Game ──────
async function startGame() {
    const { cat } = await chrome.storage.local.get("cat");
    catInstance = Object.assign(new Cat(), cat);

    score = 0;
    scoreElement.textContent = score;
    startGameTimer();

    //Randomly chooses a game
    const game = Math.random() < 0.5 ? "typing" : "math";
    if (game === "typing") {
        startTypingGame();
    } else {
        startMathGame();
    }
}
 /**
  * Clears the timers, saves the cat's state, and returns to the home page automatically.
  */
function endGame() {
    clearInterval(gameTimer);
    clearInterval(timer);
    subtitleElement.textContent = `Score: ${score}`;
    chrome.storage.local.set({ cat: { ...catInstance } });
    setTimeout(() => window.location.href = "home.html", 2000);
}

startGame();

document.getElementById("back-button").addEventListener("click", () => {
	endGame();
});

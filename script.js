const die1 = document.getElementById("die1");
const die2 = document.getElementById("die2");
const result = document.getElementById("result");
const totalText = document.getElementById("total");
const historyList = document.getElementById("history");

const rollOneButton = document.getElementById("rollOne");
const rollTwoButton = document.getElementById("rollTwo");
const soundToggle = document.getElementById("soundToggle");

let soundEnabled = true;
let rolling = false;
let audioContext = null;

const dicePatterns = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
};

// Display the correct dots on a die.
function showFace(die, number) {
    die.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const dot = document.createElement("span");

        if (dicePatterns[number].includes(i)) {
            dot.classList.add("pip");
        }

        die.appendChild(dot);
    }

    die.setAttribute("aria-label", "Dice showing " + number);
}

// Generate a random number from 1 to 6.
function randomDie() {
    return Math.floor(Math.random() * 6) + 1;
}

// Play a short rolling sound using the Web Audio API.
async function playDiceSound() {
    if (!soundEnabled) return;

    try {
        if (!audioContext) {
            const AudioClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioClass) return;

            audioContext = new AudioClass();
        }

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        if (!soundEnabled) return;

        const now = audioContext.currentTime;

        // Three short tones create a rolling effect.
        for (let i = 0; i < 3; i++) {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const start = now + i * 0.11;

            oscillator.type = "triangle";
            oscillator.frequency.setValueAtTime(
                650 - i * 130,
                start
            );

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(0.12, start + 0.015);
            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                start + 0.09
            );

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start(start);
            oscillator.stop(start + 0.1);
        }
    } catch (error) {
        console.error("Could not play dice sound:", error);
    }
}

// Add a roll to the history.
function updateHistory(numbers) {
    const entry = document.createElement("li");
    const total = numbers.reduce((sum, number) => sum + number, 0);

    entry.textContent = numbers.join(" + ") + " = " + total;

    // Remove the initial placeholder.
    if (
        historyList.children.length === 1 &&
        historyList.textContent.includes("Your rolls will appear here.")
    ) {
        historyList.innerHTML = "";
    }

    historyList.prepend(entry);

    // Keep only the last 10 rolls.
    while (historyList.children.length > 10) {
        historyList.lastElementChild.remove();
    }
}

// Roll one or two dice.
async function rollDice(numberOfDice) {
    if (rolling) return;

    rolling = true;

    rollOneButton.disabled = true;
    rollTwoButton.disabled = true;

    die2.classList.toggle("hidden", numberOfDice === 1);

    die1.classList.add("rolling");

    if (numberOfDice === 2) {
        die2.classList.add("rolling");
    }

    result.textContent = "Rolling...";
    totalText.textContent = "Total: ...";

    // Start sound from the user's button click.
    playDiceSound();

    const animation = setInterval(() => {
        showFace(die1, randomDie());

        if (numberOfDice === 2) {
            showFace(die2, randomDie());
        }
    }, 100);

    setTimeout(() => {
        clearInterval(animation);

        die1.classList.remove("rolling");
        die2.classList.remove("rolling");

        const numbers = [];

        for (let i = 0; i < numberOfDice; i++) {
            numbers.push(randomDie());
        }

        showFace(die1, numbers[0]);

        if (numberOfDice === 2) {
            showFace(die2, numbers[1]);
        }

        const total = numbers.reduce(
            (sum, number) => sum + number,
            0
        );

        result.textContent = "You rolled " + numbers.join(" and ");
        totalText.textContent = "Total: " + total;

        updateHistory(numbers);

        rolling = false;
        rollOneButton.disabled = false;
        rollTwoButton.disabled = false;
    }, 800);
}

// Button click events.
rollOneButton.addEventListener("click", () => {
    rollDice(1);
});

rollTwoButton.addEventListener("click", () => {
    rollDice(2);
});

// Turn sound on or off.
soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    soundToggle.textContent = soundEnabled
        ? "🔊 Sound: On"
        : "🔇 Sound: Off";
});

// Show the initial dice faces.
showFace(die1, 1);
showFace(die2, 1);
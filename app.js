let word; 
let word_arr;
let firstLetter;
let lastLetter;
let blanks;

const usedLetters = [];
const livesTotal = 5;
let livesLeft = livesTotal;
let gameOver = false;

const word_ui = document.querySelector('#word');
const livesTotal_ui = document.querySelector('#lives-total');
const livesLeft_ui = document.querySelector('#lives-left');
const restartButton_ui = document.querySelector('#restart');
const definition_ui = document.querySelector('#definition');

livesTotal_ui.textContent = livesTotal;
livesLeft_ui.textContent = livesTotal;

(function pickRandomWord() {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', 'https://random-word-api.herokuapp.com/word', true);

    xhr.onload = function() {
        if (this.status !== 200) return;

        // console.log(this.responseText);
        word = JSON.parse(this.responseText)[0];
        word_arr = word.split('');
        firstLetter = word[0];
        lastLetter = word[word.length - 1];
        blanks = word_arr.filter(letter => letter !== firstLetter && letter !== lastLetter).length;
        word_ui.innerHTML = '';
        
        for (let i = 0; i < word.length; i++) {
            let newLetter = document.createElement('h1');
            newLetter.textContent = word[i] === firstLetter || word[i] === lastLetter ? word[i] : '_';
            newLetter.setAttribute('id', `letter-${i}`);
            word_ui.appendChild(newLetter);
        }

        markLetterAsPressed(firstLetter);
        markLetterAsPressed(lastLetter);

        // console.log(word);
    }

    xhr.send();
})();

let keyDown = false;

document.body.addEventListener('keydown', (e) => {
    if (gameOver) return;
    if (!isLetter(e.keyCode) || isUsed(e.key.toLowerCase()) || keyDown) return;

    keyDown = true;
    toggleKey(e.key);
})

document.body.addEventListener('keyup', (e) => {
    if (gameOver) return;
    if (!isLetter(e.keyCode) || isUsed(e.key.toLowerCase())) return;

    keyDown = false; 
    checkKey(e.key);
    toggleKey(e.key);
    markLetterAsPressed(e.key);
})

document.body.addEventListener('click', (e) => {
    if (gameOver) return;
    if (!e.target.classList.contains('key') || isUsed(e.target.textContent)) return;

    let target = e.target;
    checkKey(target.textContent);
    toggleKey(target.textContent);
    markLetterAsPressed(target.textContent);
})

restartButton_ui.addEventListener('click', () => {
    location.reload();
})

function checkKey(letter) {
    letter = letter.toLowerCase();
    if (word_arr.includes(letter)) {
        word_arr.forEach((char, index) => {
            if (char === letter) {
                document.querySelector(`#letter-${index}`).textContent = letter;
                blanks--;
            }
        });

        if (blanks === 0) {
            gameOver = true;
            alert('You win, bro.');
            giveDefinition();
        }
    } else {
        losePoint();
    }
}

function toggleKey(letter) {
    letter = letter.toLowerCase();
    let key_ui = document.querySelector(`#key-${letter}`);
    key_ui.classList.toggle('pressed');
}

function markLetterAsPressed(letter) {
    letter = letter.toLowerCase();
    if (!isUsed(letter)) {
        usedLetters.push(letter);
        document.querySelector(`#key-${letter}`).classList.add('used');
    }
}

function losePoint() {
    livesLeft_ui.textContent = --livesLeft;
    document.body.style.backgroundColor = `var(--clr-bg-0${Math.max(livesLeft, 1)})`;

    if (livesLeft === 0) {
        gameOver = true;
        word_ui.innerHTML = `<h1>${word}</h1>`
        document.querySelector('#sad').style.display = 'inline';
        alert('You lose, loser.');
    };
}

function isLetter(keyCode) {
    return keyCode >= 65 && keyCode <= 90;
}

function isUsed(letter) {
    return usedLetters.includes(letter);
}

function giveDefinition() {
    const xhr = new XMLHttpRequest();
    try {
        xhr.open('GET', `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, true);
    } catch (err) {
        definition_ui.innerHTML += `<h4>Whoopsie, no definitions found for ${word}</h4>`;
    } 

    xhr.onload = function() {
        if (this.status !== 200) {
            definition_ui.innerHTML += `<h4>Whoopsie, no definitions found for ${word}... Maybe <a href="https://www.google.com/search?q=${word}+meaning">ask Google</a>?</h4>`;
            return;
        };

        const response = JSON.parse(this.responseText)[0];
        const word_local = response.word;
        const phonetic = response.phonetic;
        const meanings = response.meanings;
        const origin = response.origin;

        definition_ui.innerHTML += `<h2>${word_local} <span class="phonetic">[${phonetic}]</span></h2>`

        meanings.forEach((meaning) => {
            definition_ui.innerHTML += `<label class="part-of-speech">${meaning.partOfSpeech}</label>`;
            if (meaning.definitions.length === 1) {
                definition_ui.innerHTML += `<span class="meaning">• ${meaning.definitions[0].definition}</span>`;
            } else {
                meaning.definitions.forEach((definition, index) => {
                    definition_ui.innerHTML += `<span class="meaning">${index + 1}. ${definition.definition}</span>`;
                });
            }
        });

        if (origin) {
            definition_ui.innerHTML += `<label class="origin">Origin: <span>${origin}</span></h4>`;
        }

        // console.log(response);
    }

    xhr.send();
}

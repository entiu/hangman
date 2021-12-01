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
    
        for (let i = 0; i < word.length; i++) {
            let newLetter = document.createElement('h1');
            newLetter.textContent = word[i] === firstLetter || word[i] === lastLetter ? word[i] : '_';
            newLetter.setAttribute('id', `letter-${i}`);
            word_ui.appendChild(newLetter);
        }

        markLetterAsPressed(firstLetter);
        markLetterAsPressed(lastLetter);
    }

    xhr.send();
})();

let keyDown = false;

document.body.addEventListener('keydown', (e) => {
    if (!gameOver) {
        if (isLetter(e.keyCode) && !isUsed(e.key.toLowerCase())) {
            if (keyDown) return;
        
            keyDown = true;
            toggleKey(e.key);
        }
    }
})

document.body.addEventListener('keyup', (e) => {
    if (!gameOver) {
        if (isLetter(e.keyCode) && !isUsed(e.key.toLowerCase())) {
            keyDown = false; 
            checkKey(e.key);
            toggleKey(e.key);
            markLetterAsPressed(e.key);
        }
    }
})

document.body.addEventListener('click', (e) => {
    if (!gameOver) {
        let target = e.target;
    
        if (target.classList.contains('key') && !usedLetters.includes(target.textContent)) {
            checkKey(target.textContent);
            toggleKey(target.textContent);
            markLetterAsPressed(target.textContent);
        }
    }
})

restartButton_ui.addEventListener('click', () => {
    location.reload();
})

function checkKey(key) {
    key = key.toLowerCase();
    if (word_arr.includes(key)) {
        word_arr.forEach((letter, index) => {
            if (letter === key) {
                document.querySelector(`#letter-${index}`).textContent = letter;
                blanks--;
            }
        });

        if (blanks === 0) {
            gameOver = true;
            alert('You win, bro.');
        }
    } else {
        losePoint();
    }
}

function toggleKey(key) {
    key = key.toLowerCase();
    let key_ui = document.querySelector(`#key-${key}`);
    key_ui.classList.toggle('pressed');
}

function markLetterAsPressed(key) {
    key = key.toLowerCase();
    if (!isUsed(key)) {
        usedLetters.push(key);
        document.querySelector(`#key-${key}`).classList.add('used');
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

function isLetter(letter) {
    return letter >= 65 && letter <= 90;
}

function isUsed(letter) {
    return usedLetters.includes(letter);
}
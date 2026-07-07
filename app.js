// State Variables
let vocabulary = [];
let currentIndex = 0;
let isFlipped = false;

// Connect to HTML Elements
const card = document.getElementById('card');
const cardFront = document.getElementById('card-front');
const cardBack = document.getElementById('card-back');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const flipBtn = document.getElementById('flip-btn');

// 1. Fetch the Vocabulary Data
fetch('vocabulary.json')
    .then(response => response.json())
    .then(data => {
        // Combine nouns and phrases into one main array
        vocabulary = [...data.nouns, ...data.phrases];
        updateCard(); // Load the first card
    })
    .catch(error => {
        cardFront.textContent = "Error loading vocabulary. Check your JSON format!";
        console.error(error);
    });

// 2. Update the UI with the Current Card
function updateCard() {
    if (vocabulary.length === 0) return;
    
    // Reset the flip state for the new card
    isFlipped = false;
    card.classList.remove('flipped');
    
    // Clear previous color flags
    card.className = 'flashcard'; 

    const currentItem = vocabulary[currentIndex];

    // Check if the item is a Noun or a Phrase based on our JSON structure
    if (currentItem.word) {
        // It's a noun
        cardFront.textContent = currentItem.word;
        cardBack.innerHTML = `
            <div class="article">${currentItem.article} (pl: ${currentItem.plural})</div>
            <div class="english">${currentItem.english}</div>
        `;
        // Apply the correct color flag based on the article
        card.classList.add(`gender-${currentItem.article.toLowerCase()}`);
    } else if (currentItem.german) {
        // It's a phrase
        cardFront.textContent = currentItem.german;
        cardBack.innerHTML = `
            <div class="english">${currentItem.english}</div>
        `;
        // Apply the purple phrase flag
        card.classList.add('type-phrase');
    }
}

// 3. Interaction Logic (Clicking and Buttons)

function toggleFlip() {
    isFlipped = !isFlipped;
    card.classList.toggle('flipped');
}

// Flip when clicking the button OR the card itself
flipBtn.addEventListener('click', toggleFlip);
card.addEventListener('click', toggleFlip);

nextBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents the card from flipping when clicking the button
    currentIndex = (currentIndex + 1) % vocabulary.length; // Loops back to start
    updateCard();
});

prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Loops back to the end if going backwards from 0
    currentIndex = (currentIndex - 1 + vocabulary.length) % vocabulary.length; 
    updateCard();
});

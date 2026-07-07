// State Variables
let allVocabulary = [];      // Holds everything
let currentVocabulary = [];  // Holds just the selected unit
let currentIndex = 0;
let isFlipped = false;

// Connect to HTML Elements
const card = document.getElementById('card');
const cardFront = document.getElementById('card-front');
const cardBack = document.getElementById('card-back');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const flipBtn = document.getElementById('flip-btn');
const unitSelect = document.getElementById('unit-select'); // New dropdown

// 1. Fetch the Vocabulary Data
fetch('vocabulary.json')
    .then(response => response.json())
    .then(data => {
        allVocabulary = [...data.nouns, ...data.phrases];
        currentVocabulary = [...allVocabulary]; // Default to all cards
        
        populateDropdown();
        updateCard();
    })
    .catch(error => {
        cardFront.textContent = "Error loading vocabulary.";
        console.error(error);
    });

// 2. Build the Dropdown Menu
function populateDropdown() {
    // Extract unique categories from the data, ignoring items without a category
    const categories = [...new Set(allVocabulary.map(item => item.category).filter(Boolean))];
    
    // Add each category as an option in the dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        unitSelect.appendChild(option);
    });
}

// 3. Update the UI with the Current Card
function updateCard() {
    if (currentVocabulary.length === 0) {
        cardFront.textContent = "No cards in this unit.";
        cardBack.innerHTML = "";
        return;
    }
    
    isFlipped = false;
    card.classList.remove('flipped');
    card.className = 'flashcard'; 

    const currentItem = currentVocabulary[currentIndex];

    if (currentItem.word) {
        cardFront.textContent = currentItem.word;
        cardBack.innerHTML = `
            <div class="article">${currentItem.article} (pl: ${currentItem.plural})</div>
            <div class="english">${currentItem.english}</div>
        `;
        card.classList.add(`gender-${currentItem.article.toLowerCase()}`);
    } else if (currentItem.german) {
        cardFront.textContent = currentItem.german;
        cardBack.innerHTML = `
            <div class="english">${currentItem.english}</div>
        `;
        card.classList.add('type-phrase');
    }
}

// 4. Interaction Logic

function toggleFlip() {
    if (currentVocabulary.length === 0) return;
    isFlipped = !isFlipped;
    card.classList.toggle('flipped');
}

flipBtn.addEventListener('click', toggleFlip);
card.addEventListener('click', toggleFlip);

nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentVocabulary.length === 0) return;
    currentIndex = (currentIndex + 1) % currentVocabulary.length;
    updateCard();
});

prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentVocabulary.length === 0) return;
    currentIndex = (currentIndex - 1 + currentVocabulary.length) % currentVocabulary.length; 
    updateCard();
});

// 5. Handle Dropdown Changes
unitSelect.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    
    if (selectedCategory === 'all') {
        currentVocabulary = [...allVocabulary];
    } else {
        currentVocabulary = allVocabulary.filter(item => item.category === selectedCategory);
    }
    
    currentIndex = 0; // Go back to the first card of the new unit
    updateCard();
});

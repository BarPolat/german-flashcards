// State Variables
let allVocabulary = [];
let currentVocabulary = [];
let currentIndex = 0;
let isFlipped = false;

// Connect to HTML Elements
const card = document.getElementById('card');
const cardFront = document.getElementById('card-front');
const cardBack = document.getElementById('card-back');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const flipBtn = document.getElementById('flip-btn');
const unitSelect = document.getElementById('unit-select');

// 1. Fetch the Vocabulary Data
fetch('vocabulary.json')
    .then(response => response.json())
    .then(data => {
        // Safely combine nouns, phrases, and verbs (even if one is empty)
        const nouns = data.nouns || [];
        const phrases = data.phrases || [];
        const verbs = data.verbs || [];
        
        allVocabulary = [...nouns, ...phrases, ...verbs];
        currentVocabulary = [...allVocabulary];
        
        populateDropdown();
        updateCard();
    })
    .catch(error => {
        cardFront.textContent = "Error loading vocabulary. Check JSON formatting!";
        console.error(error);
    });

// 2. Build the Dropdown Menu
function populateDropdown() {
    const categories = [...new Set(allVocabulary.map(item => item.category).filter(Boolean))];
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
        // Noun Logic
        cardFront.textContent = currentItem.word;
        cardBack.innerHTML = `
            <div class="article">${currentItem.article} (pl: ${currentItem.plural})</div>
            <div class="english">${currentItem.english}</div>
        `;
        card.classList.add(`gender-${currentItem.article.toLowerCase()}`);
        
    } else if (currentItem.german) {
        // Phrase Logic
        cardFront.textContent = currentItem.german;
        cardBack.innerHTML = `
            <div class="english">${currentItem.english}</div>
        `;
        card.classList.add('type-phrase');
        
    } else if (currentItem.infinitive) {
        // Verb Logic - Formatting the conjugations into a clean grid
        cardFront.textContent = currentItem.infinitive;
        cardBack.innerHTML = `
            <div class="english" style="margin-bottom: 15px;">${currentItem.english}</div>
            
            <div style="font-size: 1rem; color: #aaaaaa; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; text-align: left; width: 80%;">
                <div>ich ${currentItem.conjugation.ich}</div>
                <div>wir ${currentItem.conjugation.wir}</div>
                <div>du ${currentItem.conjugation.du}</div>
                <div>ihr ${currentItem.conjugation.ihr}</div>
                <div>er/sie/es ${currentItem.conjugation["er/sie/es"]}</div>
                <div>sie/Sie ${currentItem.conjugation["sie/Sie"]}</div>
            </div>
            
            <div style="font-size: 1rem; color: #888888; margin-top: 10px; font-style: italic;">
                Perfekt: ${currentItem.conjugation.perfekt}
            </div>
            
            <div class="english" style="margin-top: 15px; font-size: 1.1rem; color: #e0e0e0;">
                "${currentItem.example}"
            </div>
        `;
        card.classList.add('type-verb');
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
    
    currentIndex = 0;
    updateCard();
});

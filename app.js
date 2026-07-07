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
const reverseCheckbox = document.getElementById('reverse-mode');

// --- Helper: Shuffle Array (Fisher-Yates Algorithm) ---
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 1. Fetch the Vocabulary Data
fetch('vocabulary.json')
    .then(response => response.json())
    .then(data => {
        const nouns = data.nouns || [];
        const phrases = data.phrases || [];
        const verbs = data.verbs || [];
        
        allVocabulary = [...nouns, ...phrases, ...verbs];
        
        // Shuffle the initial deck immediately
        currentVocabulary = shuffleArray(allVocabulary);
        
        populateDropdown();
        updateCard();
    })
    .catch(error => {
        cardFront.textContent = "Error loading vocabulary.";
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
    
    const isReverse = reverseCheckbox.checked;
    const currentItem = currentVocabulary[currentIndex];

    // Safely reset states without deleting the 'no-transition' freeze command
    isFlipped = false;
    card.classList.remove('flipped', 'gender-der', 'gender-die', 'gender-das', 'type-phrase', 'type-verb');

    if (currentItem.word) {
        // --- NOUN LOGIC ---
        if (isReverse) {
            cardFront.textContent = currentItem.english;
            cardBack.innerHTML = `
                <div class="article" style="font-weight: bold; font-size: 1.5rem; color: #e0e0e0;">
                    ${currentItem.article} ${currentItem.word}
                </div>
                <div class="english" style="margin-top: 5px;">(pl: ${currentItem.plural})</div>
            `;
        } else {
            cardFront.textContent = currentItem.word;
            cardBack.innerHTML = `
                <div class="article">${currentItem.article} (pl: ${currentItem.plural})</div>
                <div class="english">${currentItem.english}</div>
            `;
        }
        card.classList.add(`gender-${currentItem.article.toLowerCase()}`);
        
    } else if (currentItem.german) {
        // --- PHRASE LOGIC ---
        if (isReverse) {
            cardFront.textContent = currentItem.english;
            cardBack.innerHTML = `<div class="english" style="color: #e0e0e0; font-size: 1.3rem;">${currentItem.german}</div>`;
        } else {
            cardFront.textContent = currentItem.german;
            cardBack.innerHTML = `<div class="english">${currentItem.english}</div>`;
        }
        card.classList.add('type-phrase');
        
    } else if (currentItem.infinitive) {
        // --- VERB LOGIC ---
        if (isReverse) {
            cardFront.textContent = currentItem.english;
            cardBack.innerHTML = `
                <div class="english" style="margin-bottom: 15px; font-weight: bold; color: #e0e0e0; font-size: 1.5rem;">${currentItem.infinitive}</div>
                <div style="font-size: 1rem; color: #aaaaaa; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; text-align: left; width: 80%;">
                    <div>ich ${currentItem.conjugation.ich}</div>
                    <div>wir ${currentItem.conjugation.wir}</div>
                    <div>du ${currentItem.conjugation.du}</div>
                    <div>ihr ${currentItem.conjugation.ihr}</div>
                    <div>er/sie/es ${currentItem.conjugation["er/sie/es"]}</div>
                    <div>sie/Sie ${currentItem.conjugation["sie/Sie"]}</div>
                </div>
                <div class="english" style="margin-top: 15px; font-size: 1rem; color: #aaaaaa; font-style: italic;">
                    "${currentItem.example}"
                </div>
            `;
        } else {
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
        }
        card.classList.add('type-verb');
    }
}

// 4. Interaction Logic & Bug Fixes

function toggleFlip() {
    if (currentVocabulary.length === 0) return;
    isFlipped = !isFlipped;
    card.classList.toggle('flipped');
}

// --- The Bulletproof Instant Change Function ---
function changeCardInstantly(direction) {
    if (currentVocabulary.length === 0) return;
    
    // 1. Freeze the animation
    card.classList.add('no-transition');
    
    // 2. Change the index
    if (direction === 'next') {
        currentIndex = (currentIndex + 1) % currentVocabulary.length;
    } else {
        currentIndex = (currentIndex - 1 + currentVocabulary.length) % currentVocabulary.length;
    }
    
    // 3. Update the text (this also removes the 'flipped' class)
    updateCard();
    
    // 4. Force the browser to draw the card right now
    void card.offsetWidth;
    
    // 5. Turn animations back on a tiny millisecond later so the flip works next time
    setTimeout(() => {
        card.classList.remove('no-transition');
    }, 50);
}

flipBtn.addEventListener('click', toggleFlip);
card.addEventListener('click', toggleFlip);

nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    changeCardInstantly('next');
});

prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    changeCardInstantly('prev');
});

// 5. Handle Settings Changes (Dropdown & Reverse Mode)
unitSelect.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    
    if (selectedCategory === 'all') {
        currentVocabulary = shuffleArray(allVocabulary);
    } else {
        const filtered = allVocabulary.filter(item => item.category === selectedCategory);
        currentVocabulary = shuffleArray(filtered);
    }
    
    currentIndex = 0;
    changeCardInstantly('stay'); // Instantly reset to the first card of the new category
});

reverseCheckbox.addEventListener('change', () => {
    changeCardInstantly('stay'); // Instantly update the current card to the new mode
});
